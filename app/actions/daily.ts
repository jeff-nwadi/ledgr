"use server";

import { db } from "@/lib/db";
import { cashSession, dailyStockLedger, product, sale, stockEvent } from "@/lib/db/schema";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { eq, and, gte, lt, sql, desc } from "drizzle-orm";
import { startOfDay, endOfDay } from "date-fns";

export async function openCashSessionAction(openingFloat: number) {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user) return { error: "Unauthorized" };

  const businessId = (session.session as any).businessId;
  if (!businessId) return { error: "No business" };

  try {
    const today = new Date();
    
    // Check if there's already an open session for this staff member today
    const existing = await db.query.cashSession.findFirst({
      where: and(
        eq(cashSession.businessId, businessId),
        eq(cashSession.staffId, session.user.id),
        gte(cashSession.date, startOfDay(today)),
        lt(cashSession.date, endOfDay(today))
      )
    });

    if (existing && !existing.closedAt) {
      return { error: "You already have an open shift for today." };
    }

    await db.insert(cashSession).values({
      id: `cs_${crypto.randomUUID()}`,
      businessId,
      staffId: session.user.id,
      date: today,
      openingFloat,
      expectedCash: openingFloat, // Initially just the float. We calculate actual expected dynamically.
    });

    revalidatePath("/dashboard/daily");
    return { success: true };
  } catch (error) {
    console.error("Open session error:", error);
    return { error: "Failed to open cash shift." };
  }
}

export async function closeCashSessionAction(sessionId: string, countedCash: number) {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user) return { error: "Unauthorized" };

  try {
    const cashSess = await db.query.cashSession.findFirst({
      where: eq(cashSession.id, sessionId)
    });

    if (!cashSess) return { error: "Session not found." };
    if (cashSess.closedAt) return { error: "Session is already closed." };

    // Calculate actual expected cash = openingFloat + ALL cash sales since opening
    const sales = await db.query.sale.findMany({
      where: and(
        eq(sale.businessId, cashSess.businessId),
        eq(sale.staffId, session.user.id),
        eq(sale.paymentType, "cash"),
        gte(sale.createdAt, cashSess.date)
      )
    });

    const cashSalesTotal = sales.reduce((sum, s) => sum + s.total, 0);
    const expectedCash = cashSess.openingFloat + cashSalesTotal;
    const variance = countedCash - expectedCash;

    await db.update(cashSession).set({
      expectedCash,
      countedCash,
      variance,
      closedAt: new Date()
    }).where(eq(cashSession.id, sessionId));

    revalidatePath("/dashboard/daily");
    return { success: true, variance };
  } catch (error) {
    console.error("Close session error:", error);
    return { error: "Failed to close shift." };
  }
}

export async function confirmStockCountAction(
  productId: string,
  openingQty: number,
  addedQty: number,
  soldQty: number,
  wasteQty: number,
  calculatedClosingQty: number,
  countedClosingQty: number,
  costPrice: number
) {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user) return { error: "Unauthorized" };
  const businessId = (session.session as any).businessId;

  const varianceQty = countedClosingQty - calculatedClosingQty;
  const closingValue = countedClosingQty * costPrice;

  try {
    // Note: Instead of doing upsert perfectly, we just insert a new ledger record for today.
    // Realistically you'd want to `ON CONFLICT DO UPDATE` if date+product is unique, 
    // but we can just use a UUID and find the latest. Let's insert a record.
    
    await db.insert(dailyStockLedger).values({
      id: `dsl_${crypto.randomUUID()}`,
      productId,
      businessId,
      date: new Date(),
      openingQty,
      addedQty,
      soldQty,
      wasteQty,
      calculatedClosingQty,
      countedClosingQty,
      varianceQty,
      closingValue
    });

    revalidatePath("/dashboard/daily");
    return { success: true };
  } catch (error) {
    console.error("Confirm stock error:", error);
    return { error: "Failed to confirm stock count." };
  }
}
