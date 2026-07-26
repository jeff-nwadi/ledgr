"use server";

import { db } from "@/lib/db";
import { sale, saleItem, stockEvent, product } from "@/lib/db/schema";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { eq, sql } from "drizzle-orm";

interface SaleItemInput {
  productId: string;
  quantity: number;
  price: number;
  cost: number;
}

export async function logSaleAction(
  items: SaleItemInput[], 
  paymentType: "cash" | "credit" | "other", 
  customerId?: string
) {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user) {
    return { error: "Unauthorized" };
  }

  const businessId = (session.user as any).businessId;
  if (!businessId) {
    return { error: "No business associated with this account." };
  }

  if (!items.length) {
    return { error: "Cart is empty." };
  }

  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  try {
    // In Neon Serverless without full explicit transaction blocks easily configured 
    // we do sequential writes. Note: For a real production app, ensure transactional integrity.
    
    const saleId = `sale_${crypto.randomUUID()}`;
    
    // 1. Create Sale Header
    await db.insert(sale).values({
      id: saleId,
      businessId,
      staffId: session.user.id,
      customerId: customerId || null,
      paymentType,
      total,
    });

    // 1b. If credit and customer selected, increase debt
    if (paymentType === "credit" && customerId) {
      const { customer, customerDebtEvent } = await import("@/lib/db/schema");
      
      await db.insert(customerDebtEvent).values({
        id: `cde_${crypto.randomUUID()}`,
        customerId,
        saleId,
        amount: total,
        type: "charge",
      });

      await db.update(customer)
        .set({ balanceOwed: sql`${customer.balanceOwed} + ${total}` })
        .where(eq(customer.id, customerId));
    }

    // 2. Insert Sale Items, Stock Events, and Update Product Stock
    for (const item of items) {
      await db.insert(saleItem).values({
        id: `si_${crypto.randomUUID()}`,
        saleId,
        productId: item.productId,
        quantity: item.quantity,
        priceAtSale: item.price,
        costAtSale: item.cost,
      });

      await db.insert(stockEvent).values({
        id: `evt_${crypto.randomUUID()}`,
        productId: item.productId,
        businessId,
        type: "sale",
        quantity: -item.quantity, // Negative for sale
        reason: "Sale",
        createdBy: session.user.id,
      });

      await db.update(product)
        .set({ currentStock: sql`${product.currentStock} - ${item.quantity}` })
        .where(eq(product.id, item.productId));
    }

    revalidatePath("/dashboard/sales");
    revalidatePath("/dashboard/products");
    revalidatePath("/dashboard/daily");
    
    return { success: true };
  } catch (error: any) {
    console.error("Error logging sale:", error);
    return { error: "Failed to log sale." };
  }
}

export async function logWasteAction(
  items: SaleItemInput[], 
  reason: string
) {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user) {
    return { error: "Unauthorized" };
  }

  const businessId = (session.user as any).businessId;
  if (!businessId) {
    return { error: "No business associated with this account." };
  }

  if (!items.length) {
    return { error: "Cart is empty." };
  }

  try {
    for (const item of items) {
      await db.insert(stockEvent).values({
        id: `evt_${crypto.randomUUID()}`,
        productId: item.productId,
        businessId,
        type: "waste",
        quantity: -item.quantity, // Negative for waste
        reason: reason || "Waste",
        createdBy: session.user.id,
      });

      await db.update(product)
        .set({ currentStock: sql`${product.currentStock} - ${item.quantity}` })
        .where(eq(product.id, item.productId));
    }

    revalidatePath("/dashboard/sales");
    revalidatePath("/dashboard/products");
    revalidatePath("/dashboard/daily");
    
    return { success: true };
  } catch (error: any) {
    console.error("Error logging waste:", error);
    return { error: "Failed to log waste." };
  }
}
