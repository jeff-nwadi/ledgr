"use server";

import { db } from "@/lib/db";
import { 
  cashSession, 
  shiftStockCount, 
  product, 
  sale, 
  saleItem, 
  stockEvent, 
  customer, 
  customerDebtEvent, 
  dailyStockLedger,
  user,
  business
} from "@/lib/db/schema";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { eq, and, isNull, desc, sql, or, gte } from "drizzle-orm";
import crypto from "crypto";

/**
 * Validates current session and returns staff user ID and tenant business ID.
 */
async function getStaffContext() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user) throw new Error("Unauthorized");
  
  const staffId = session.user.id;
  let businessId = (session.user as any).businessId;
  let role = (session.user as any).role;

  if (!businessId || !role) {
    const dbUser = await db.query.user.findFirst({
      where: eq(user.id, staffId),
      columns: { businessId: true, role: true }
    });
    if (dbUser) {
      businessId = dbUser.businessId;
      role = dbUser.role;
    }
  }

  if (!businessId) throw new Error("No business context found");

  return { staffId, businessId, role: role || "staff", user: session.user };
}

/**
 * Gets active shift (cash_session with closedAt IS NULL) for staff member.
 * Calculates expected opening stock for active products.
 */
export async function getActiveShiftAction() {
  try {
    const { staffId, businessId } = await getStaffContext();

    const activeSession = await db.query.cashSession.findFirst({
      where: and(
        eq(cashSession.businessId, businessId),
        eq(cashSession.staffId, staffId),
        isNull(cashSession.closedAt)
      ),
    });

    // Fetch active products
    const products = await db.query.product.findMany({
      where: and(
        eq(product.businessId, businessId),
        eq(product.status, "active")
      ),
      columns: {
        id: true,
        name: true,
        unit: true,
        sellingPrice: true,
        currentStock: true,
        lowStockThreshold: true,
        category: true,
      }
    });

    // For each product, calculate expected opening quantity from prior shift/ledger or currentStock
    const productsWithExpectedOpening = await Promise.all(
      products.map(async (prod) => {
        let expectedOpeningQty = prod.currentStock;

        // Check most recent shift count for this product
        const lastShiftCount = await db.query.shiftStockCount.findFirst({
          where: and(
            eq(shiftStockCount.businessId, businessId),
            eq(shiftStockCount.productId, prod.id)
          ),
          orderBy: [desc(shiftStockCount.createdAt)]
        });

        if (lastShiftCount) {
          if (lastShiftCount.countedClosingQty !== null && lastShiftCount.countedClosingQty !== undefined) {
            expectedOpeningQty = lastShiftCount.countedClosingQty;
          } else if (lastShiftCount.calculatedClosingQty !== null && lastShiftCount.calculatedClosingQty !== undefined) {
            expectedOpeningQty = lastShiftCount.calculatedClosingQty;
          } else if (lastShiftCount.countedOpeningQty !== null && lastShiftCount.countedOpeningQty !== undefined) {
            expectedOpeningQty = lastShiftCount.countedOpeningQty;
          }
        }

        return {
          ...prod,
          expectedOpeningQty,
        };
      })
    );

    if (!activeSession) {
      return {
        activeShift: null,
        products: productsWithExpectedOpening,
      };
    }

    // Fetch shift sales running totals
    const sessionStartTime = new Date(new Date(activeSession.date).getTime() - 60000);
    const shiftSales = await db.query.sale.findMany({
      where: and(
        eq(sale.businessId, businessId),
        eq(sale.staffId, staffId),
        gte(sale.createdAt, sessionStartTime)
      ),
      columns: { total: true, paymentType: true }
    });

    const totalSalesAmount = shiftSales.reduce((acc, s) => acc + s.total, 0);
    // Non-credit sales ("paid", "cash", "transfer", etc.) drive expected cash
    const paidSalesAmount = shiftSales.filter(s => s.paymentType !== "credit").reduce((acc, s) => acc + s.total, 0);

    // Fetch current shift stock counts
    const currentShiftCounts = await db.query.shiftStockCount.findMany({
      where: eq(shiftStockCount.cashSessionId, activeSession.id)
    });

    const totalUnitsSold = currentShiftCounts.reduce((acc, sc) => acc + sc.soldQty, 0);

    const productMap = new Map(productsWithExpectedOpening.map(p => [p.id, p]));
    const productSalesBreakdown = currentShiftCounts.map(sc => {
      const p = productMap.get(sc.productId);
      return {
        productId: sc.productId,
        productName: p?.name || "Product",
        unit: p?.unit || "unit",
        soldQty: sc.soldQty,
        addedQty: sc.addedQty,
        wasteQty: sc.wasteQty,
        openingQty: sc.countedOpeningQty,
        currentStock: p?.currentStock ?? 0,
        sellingPrice: p?.sellingPrice ?? 0,
        totalRevenue: sc.soldQty * (p?.sellingPrice ?? 0),
      };
    });

    return {
      activeShift: {
        ...activeSession,
        date: activeSession.date.toISOString(),
        totalSalesAmount,
        expectedCash: paidSalesAmount, // No float baseline added
        openingCountCompleted: activeSession.openingCountCompleted,
        totalUnitsSold,
        productSalesBreakdown,
      },
      products: productsWithExpectedOpening,
      shiftStockCounts: currentShiftCounts.map(sc => ({
        ...sc,
        createdAt: sc.createdAt.toISOString(),
        updatedAt: sc.updatedAt.toISOString(),
      })),
    };
  } catch (error: any) {
    return { error: error.message || "Failed to fetch active shift" };
  }
}

