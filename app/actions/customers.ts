"use server";

import { db } from "@/lib/db";
import { customer, customerDebtEvent } from "@/lib/db/schema";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { eq, sql } from "drizzle-orm";

export async function addCustomerAction(name: string, phone: string) {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user) return { error: "Unauthorized" };
  const businessId = (session.user as any).businessId;
  if (!businessId) return { error: "No business found" };

  try {
    await db.insert(customer).values({
      id: `cust_${crypto.randomUUID()}`,
      businessId,
      name,
      phone: phone || null,
      balanceOwed: 0,
    });

    revalidatePath("/dashboard/customers");
    return { success: true };
  } catch (error) {
    console.error("Add customer error:", error);
    return { error: "Failed to add customer." };
  }
}

export async function markPaymentReceivedAction(customerId: string, amount: number) {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user) return { error: "Unauthorized" };
  const businessId = (session.user as any).businessId;

  try {
    // 1. Verify customer belongs to business
    const existing = await db.query.customer.findFirst({
      where: eq(customer.id, customerId)
    });

    if (!existing || existing.businessId !== businessId) {
      return { error: "Customer not found." };
    }

    if (amount <= 0) return { error: "Amount must be greater than zero." };

    // 2. Create Debt Event (Payment)
    await db.insert(customerDebtEvent).values({
      id: `cde_${crypto.randomUUID()}`,
      customerId,
      amount,
      type: "payment",
    });

    // 3. Decrement Balance Owed
    await db.update(customer)
      .set({ balanceOwed: sql`${customer.balanceOwed} - ${amount}` })
      .where(eq(customer.id, customerId));

    revalidatePath("/dashboard/customers");
    return { success: true };
  } catch (error) {
    console.error("Payment received error:", error);
    return { error: "Failed to log payment." };
  }
}
