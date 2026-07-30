"use server";

import { db } from "@/lib/db";
import { 
  sale, 
  saleItem, 
  product, 
  stockEvent, 
  cashSession, 
  customer, 
  shiftStockCount, 
  user,
  business
} from "@/lib/db/schema";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { eq, and, gte, lte, desc, sql } from "drizzle-orm";
import { startOfDay, endOfDay, parseISO, format } from "date-fns";

/**
 * Owner Reports Server Action — Full business financial & inventory accountability report
 */
export async function getOwnerReportsDataAction(startDateStr: string, endDateStr: string) {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user) return { error: "Unauthorized" };
  const businessId = (session.user as any).businessId;
  if (!businessId) return { error: "No business linked to account." };

  try {
    const biz = await db.query.business.findFirst({
      where: eq(business.id, businessId),
      columns: { name: true, currency: true }
    });

    const start = startOfDay(parseISO(startDateStr));
    const end = endOfDay(parseISO(endDateStr));

    // 1. Fetch Sales in Date Range
    const salesList = await db.query.sale.findMany({
      where: and(
        eq(sale.businessId, businessId),
        gte(sale.createdAt, start),
        lte(sale.createdAt, end)
      ),
      orderBy: [desc(sale.createdAt)]
    });

    const saleIds = salesList.map(s => s.id);
    let itemsList: any[] = [];
    if (saleIds.length > 0) {
      itemsList = await db.query.saleItem.findMany({
        where: sql`${saleItem.saleId} IN ${saleIds}`
      });
    }

    // Products & Staff lookups
    const productsList = await db.query.product.findMany({
      where: eq(product.businessId, businessId)
    });
    const staffMembers = await db.query.user.findMany({
      where: eq(user.businessId, businessId),
      columns: { id: true, name: true, role: true }
    });
    const customersList = await db.query.customer.findMany({
      where: eq(customer.businessId, businessId),
      columns: { id: true, name: true }
    });

    const prodMap = new Map(productsList.map(p => [p.id, p]));
    const staffMap = new Map(staffMembers.map(u => [u.id, u.name]));
    const customerMap = new Map(customersList.map(c => [c.id, c.name]));

    // 2. Summary Metrics Calculations
    const totalRevenue = salesList.reduce((sum, s) => sum + s.total, 0);
    const totalSalesCount = salesList.length;

    let totalCogs = 0;
    const saleItemsMap = new Map<string, any[]>();
    itemsList.forEach(i => {
      totalCogs += (i.quantity * i.costAtSale);
      if (!saleItemsMap.has(i.saleId)) saleItemsMap.set(i.saleId, []);
      saleItemsMap.get(i.saleId)!.push({
        productName: prodMap.get(i.productId)?.name || "Product",
        quantity: i.quantity,
        priceAtSale: i.priceAtSale
      });
    });

    const grossProfit = Math.max(0, totalRevenue - totalCogs);

    // 3. Waste Value in Range
    const wasteEvents = await db.query.stockEvent.findMany({
      where: and(
        eq(stockEvent.businessId, businessId),
        eq(stockEvent.type, "waste"),
        gte(stockEvent.createdAt, start),
        lte(stockEvent.createdAt, end)
      )
    });
    const totalWasteValue = wasteEvents.reduce((sum, w) => {
      const p = prodMap.get(w.productId);
      return sum + (w.quantity * (p?.costPrice || 0));
    }, 0);

    // 4. Cash Sessions & Variances in Range
    const cashSessionsList = await db.query.cashSession.findMany({
      where: and(
        eq(cashSession.businessId, businessId),
        gte(cashSession.date, start),
        lte(cashSession.date, end)
      )
    });
    const closedSessions = cashSessionsList.filter(s => s.closedAt !== null);
    const cashVarianceSum = closedSessions.reduce((sum, s) => sum + (s.variance || 0), 0);

    // Stock Variances in Range
    const sessionIds = cashSessionsList.map(s => s.id);
    let stockVarianceSum = 0;
    const sessionStockCountsMap = new Map<string, any[]>();
    if (sessionIds.length > 0) {
      const counts = await db.query.shiftStockCount.findMany({
        where: sql`${shiftStockCount.cashSessionId} IN ${sessionIds}`
      });
      counts.forEach(sc => {
        const p = prodMap.get(sc.productId);
        const cost = p?.costPrice || 0;
        stockVarianceSum += ((sc.closingVarianceQty ?? 0) * cost);

        if (!sessionStockCountsMap.has(sc.cashSessionId)) {
          sessionStockCountsMap.set(sc.cashSessionId, []);
        }
        sessionStockCountsMap.get(sc.cashSessionId)!.push(sc);
      });
    }

    // 5. Detailed Sales Rows
    const detailedSales = salesList.map(s => ({
      id: s.id,
      date: format(new Date(s.createdAt), "MMM dd, yyyy · HH:mm"),
      staffName: staffMap.get(s.staffId) || "Staff",
      customerName: s.customerId ? customerMap.get(s.customerId) || null : null,
      paymentType: s.paymentType,
      total: s.total,
      itemsSummary: (saleItemsMap.get(s.id) || [])
        .map(i => `${i.quantity}× ${i.productName}`)
        .join(", ")
    }));

    // 6. Staff Breakdown (Accountability View)
    const staffBreakdownMap = new Map<string, {
      staffId: string;
      staffName: string;
      totalSalesCount: number;
      totalRevenue: number;
      cashVarianceSum: number;
      stockVarianceSum: number;
      shiftsCount: number;
    }>();

    // Initialize map for staff members
    staffMembers.forEach(st => {
      staffBreakdownMap.set(st.id, {
        staffId: st.id,
        staffName: st.name,
        totalSalesCount: 0,
        totalRevenue: 0,
        cashVarianceSum: 0,
        stockVarianceSum: 0,
        shiftsCount: 0
      });
    });

    salesList.forEach(s => {
      const entry = staffBreakdownMap.get(s.staffId);
      if (entry) {
        entry.totalSalesCount += 1;
        entry.totalRevenue += s.total;
      }
    });

    closedSessions.forEach(cs => {
      const entry = staffBreakdownMap.get(cs.staffId);
      if (entry) {
        entry.shiftsCount += 1;
        entry.cashVarianceSum += (cs.variance || 0);

        const scs = sessionStockCountsMap.get(cs.id) || [];
        scs.forEach(sc => {
          const cost = prodMap.get(sc.productId)?.costPrice || 0;
          entry.stockVarianceSum += ((sc.closingVarianceQty ?? 0) * cost);
        });
      }
    });

    const staffBreakdown = Array.from(staffBreakdownMap.values())
      .filter(st => st.totalSalesCount > 0 || st.shiftsCount > 0);

    // 7. Product Breakdown (Top Sellers)
    const productStatsMap = new Map<string, {
      productId: string;
      productName: string;
      unit: string;
      quantitySold: number;
      revenueGenerated: number;
    }>();

    itemsList.forEach(i => {
      const p = prodMap.get(i.productId);
      const name = p?.name || "Product";
      const unit = p?.unit || "each";
      if (!productStatsMap.has(i.productId)) {
        productStatsMap.set(i.productId, {
          productId: i.productId,
          productName: name,
          unit,
          quantitySold: 0,
          revenueGenerated: 0
        });
      }
      const pStat = productStatsMap.get(i.productId)!;
      pStat.quantitySold += i.quantity;
      pStat.revenueGenerated += (i.quantity * i.priceAtSale);
    });

    const productBreakdown = Array.from(productStatsMap.values());
    const topByRevenue = [...productBreakdown].sort((a, b) => b.revenueGenerated - a.revenueGenerated).slice(0, 5);
    const topByQuantity = [...productBreakdown].sort((a, b) => b.quantitySold - a.quantitySold).slice(0, 5);

    return {
      businessName: biz?.name || "Ledgr Business",
      currency: biz?.currency || "NGN",
      totalRevenue,
      totalCogs,
      grossProfit,
      totalSalesCount,
      totalWasteValue,
      cashVarianceSum,
      stockVarianceSum,
      detailedSales,
      staffBreakdown,
      topByRevenue,
      topByQuantity
    };
  } catch (error: any) {
    console.error("Error generating owner report data:", error);
    return { error: error.message || "Failed to generate report data." };
  }
}