/**
 * Fetches staff-accessible products.
 */
export async function getStaffProductsAction() {
  try {
    const { businessId } = await getStaffContext();

    const products = await db.query.product.findMany({
      where: and(
        eq(product.businessId, businessId),
        eq(product.status, "active")
      ),
      columns: {
        id: true,
        name: true,
        unit: true,
        sellingPrice: true,
        currentStock: true,
        lowStockThreshold: true,
        category: true,
      }
    });

    return { products };
  } catch (error: any) {
    return { error: error.message || "Failed to load products" };
  }
}

/**
 * Submits physical Opening Stock Count to start or initialize a shift.
 * Source of truth for shift opening stock is the staff's physical count.
 */
export async function submitOpeningStockCountAction(stockCounts: Record<string, number>) {
  try {
    const { staffId, businessId } = await getStaffContext();

    // 1. Get or create active cashSession for today
    let activeSession = await db.query.cashSession.findFirst({
      where: and(
        eq(cashSession.businessId, businessId),
        eq(cashSession.staffId, staffId),
        isNull(cashSession.closedAt)
      ),
    });

    const now = new Date();

    if (!activeSession) {
      const sessionId = `cs_${crypto.randomUUID()}`;
      await db.insert(cashSession).values({
        id: sessionId,
        businessId,
        staffId,
        date: now,
        openingFloat: 0,
        openingCountCompleted: true,
        expectedCash: 0,
      });

      activeSession = await db.query.cashSession.findFirst({
        where: eq(cashSession.id, sessionId)
      });
    } else {
      await db.update(cashSession)
        .set({ openingCountCompleted: true })
        .where(eq(cashSession.id, activeSession.id));
    }

    if (!activeSession) return { error: "Failed to initialize shift session." };

    // 2. Fetch active products
    const activeProducts = await db.query.product.findMany({
      where: and(
        eq(product.businessId, businessId),
        eq(product.status, "active")
      ),
    });

    // 3. Reconcile opening stock for each product
    for (const prod of activeProducts) {
      let expectedOpeningQty = prod.currentStock;

      const lastShiftCount = await db.query.shiftStockCount.findFirst({
        where: and(
          eq(shiftStockCount.businessId, businessId),
          eq(shiftStockCount.productId, prod.id)
        ),
        orderBy: [desc(shiftStockCount.createdAt)]
      });

      if (lastShiftCount) {
        if (lastShiftCount.countedClosingQty !== null && lastShiftCount.countedClosingQty !== undefined) {
          expectedOpeningQty = lastShiftCount.countedClosingQty;
        } else if (lastShiftCount.calculatedClosingQty !== null && lastShiftCount.calculatedClosingQty !== undefined) {
          expectedOpeningQty = lastShiftCount.calculatedClosingQty;
        }
      }

      const countedOpeningQty = stockCounts[prod.id] !== undefined ? Math.max(0, stockCounts[prod.id]) : expectedOpeningQty;
      const openingVarianceQty = countedOpeningQty - expectedOpeningQty;

      // Check existing shiftStockCount for this session & product
      const existingCount = await db.query.shiftStockCount.findFirst({
        where: and(
          eq(shiftStockCount.cashSessionId, activeSession.id),
          eq(shiftStockCount.productId, prod.id)
        )
      });

      if (existingCount) {
        await db.update(shiftStockCount)
          .set({
            expectedOpeningQty,
            countedOpeningQty,
            openingVarianceQty,
            updatedAt: now,
          })
          .where(eq(shiftStockCount.id, existingCount.id));
      } else {
        await db.insert(shiftStockCount).values({
          id: `ssc_${crypto.randomUUID()}`,
          cashSessionId: activeSession.id,
          businessId,
          productId: prod.id,
          expectedOpeningQty,
          countedOpeningQty,
          openingVarianceQty,
          addedQty: 0,
          soldQty: 0,
          wasteQty: 0,
          calculatedClosingQty: countedOpeningQty,
          createdAt: now,
          updatedAt: now,
        });
      }

      // Update product current stock to physical counted opening stock (source of truth)
      await db.update(product)
        .set({ currentStock: countedOpeningQty })
        .where(eq(product.id, prod.id));

      // Log stock_event if there is an opening variance
      if (openingVarianceQty !== 0) {
        await db.insert(stockEvent).values({
          id: `se_${crypto.randomUUID()}`,
          productId: prod.id,
          businessId,
          type: "opening_count",
          quantity: openingVarianceQty,
          note: `Shift opening count reconciliation (Expected: ${expectedOpeningQty}, Counted: ${countedOpeningQty})`,
          createdBy: staffId,
          createdAt: now,
        });
      }
    }

    revalidatePath("/owner");
    revalidatePath("/staff");
    return { success: true };
  } catch (error: any) {
    console.error("Submit opening stock count error:", error);
    return { error: error.message || "Failed to submit opening stock count." };
  }
}

