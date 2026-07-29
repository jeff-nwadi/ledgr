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
  user 
} from "@/lib/db/schema";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { eq, and, gte, desc, sql } from "drizzle-orm";
import { startOfDay, endOfDay, subDays, format } from "date-fns";

export async function getOwnerAnalyticsAction() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user) return { error: "Unauthorized" };
  const businessId = (session.user as any).businessId;
  if (!businessId) return { error: "No business linked to account." };

  try {
    const today = new Date();
    const startOfToday = startOfDay(today);
    const endOfToday = endOfDay(today);

    // 1. Sales & Revenue
    const sales = await db.query.sale.findMany({
      where: eq(sale.businessId, businessId),
      columns: { id: true, total: true, paymentType: true, createdAt: true }
    });

    const grossVolume = sales.reduce((sum, s) => sum + s.total, 0);

    // 2. COGS (Cost of Goods Sold)
    const saleIds = sales.map(s => s.id);
    let cogsTotal = 0;
    if (saleIds.length > 0) {
      const items = await db.query.saleItem.findMany({
        where: sql`${saleItem.saleId} IN ${saleIds}`,
        columns: { quantity: true, costAtSale: true }
      });
      cogsTotal = items.reduce((sum, i) => sum + (i.quantity * i.costAtSale), 0);
    }
    const netVolume = Math.max(0, grossVolume - cogsTotal);

    // 3. Product Inventory & Stock Value
    const products = await db.query.product.findMany({
      where: eq(product.businessId, businessId),
    });
    const stockValue = products.reduce((sum, p) => sum + (p.currentStock * (p.costPrice || 0)), 0);

    // 4. Waste Value
    const wasteEvents = await db.query.stockEvent.findMany({
      where: and(
        eq(stockEvent.businessId, businessId),
        eq(stockEvent.type, "waste")
      ),
      columns: { productId: true, quantity: true }
    });

    const productCostMap = new Map(products.map(p => [p.id, p.costPrice || 0]));
    const wasteValue = wasteEvents.reduce((sum, w) => {
      const cost = productCostMap.get(w.productId) || 0;
      return sum + (w.quantity * cost);
    }, 0);

    // 5. Customers & Debt Balance
    const customerList = await db.query.customer.findMany({
      where: eq(customer.businessId, businessId),
      columns: { id: true, balanceOwed: true }
    });
    const totalCustomers = customerList.length;
    const customerDebtTotal = customerList.reduce((sum, c) => sum + (c.balanceOwed || 0), 0);

    // 6. Today's Close-out Variances
    const todaySessions = await db.query.cashSession.findMany({
      where: and(
        eq(cashSession.businessId, businessId),
        gte(cashSession.date, startOfToday)
      )
    });

    const closedTodaySessions = todaySessions.filter(s => s.closedAt !== null);
    const todayCashVariance = closedTodaySessions.reduce((sum, s) => sum + (s.variance || 0), 0);

    // Stock Variance Today
    const sessionIds = todaySessions.map(s => s.id);
    let todayStockVarianceValue = 0;
    if (sessionIds.length > 0) {
      const counts = await db.query.shiftStockCount.findMany({
        where: sql`${shiftStockCount.cashSessionId} IN ${sessionIds}`
      });
      todayStockVarianceValue = counts.reduce((sum, sc) => {
        const cost = productCostMap.get(sc.productId) || 0;
        return sum + ((sc.closingVarianceQty ?? 0) * cost);
      }, 0);
    }

    // 7. Last 14 Days Revenue Trend for Chart
    const fourteenDaysAgo = subDays(today, 14);
    const recentSales = sales.filter(s => new Date(s.createdAt) >= fourteenDaysAgo);
    
    // Group sales by day
    const dateRevenueMap: Record<string, number> = {};
    for (let i = 13; i >= 0; i--) {
      const d = subDays(today, i);
      const key = format(d, "MMM dd");
      dateRevenueMap[key] = 0;
    }

    recentSales.forEach(s => {
      const key = format(new Date(s.createdAt), "MMM dd");
      if (dateRevenueMap[key] !== undefined) {
        dateRevenueMap[key] += s.total;
      }
    });

    const revenueChartData = Object.entries(dateRevenueMap).map(([date, revenue]) => ({
      date,
      revenue
    }));

    // 8. Business-wide Recent Activity Feed
    const allStockEvents = await db.query.stockEvent.findMany({
      where: eq(stockEvent.businessId, businessId),
      orderBy: [desc(stockEvent.createdAt)],
      limit: 10
    });

    const staffMembers = await db.query.user.findMany({
      where: eq(user.businessId, businessId),
      columns: { id: true, name: true }
    });
    const staffNameMap = new Map(staffMembers.map(u => [u.id, u.name]));
    const productNameMap = new Map(products.map(p => [p.id, p.name]));

    const recentActivities = allStockEvents.map(e => {
      const staffName = staffNameMap.get(e.createdBy) || "Staff";
      const prodName = productNameMap.get(e.productId) || "Product";
      const timeStr = format(new Date(e.createdAt), "HH:mm, MMM dd");

      let title = "";
      let detail = "";

      if (e.type === "sale") {
        title = `Sale logged by ${staffName}`;
        detail = `${e.quantity} unit(s) of ${prodName}`;
      } else if (e.type === "waste") {
        title = `Waste logged by ${staffName}`;
        detail = `${e.quantity} unit(s) of ${prodName} (${e.reason || "spoiled"})`;
      } else if (e.type === "restock") {
        title = `Restock by ${staffName}`;
        detail = `Added ${e.quantity} unit(s) of ${prodName}`;
      } else if (e.type === "opening_count") {
        title = `Opening Count by ${staffName}`;
        detail = `Confirmed shelf count for ${prodName}`;
      } else {
        title = `Stock Event by ${staffName}`;
        detail = `${e.type}: ${e.quantity} ${prodName}`;
      }

      return {
        id: e.id,
        title,
        detail,
        createdAt: timeStr
      };
    });

    return {
      hasProducts: products.length > 0,
      grossVolume,
      netVolume,
      cogsTotal,
      stockValue,
      wasteValue,
      totalCustomers,
      customerDebtTotal,
      todayCashVariance,
      todayStockVarianceValue,
      hasClosedShiftToday: closedTodaySessions.length > 0,
      hasActiveShift: todaySessions.some(s => s.closedAt === null),
      revenueChartData,
      recentActivities
    };
  } catch (error: any) {
    console.error("Error fetching owner analytics:", error);
    return { error: error.message || "Failed to load owner analytics." };
  }
}