/**
 * Staff "My History" Server Action — Scoped strictly to session user ID + business ID
 */
export async function getStaffMyHistoryAction(startDateStr?: string, endDateStr?: string) {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user) return { error: "Unauthorized" };
  const staffId = session.user.id;
  const businessId = (session.user as any).businessId;

  if (!businessId || !staffId) return { error: "Invalid session credentials." };

  try {
    const biz = await db.query.business.findFirst({
      where: eq(business.id, businessId),
      columns: { currency: true }
    });

    let start = startOfDay(parseISO(startDateStr || format(new Date(), "yyyy-MM-01")));
    let end = endOfDay(parseISO(endDateStr || format(new Date(), "yyyy-MM-dd")));

    // Hard-scoped database query on BOTH businessId and staffId
    const mySessions = await db.query.cashSession.findMany({
      where: and(
        eq(cashSession.businessId, businessId),
        eq(cashSession.staffId, staffId), // Strict user-level isolation
        gte(cashSession.date, start),
        lte(cashSession.date, end)
      ),
      orderBy: [desc(cashSession.date)]
    });

    const mySessionIds = mySessions.map(s => s.id);
    let myStockCountsMap = new Map<string, number>();
    if (mySessionIds.length > 0) {
      const productsList = await db.query.product.findMany({
        where: eq(product.businessId, businessId),
        columns: { id: true, costPrice: true }
      });
      const costMap = new Map(productsList.map(p => [p.id, p.costPrice || 0]));

      const counts = await db.query.shiftStockCount.findMany({
        where: sql`${shiftStockCount.cashSessionId} IN ${mySessionIds}`
      });

      counts.forEach(sc => {
        const cost = costMap.get(sc.productId) || 0;
        const currentSum = myStockCountsMap.get(sc.cashSessionId) || 0;
        myStockCountsMap.set(sc.cashSessionId, currentSum + ((sc.closingVarianceQty ?? 0) * cost));
      });
    }

    // Sales logged during each shift by this staff member
    const mySales = await db.query.sale.findMany({
      where: and(
        eq(sale.businessId, businessId),
        eq(sale.staffId, staffId),
        gte(sale.createdAt, start),
        lte(sale.createdAt, end)
      ),
      columns: { id: true, total: true, createdAt: true }
    });

    const historyList = mySessions.map(s => {
      const shiftStart = new Date(s.date);
      const shiftEnd = s.closedAt ? new Date(s.closedAt) : null;
      
      // Filter sales logged between shift open and shift close
      const shiftSales = mySales.filter(sa => {
        const saTime = new Date(sa.createdAt);
        return saTime >= shiftStart && (!shiftEnd || saTime <= shiftEnd);
      });

      const salesCount = shiftSales.length;
      const salesTotal = shiftSales.reduce((sum, sa) => sum + sa.total, 0);

      return {
        id: s.id,
        dateFormatted: format(shiftStart, "EEE, MMM dd, yyyy"),
        timeWindow: `${format(shiftStart, "HH:mm")} - ${shiftEnd ? format(shiftEnd, "HH:mm") : "Active Shift"}`,
        openingFloat: s.openingFloat,
        expectedCash: s.expectedCash,
        countedCash: s.countedCash,
        cashVariance: s.variance,
        stockVarianceValue: myStockCountsMap.get(s.id) || 0,
        salesCount,
        salesTotal,
        isClosed: s.closedAt !== null
      };
    });

    return {
      currency: biz?.currency || "NGN",
      history: historyList
    };
  } catch (error: any) {
    console.error("Error fetching staff shift history:", error);
    return { error: error.message || "Failed to load shift history." };
  }
}