/**
 * Quick-adds a new customer for credit sales.
 */
export async function quickAddCustomerAction(name: string, phone?: string) {
  try {
    const { businessId } = await getStaffContext();
    const cleanName = (name || "").trim();

    if (!cleanName) return { error: "Customer name is required." };

    const newCust = {
      id: `cust_${crypto.randomUUID()}`,
      businessId,
      name: cleanName,
      phone: (phone || "").trim() || null,
      balanceOwed: 0,
    };

    await db.insert(customer).values(newCust);
    return { success: true, customer: newCust };
  } catch (error: any) {
    return { error: error.message || "Failed to add customer" };
  }
}

/**
 * Searches customers for credit sales.
 */
export async function searchCustomersAction(query: string) {
  try {
    const { businessId } = await getStaffContext();

    const customers = await db.query.customer.findMany({
      where: eq(customer.businessId, businessId),
      columns: { id: true, name: true, phone: true, balanceOwed: true }
    });

    return { customers };
  } catch (error: any) {
    return { error: error.message || "Failed to search customers" };
  }
}

/**
 * Logs a sale during active shift. Payment types: 'paid' (cash/transfer) or 'credit'.
 * Supports single product or multi-item cart sales.
 */
export async function logSaleAction(data: {
  items?: { productId: string; quantity: number }[];
  productId?: string;
  quantity?: number;
  paymentType: "paid" | "credit" | "cash" | "other";
  customerId?: string;
  newCustomer?: { name: string; phone?: string };
}) {
  try {
    const { staffId, businessId } = await getStaffContext();

    const activeSession = await db.query.cashSession.findFirst({
      where: and(
        eq(cashSession.businessId, businessId),
        eq(cashSession.staffId, staffId),
        isNull(cashSession.closedAt)
      ),
    });

    if (!activeSession) return { error: "No active shift found. Please count stock to start a shift." };
    if (!activeSession.openingCountCompleted) {
      return { error: "Opening stock count is required before logging sales." };
    }

    // Standardize cart items input
    let saleItemsInput: { productId: string; quantity: number }[] = [];
    if (data.items && data.items.length > 0) {
      saleItemsInput = data.items;
    } else if (data.productId && data.quantity && data.quantity > 0) {
      saleItemsInput = [{ productId: data.productId, quantity: data.quantity }];
    }

    if (saleItemsInput.length === 0) {
      return { error: "Cart is empty. Select at least one item." };
    }

    let targetCustomerId = data.customerId;
    const isCredit = data.paymentType === "credit";
    const normalizedPaymentType = isCredit ? "credit" : "paid";

    if (isCredit && !targetCustomerId && data.newCustomer?.name) {
      const custRes = await quickAddCustomerAction(data.newCustomer.name, data.newCustomer.phone);
      if (custRes.error || !custRes.customer) return { error: custRes.error || "Failed to create customer" };
      targetCustomerId = custRes.customer.id;
    }

    if (isCredit && !targetCustomerId) {
      return { error: "Credit sales require selecting or adding a customer." };
    }

    const now = new Date();
    let totalSaleAmount = 0;

    // Validate products and compute total amount
    const validatedItems: { prod: any; quantity: number; priceAtSale: number; costAtSale: number }[] = [];
    for (const item of saleItemsInput) {
      if (item.quantity <= 0) continue;
      const prod = await db.query.product.findFirst({
        where: and(eq(product.id, item.productId), eq(product.businessId, businessId))
      });
      if (!prod) return { error: `Product not found.` };

      const priceAtSale = prod.sellingPrice;
      const costAtSale = prod.costPrice || 0;
      totalSaleAmount += priceAtSale * item.quantity;
      validatedItems.push({ prod, quantity: item.quantity, priceAtSale, costAtSale });
    }

    if (validatedItems.length === 0) {
      return { error: "No valid items in cart." };
    }

    // Create Sale Header
    const saleId = `sale_${crypto.randomUUID()}`;
    await db.insert(sale).values({
      id: saleId,
      businessId,
      staffId,
      customerId: targetCustomerId || null,
      paymentType: normalizedPaymentType,
      total: totalSaleAmount,
      createdAt: now,
    });

    // Create Sale Items & Stock Events
    for (const { prod, quantity, priceAtSale, costAtSale } of validatedItems) {
      await db.insert(saleItem).values({
        id: `sitem_${crypto.randomUUID()}`,
        saleId,
        productId: prod.id,
        quantity,
        priceAtSale,
        costAtSale,
      });

      await db.insert(stockEvent).values({
        id: `se_${crypto.randomUUID()}`,
        productId: prod.id,
        businessId,
        type: "sale",
        quantity,
        createdBy: staffId,
        createdAt: now,
      });

      // Update shift_stock_count
      const shiftCount = await db.query.shiftStockCount.findFirst({
        where: and(
          eq(shiftStockCount.cashSessionId, activeSession.id),
          eq(shiftStockCount.productId, prod.id)
        )
      });

      if (shiftCount) {
        const newSold = shiftCount.soldQty + quantity;
        const newCalc = shiftCount.countedOpeningQty + shiftCount.addedQty - newSold - shiftCount.wasteQty;
        await db.update(shiftStockCount)
          .set({ soldQty: newSold, calculatedClosingQty: newCalc, updatedAt: now })
          .where(eq(shiftStockCount.id, shiftCount.id));
      }

      // Update product current stock
      await db.update(product)
        .set({ currentStock: prod.currentStock - quantity })
        .where(eq(product.id, prod.id));
    }

    // Update customer balance if credit
    if (isCredit && targetCustomerId) {
      const targetCust = await db.query.customer.findFirst({ where: eq(customer.id, targetCustomerId) });
      if (targetCust) {
        await db.update(customer)
          .set({ balanceOwed: targetCust.balanceOwed + totalSaleAmount })
          .where(eq(customer.id, targetCustomerId));

        await db.insert(customerDebtEvent).values({
          id: `cde_${crypto.randomUUID()}`,
          customerId: targetCustomerId,
          saleId,
          amount: totalSaleAmount,
          type: "charge",
          createdAt: now,
        });
      }
    }

    revalidatePath("/owner");
    revalidatePath("/staff");
    return { success: true };
  } catch (error: any) {
    console.error("Log sale error:", error);
    return { error: error.message || "Failed to log sale." };
  }
}

