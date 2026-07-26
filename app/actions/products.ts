"use server";

import { db } from "@/lib/db";
import { product, stockEvent } from "@/lib/db/schema";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

export async function createProductAction(formData: FormData) {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user) {
    return { error: "Unauthorized" };
  }

  const businessId = (session.session as any).businessId;
  if (!businessId) {
    return { error: "No business associated with this account." };
  }

  const name = formData.get("name") as string;
  const unit = formData.get("unit") as string;
  const sellingPrice = parseInt(formData.get("sellingPrice") as string, 10);
  const costPrice = parseInt(formData.get("costPrice") as string, 10);
  const startingStock = parseInt(formData.get("startingStock") as string, 10) || 0;

  if (!name || !unit || isNaN(sellingPrice) || isNaN(costPrice)) {
    return { error: "All fields are required and prices must be numbers." };
  }

  try {
    // We would normally wrap this in a transaction, but Neon serverless 
    // with HTTP doesn't natively support long transactions. We'll do sequential.
    
    // Generate a unique ID (normally Better Auth or Drizzle handles this, 
    // but since we defined schema with text primary key, let's use a simple rand/uuid)
    const productId = `prod_${crypto.randomUUID()}`;

    await db.insert(product).values({
      id: productId,
      businessId,
      name,
      unit,
      sellingPrice,
      costPrice,
      currentStock: startingStock,
    });

    if (startingStock > 0) {
      await db.insert(stockEvent).values({
        id: `evt_${crypto.randomUUID()}`,
        productId,
        businessId,
        type: "adjustment",
        quantity: startingStock,
        reason: "Initial stock setup",
        createdBy: session.user.id,
      });
    }

    revalidatePath("/dashboard/products");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error: any) {
    console.error("Error creating product:", error);
    return { error: "Failed to create product." };
  }
}