export async function exportReportsCsvAction(startDateStr: string, endDateStr: string) {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user) return { error: "Unauthorized" };
  const businessId = (session.user as any).businessId;
  if (!businessId) return { error: "No business linked to account." };

  try {
    const { parseISO } = await import("date-fns");
    const { lte } = await import("drizzle-orm");

    const start = startOfDay(parseISO(startDateStr));
    const end = endOfDay(parseISO(endDateStr));

    const salesList = await db.query.sale.findMany({
      where: and(
        eq(sale.businessId, businessId),
        gte(sale.createdAt, start),
        lte(sale.createdAt, end)
      )
    });

    const saleIds = salesList.map(s => s.id);
    let items: any[] = [];
    if (saleIds.length > 0) {
      items = await db.query.saleItem.findMany({
        where: sql`${saleItem.saleId} IN ${saleIds}`
      });
    }

    const products = await db.query.product.findMany({
      where: eq(product.businessId, businessId)
    });
    const prodMap = new Map(products.map(p => [p.id, p.name]));
    const saleDateMap = new Map(salesList.map(s => [s.id, format(new Date(s.createdAt), "yyyy-MM-dd")]));

    const summaryMap = new Map<string, { date: string; product: string; qty: number; revenue: number; cost: number; profit: number }>();

    items.forEach(i => {
      const dateStr = saleDateMap.get(i.saleId) || format(new Date(), "yyyy-MM-dd");
      const prodName = prodMap.get(i.productId) || "Unknown Item";
      const key = `${dateStr}_${i.productId}`;
      const rev = i.quantity * i.priceAtSale;
      const cost = i.quantity * i.costAtSale;
      const profit = rev - cost;

      if (summaryMap.has(key)) {
        const existing = summaryMap.get(key)!;
        existing.qty += i.quantity;
        existing.revenue += rev;
        existing.cost += cost;
        existing.profit += profit;
      } else {
        summaryMap.set(key, {
          date: dateStr,
          product: prodName,
          qty: i.quantity,
          revenue: rev,
          cost,
          profit
        });
      }
    });

    const header = "Date,Product,Qty Sold,Revenue (NGN),Cost (NGN),Profit (NGN)";
    const rows = Array.from(summaryMap.values()).map(
      r => `"${r.date}","${r.product.replace(/"/g, '""')}",${r.qty},${r.revenue},${r.cost},${r.profit}`
    );

    const csvContent = [header, ...rows].join("\r\n");
    return { csvContent };
  } catch (error: any) {
    console.error("Error generating reports CSV:", error);
    return { error: error.message || "Failed to generate CSV export." };
  }
}