/**
 * Logs waste during active shift.
 */
export async function logWasteAction(data: {
  productId: string;
  quantity: number;
  reason: string;
}) {
  try {
    const { staffId, businessId } = await getStaffContext();

    const activeSession = await db.query.cashSession.findFirst({
      where: and(
        eq(cashSession.businessId, businessId),
        eq(cashSession.staffId, staffId),
        isNull(cashSession.closedAt)
      ),
    });

    if (!activeSession) return { error: "No active shift found." };

    const prod = await db.query.product.findFirst({
      where: and(eq(product.id, data.productId), eq(product.businessId, businessId))
    });

    if (!prod) return { error: "Product not found." };
    if (data.quantity <= 0) return { error: "Quantity must be greater than 0." };

    const now = new Date();

    await db.insert(stockEvent).values({
      id: `se_${crypto.randomUUID()}`,
      productId: prod.id,
      businessId,
      type: "waste",
      quantity: data.quantity,
      reason: data.reason,
      createdBy: staffId,
      createdAt: now,
    });

    const shiftCount = await db.query.shiftStockCount.findFirst({
      where: and(
        eq(shiftStockCount.cashSessionId, activeSession.id),
        eq(shiftStockCount.productId, prod.id)
      )
    });

    if (shiftCount) {
      const newWaste = shiftCount.wasteQty + data.quantity;
      const newCalc = shiftCount.countedOpeningQty + shiftCount.addedQty - shiftCount.soldQty - newWaste;
      await db.update(shiftStockCount)
        .set({ wasteQty: newWaste, calculatedClosingQty: newCalc, updatedAt: now })
        .where(eq(shiftStockCount.id, shiftCount.id));
    }

    await db.update(product)
      .set({ currentStock: prod.currentStock - data.quantity })
      .where(eq(product.id, prod.id));

    revalidatePath("/owner");
    revalidatePath("/staff");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to log waste." };
  }
}

