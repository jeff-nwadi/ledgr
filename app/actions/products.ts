"use server";

import { db } from "@/lib/db";
import { product, stockEvent } from "@/lib/db/schema";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { eq, and } from "drizzle-orm";

export async function createProductAction(data: {
  name: string;
  unit: string;
  sellingPrice: number;
  costPrice?: number | null;
  startingStock: number;
  lowStockThreshold?: number | null;
  category?: string | null;
}) {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user) return { error: "Unauthorized" };
  const businessId = (session.user as any).businessId;
  if (!businessId) return { error: "No business associated with this account." };

  try {
    const productId = `prod_${crypto.randomUUID()}`;

    await db.insert(product).values({
      id: productId,
      businessId,
      name: data.name,
      unit: data.unit || "each",
      sellingPrice: data.sellingPrice,
      costPrice: data.costPrice ?? null,
      currentStock: data.startingStock,
      lowStockThreshold: data.lowStockThreshold ?? null,
      category: data.category ?? null,
      status: "active"
    });

    if (data.startingStock > 0) {
      await db.insert(stockEvent).values({
        id: `evt_${crypto.randomUUID()}`,
        productId,
        businessId,
        type: "initial", // Using 'initial' for genesis balance as per recommendation
        quantity: data.startingStock,
        reason: "Initial stock setup",
        createdBy: session.user.id,
      });
    }

    revalidatePath("/owner/products");
    return { success: true };
  } catch (error: any) {
    console.error("Error creating product:", error);
    return { error: "Failed to create product." };
  }
}

export async function bulkImportProductsAction(products: any[]) {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user) return { error: "Unauthorized" };
  const businessId = (session.user as any).businessId;
  if (!businessId) return { error: "No business found" };

  try {
    // We insert sequentially to avoid complex transaction limits on serverless
    let successCount = 0;
    
    for (const p of products) {
      const productId = `prod_${crypto.randomUUID()}`;
      
      await db.insert(product).values({
        id: productId,
        businessId,
        name: p.name,
        unit: p.unit || "each",
        sellingPrice: p.sellingPrice,
        costPrice: p.costPrice ?? null,
        currentStock: p.startingStock,
        lowStockThreshold: Math.round(p.startingStock * 0.2), // Auto default to 20%
        category: p.category ?? null,
        status: "active"
      });

      if (p.startingStock > 0) {
        await db.insert(stockEvent).values({
          id: `evt_${crypto.randomUUID()}`,
          productId,
          businessId,
          type: "initial",
          quantity: p.startingStock,
          reason: "Bulk import",
          createdBy: session.user.id,
        });
      }
      
      successCount++;
    }

    revalidatePath("/owner/products");
    return { success: true, count: successCount };
  } catch (error: any) {
    console.error("Bulk import error:", error);
    return { error: "Failed to process bulk import" };
  }
}

export async function archiveProductAction(productId: string) {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user) return { error: "Unauthorized" };
  const businessId = (session.user as any).businessId;

  try {
    await db.update(product)
      .set({ status: "archived" })
      .where(and(eq(product.id, productId), eq(product.businessId, businessId)));
      
    revalidatePath("/owner/products");
    return { success: true };
  } catch (error) {
    return { error: "Failed to archive product" };
  }
}
