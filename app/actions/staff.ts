"use server";

import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

export async function addStaffAction(name: string, pin: string) {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user) return { error: "Unauthorized" };
  const businessId = (session.user as any).businessId;
  if (!businessId) return { error: "No business found" };

  try {
    const pinHash = await bcrypt.hash(pin, 10);
    
    await db.insert(user).values({
      id: `usr_${crypto.randomUUID()}`,
      businessId,
      name,
      role: "staff",
      pinHash,
      emailVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    revalidatePath("/dashboard/staff");
    return { success: true };
  } catch (error) {
    console.error("Add staff error:", error);
    return { error: "Failed to add staff member." };
  }
}

export async function unlockStaffAction(staffId: string) {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user) return { error: "Unauthorized" };
  const businessId = (session.user as any).businessId;

  try {
    const existing = await db.query.user.findFirst({ where: eq(user.id, staffId) });
    if (!existing || existing.businessId !== businessId) return { error: "Not found" };

    await db.update(user)
      .set({ locked: false, failedAttempts: 0, updatedAt: new Date() })
      .where(eq(user.id, staffId));

    revalidatePath("/dashboard/staff");
    return { success: true };
  } catch (error) {
    return { error: "Failed to unlock staff." };
  }
}

export async function resetPinAction(staffId: string, newPin: string) {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user) return { error: "Unauthorized" };
  const businessId = (session.user as any).businessId;

  try {
    const existing = await db.query.user.findFirst({ where: eq(user.id, staffId) });
    if (!existing || existing.businessId !== businessId) return { error: "Not found" };

    const pinHash = await bcrypt.hash(newPin, 10);
    await db.update(user)
      .set({ pinHash, locked: false, failedAttempts: 0, updatedAt: new Date() })
      .where(eq(user.id, staffId));

    revalidatePath("/dashboard/staff");
    return { success: true };
  } catch (error) {
    return { error: "Failed to reset PIN." };
  }
}