/**
 * Logs restock during active shift.
 */
export async function logRestockAction(data: {
  productId: string;
  quantity: number;
}) {
  try {
    const { staffId, businessId } = await getStaffContext();

    const activeSession = await db.query.cashSession.findFirst({
      where: and(
        eq(cashSession.businessId, businessId),
        eq(cashSession.staffId, staffId),
        isNull(cashSession.closedAt)
      ),
    });

    if (!activeSession) return { error: "No active shift found." };

    const prod = await db.query.product.findFirst({
      where: and(eq(product.id, data.productId), eq(product.businessId, businessId))
    });

    if (!prod) return { error: "Product not found." };
    if (data.quantity <= 0) return { error: "Quantity must be greater than 0." };

    const now = new Date();

    await db.insert(stockEvent).values({
      id: `se_${crypto.randomUUID()}`,
      productId: prod.id,
      businessId,
      type: "restock",
      quantity: data.quantity,
      createdBy: staffId,
      createdAt: now,
    });

    const shiftCount = await db.query.shiftStockCount.findFirst({
      where: and(
        eq(shiftStockCount.cashSessionId, activeSession.id),
        eq(shiftStockCount.productId, prod.id)
      )
    });

    if (shiftCount) {
      const newAdded = shiftCount.addedQty + data.quantity;
      const newCalc = shiftCount.countedOpeningQty + newAdded - shiftCount.soldQty - shiftCount.wasteQty;
      await db.update(shiftStockCount)
        .set({ addedQty: newAdded, calculatedClosingQty: newCalc, updatedAt: now })
        .where(eq(shiftStockCount.id, shiftCount.id));
    }

    await db.update(product)
      .set({ currentStock: prod.currentStock + data.quantity })
      .where(eq(product.id, prod.id));

    revalidatePath("/owner");
    revalidatePath("/staff");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to log restock." };
  }
}

/**
 * Gets shift activity log.
 */
