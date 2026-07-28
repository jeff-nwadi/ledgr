"use server";

import { db } from "@/lib/db";
import { user, business, sale, stockEvent, cashSession, account, session as sessionTable } from "@/lib/db/schema";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { hashPassword } from "@better-auth/utils/password";
import { eq, and, count } from "drizzle-orm";
import { generateUniqueStaffPin } from "@/lib/auth/pin-utils";

export async function addStaffAction(name: string) {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user) return { error: "Unauthorized" };
  const businessId = (session.user as any).businessId;
  if (!businessId) return { error: "No business found" };

  const trimmedName = (name || "").trim();
  if (!trimmedName) {
    return { error: "Staff name is required." };
  }

  try {
    const b = await db.query.business.findFirst({
      where: eq(business.id, businessId),
    });
    if (!b) return { error: "Business details not found." };

    // Generate random 4-digit PIN checked for collision in this business
    const pin = await generateUniqueStaffPin(businessId);
    const pinHash = await bcrypt.hash(pin, 10);
    const tempId = `usr_${crypto.randomUUID()}`;
    const staffEmail = `staff_${tempId}@ledgr.internal`;
    const systemPassword = `PIN_${pin}_STAFF`; // 14 chars to satisfy Better Auth min length

    // Create user natively via Better Auth signUpEmail
    const response: any = await auth.api.signUpEmail({
      body: {
        email: staffEmail,
        password: systemPassword,
        name: trimmedName,
      },
      asResponse: false
    } as any);

    const createdUserId = response?.user?.id;
    if (createdUserId) {
      await db.update(user).set({
        businessId,
        role: "staff",
        pinHash,
        status: "active",
        emailVerified: false,
      }).where(eq(user.id, createdUserId));
    }
    
    revalidatePath("/owner/staff");
    return { 
      success: true, 
      pin, 
      businessCode: b.code, 
      staffName: trimmedName 
    };
  } catch (error: any) {
    console.error("Add staff error:", error);
    return { error: error?.body?.message || "Failed to add staff member." };
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
    if (!existing || existing.businessId !== businessId) return { error: "Staff member not found." };

    await db.update(user)
      .set({ locked: false, failedAttempts: 0, updatedAt: new Date() })
      .where(eq(user.id, staffId));

    revalidatePath("/owner/staff");
    return { success: true };
  } catch (error) {
    return { error: "Failed to unlock staff." };
  }
}

export async function regeneratePinAction(staffId: string) {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user) return { error: "Unauthorized" };
  const businessId = (session.user as any).businessId;

  try {
    const existing = await db.query.user.findFirst({ where: eq(user.id, staffId) });
    if (!existing || existing.businessId !== businessId) return { error: "Staff member not found." };

    const b = await db.query.business.findFirst({
      where: eq(business.id, businessId),
    });
    if (!b) return { error: "Business details not found." };

    // Generate new random 4-digit PIN checked for collision in this business
    const newPin = await generateUniqueStaffPin(businessId);
    const pinHash = await bcrypt.hash(newPin, 10);
    const systemPassword = `PIN_${newPin}_STAFF`;

    await db.update(user)
      .set({ pinHash, locked: false, failedAttempts: 0, updatedAt: new Date() })
      .where(eq(user.id, staffId));

    // Update password on account table for Better Auth using hashPassword
    if (existing.email) {
      const passwordHash = await hashPassword(systemPassword);
      await db.update(account)
        .set({ password: passwordHash, updatedAt: new Date() })
        .where(and(eq(account.userId, staffId), eq(account.providerId, "credential")));
    }

    revalidatePath("/owner/staff");
    return { 
      success: true, 
      pin: newPin, 
      businessCode: b.code, 
      staffName: existing.name 
    };
  } catch (error) {
    console.error("Regenerate PIN error:", error);
    return { error: "Failed to regenerate PIN." };
  }
}

export async function deactivateOrDeleteStaffAction(staffId: string) {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user) return { error: "Unauthorized" };
  const businessId = (session.user as any).businessId;

  try {
    const existing = await db.query.user.findFirst({ where: eq(user.id, staffId) });
    if (!existing || existing.businessId !== businessId) return { error: "Staff member not found." };

    // Check if sales, stock_event, or cash_session history exists for this staff member
    const [salesCountRes] = await db.select({ value: count() }).from(sale).where(eq(sale.staffId, staffId));
    const [stockEventsCountRes] = await db.select({ value: count() }).from(stockEvent).where(eq(stockEvent.createdBy, staffId));
    const [cashSessionsCountRes] = await db.select({ value: count() }).from(cashSession).where(eq(cashSession.staffId, staffId));

    const totalHistory = (salesCountRes?.value || 0) + (stockEventsCountRes?.value || 0) + (cashSessionsCountRes?.value || 0);

    if (totalHistory > 0) {
      // Soft deactivate: keep history intact
      await db.update(user)
        .set({ status: "deactivated", updatedAt: new Date() })
        .where(eq(user.id, staffId));

      revalidatePath("/owner/staff");
      return { success: true, mode: "deactivated" };
    } else {
      // Hard delete if zero history
      // First clean up foreign key references in session and account tables
      await db.delete(sessionTable).where(eq(sessionTable.userId, staffId));
      await db.delete(account).where(eq(account.userId, staffId));
      await db.delete(user).where(eq(user.id, staffId));

      revalidatePath("/owner/staff");
      return { success: true, mode: "deleted" };
    }
  } catch (error) {
    console.error("Deactivate staff error:", error);
    return { error: "Failed to deactivate staff." };
  }
}