export async function getMyShiftActivityAction() {
  try {
    const { staffId, businessId } = await getStaffContext();

    const activeSession = await db.query.cashSession.findFirst({
      where: and(
        eq(cashSession.businessId, businessId),
        eq(cashSession.staffId, staffId),
        isNull(cashSession.closedAt)
      ),
    });

    if (!activeSession) return { activities: [] };

    const sessionStartTime = new Date(new Date(activeSession.date).getTime() - 60000);
    const salesList = await db.query.sale.findMany({
      where: and(
        eq(sale.businessId, businessId),
        eq(sale.staffId, staffId),
        gte(sale.createdAt, sessionStartTime)
      ),
      orderBy: [desc(sale.createdAt)]
    });

    const saleIds = salesList.map(s => s.id);
    let saleItemsWithProducts: any[] = [];
    if (saleIds.length > 0) {
      saleItemsWithProducts = await db.query.saleItem.findMany({
        where: sql`${saleItem.saleId} IN ${saleIds}`
      });
    }

    const products = await db.query.product.findMany({
      where: eq(product.businessId, businessId),
      columns: { id: true, name: true, unit: true }
    });
    const productMap = new Map(products.map(p => [p.id, p]));

    const stockEvents = await db.query.stockEvent.findMany({
      where: and(
        eq(stockEvent.businessId, businessId),
        eq(stockEvent.createdBy, staffId),
        gte(stockEvent.createdAt, sessionStartTime)
      ),
      orderBy: [desc(stockEvent.createdAt)]
    });

    const combined: any[] = [];

    for (const s of salesList) {
      const items = saleItemsWithProducts.filter(i => i.saleId === s.id);
      const itemSummaries = items.map(i => {
        const p = productMap.get(i.productId);
        return `${i.quantity} ${p?.unit || "unit"}(s) ${p?.name || "Product"}`;
      }).join(", ");

      const label = s.paymentType === "credit" ? "Credit Sale" : "Paid Sale";

      combined.push({
        id: s.id,
        type: "sale",
        title: label,
        detail: itemSummaries || "Products sold",
        amount: s.total,
        createdAt: s.createdAt.toISOString()
      });
    }

    for (const se of stockEvents) {
      if (se.type === "sale") continue;
      const p = productMap.get(se.productId);
      const title = 
        se.type === "waste" ? `Waste Logged (${se.reason || "other"})` : 
        se.type === "opening_count" ? "Opening Stock Counted" : "Restock Logged";

      combined.push({
        id: se.id,
        type: se.type,
        title,
        detail: `${se.quantity} ${p?.unit || "unit"}(s) ${p?.name || "Product"}`,
        amount: null,
        createdAt: se.createdAt.toISOString()
      });
    }

    combined.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return { activities: combined };
  } catch (error: any) {
    return { error: error.message || "Failed to load shift activity" };
  }
}

/**
 * Gets stock count summary for closing shift step.
 */
export async function getShiftStockSummaryAction() {
  try {
    const { staffId, businessId } = await getStaffContext();

    const activeSession = await db.query.cashSession.findFirst({
      where: and(
        eq(cashSession.businessId, businessId),
        eq(cashSession.staffId, staffId),
        isNull(cashSession.closedAt)
      ),
    });

    if (!activeSession) return { error: "No active shift found." };

    const shiftCounts = await db.query.shiftStockCount.findMany({
      where: and(
        eq(shiftStockCount.cashSessionId, activeSession.id),
        eq(shiftStockCount.businessId, businessId)
      )
    });

    const products = await db.query.product.findMany({
      where: eq(product.businessId, businessId),
      columns: { id: true, name: true, unit: true, lowStockThreshold: true, costPrice: true }
    });

    const productMap = new Map(products.map(p => [p.id, p]));

    const summary = shiftCounts.map(sc => {
      const p = productMap.get(sc.productId);
      const calcClosing = sc.countedOpeningQty + sc.addedQty - sc.soldQty - sc.wasteQty;
      return {
        id: sc.id,
        productId: sc.productId,
        productName: p?.name || "Product",
        unit: p?.unit || "unit",
        expectedOpeningQty: sc.expectedOpeningQty,
        countedOpeningQty: sc.countedOpeningQty,
        openingVarianceQty: sc.openingVarianceQty,
        addedQty: sc.addedQty,
        soldQty: sc.soldQty,
        wasteQty: sc.wasteQty,
        calculatedClosingQty: calcClosing,
      };
    });

    const sessionStartTime = new Date(new Date(activeSession.date).getTime() - 60000);
    const shiftSales = await db.query.sale.findMany({
      where: and(
        eq(sale.businessId, businessId),
        eq(sale.staffId, staffId),
        gte(sale.createdAt, sessionStartTime)
      ),
      columns: { total: true, paymentType: true }
    });

    const expectedCash = shiftSales.filter(s => s.paymentType !== "credit").reduce((a, b) => a + b.total, 0);

    return {
      shiftStockSummary: summary,
      expectedCash,
      openingCountCompleted: activeSession.openingCountCompleted,
    };
  } catch (error: any) {
    return { error: error.message || "Failed to load shift summary" };
  }
}

/**
 * Closes active shift with closing stock counts and cash count reconciliation.
 */
export async function closeShiftAction(data: {
  stockCounts: Record<string, number>;
  countedCash: number;
}) {
  try {
    const { staffId, businessId } = await getStaffContext();

    const activeSession = await db.query.cashSession.findFirst({
      where: and(
        eq(cashSession.businessId, businessId),
        eq(cashSession.staffId, staffId),
        isNull(cashSession.closedAt)
      ),
    });

    if (!activeSession) return { error: "No active shift found to close." };

    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];

    const shiftCounts = await db.query.shiftStockCount.findMany({
      where: eq(shiftStockCount.cashSessionId, activeSession.id)
    });

    const products = await db.query.product.findMany({
      where: eq(product.businessId, businessId),
    });

    let totalStockVariance = 0;

    for (const sc of shiftCounts) {
      const calcClosing = sc.countedOpeningQty + sc.addedQty - sc.soldQty - sc.wasteQty;
      const counted = data.stockCounts[sc.productId] ?? calcClosing;
      const closingVarianceQty = counted - calcClosing;
      totalStockVariance += closingVarianceQty;

      await db.update(shiftStockCount)
        .set({
          calculatedClosingQty: calcClosing,
          countedClosingQty: counted,
          closingVarianceQty: closingVarianceQty,
          updatedAt: now,
        })
        .where(eq(shiftStockCount.id, sc.id));

      await db.update(product)
        .set({ currentStock: counted })
        .where(eq(product.id, sc.productId));
    }

    const shiftSessionStartTime = new Date(new Date(activeSession.date).getTime() - 60000);
    const shiftSales = await db.query.sale.findMany({
      where: and(
        eq(sale.businessId, businessId),
        eq(sale.staffId, staffId),
        gte(sale.createdAt, shiftSessionStartTime)
      ),
      columns: { total: true, paymentType: true }
    });

    const expectedCash = shiftSales.filter(s => s.paymentType !== "credit").reduce((a, b) => a + b.total, 0);
    const cashVariance = data.countedCash - expectedCash;

    await db.update(cashSession)
      .set({
        expectedCash,
        countedCash: data.countedCash,
        variance: cashVariance,
        closedAt: now,
      })
      .where(eq(cashSession.id, activeSession.id));

    // Upsert daily_stock_ledger
    for (const prod of products) {
      const todayShifts = await db.query.shiftStockCount.findMany({
        where: and(
          eq(shiftStockCount.businessId, businessId),
          eq(shiftStockCount.productId, prod.id),
          sql`${shiftStockCount.createdAt} >= ${sql`CURRENT_DATE`}`
        ),
        orderBy: [shiftStockCount.createdAt]
      });

      if (todayShifts.length > 0) {
        const firstShift = todayShifts[0];
        const lastShift = todayShifts[todayShifts.length - 1];

        const dayOpening = firstShift.countedOpeningQty;
        const dayAdded = todayShifts.reduce((acc, s) => acc + s.addedQty, 0);
        const daySold = todayShifts.reduce((acc, s) => acc + s.soldQty, 0);
        const dayWaste = todayShifts.reduce((acc, s) => acc + s.wasteQty, 0);
        const dayCalcClosing = dayOpening + dayAdded - daySold - dayWaste;
        const dayCountedClosing = lastShift.countedClosingQty ?? dayCalcClosing;
        const dayVariance = dayCountedClosing - dayCalcClosing;
        const closingValue = dayCountedClosing * (prod.costPrice || 0);

        const existingLedger = await db.query.dailyStockLedger.findFirst({
          where: and(
            eq(dailyStockLedger.businessId, businessId),
            eq(dailyStockLedger.productId, prod.id),
            eq(dailyStockLedger.date, todayStr)
          )
        });

        if (existingLedger) {
          await db.update(dailyStockLedger)
            .set({
              openingQty: dayOpening,
              addedQty: dayAdded,
              soldQty: daySold,
              wasteQty: dayWaste,
              calculatedClosingQty: dayCalcClosing,
              countedClosingQty: dayCountedClosing,
              varianceQty: dayVariance,
              closingValue,
              updatedAt: now,
            })
            .where(eq(dailyStockLedger.id, existingLedger.id));
        } else {
          await db.insert(dailyStockLedger).values({
            id: `dsl_${crypto.randomUUID()}`,
            businessId,
            productId: prod.id,
            date: todayStr,
            openingQty: dayOpening,
            addedQty: dayAdded,
            soldQty: daySold,
            wasteQty: dayWaste,
            calculatedClosingQty: dayCalcClosing,
            countedClosingQty: dayCountedClosing,
            varianceQty: dayVariance,
            closingValue,
            updatedAt: now,
          });
        }
      }
    }

    revalidatePath("/owner");
    revalidatePath("/staff");
    return { 
      success: true, 
      cashVariance, 
      totalStockVariance 
    };
  } catch (error: any) {
    console.error("Close shift error:", error);
    return { error: error.message || "Failed to close shift." };
  }
}
