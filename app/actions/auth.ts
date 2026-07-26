'use server';

import { db } from "@/lib/db";
import { user, business, session as sessionTable, account } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { cookies, headers } from "next/headers";
import crypto from "crypto";
import { auth } from "@/lib/auth/auth";

export async function loginStaffAction(businessCode: string, staffUsername: string, pin: string) {
  // 1. Find the business
  const b = await db.query.business.findFirst({
    where: eq(business.code, businessCode),
  });

  if (!b) {
    return { error: "Invalid Business ID" };
  }

  // 2. Find the specific staff member by name/username in this business
  const staffMember = await db.query.user.findFirst({
    where: and(
      eq(user.businessId, b.id),
      eq(user.name, staffUsername),
      eq(user.role, "staff")
    ),
  });

  if (!staffMember) {
    return { error: "Staff member not found in this business." };
  }

  if (staffMember.locked) {
    return { error: "Account is locked. Please ask the owner to unlock it." };
  }

  if (staffMember.pinHash) {
    const isMatch = await bcrypt.compare(pin, staffMember.pinHash);
    if (!isMatch) {
      const newAttempts = staffMember.failedAttempts + 1;
      const shouldLock = newAttempts >= 5;
      
      await db.update(user).set({
        failedAttempts: newAttempts,
        locked: shouldLock
      }).where(eq(user.id, staffMember.id));

      if (shouldLock) {
        return { error: "Too many failed attempts. Account locked. Please ask the owner to unlock it." };
      }
      return { error: `Invalid PIN. ${5 - newAttempts} attempts remaining.` };
    }
  } else {
    return { error: "No PIN is set for this account." };
  }

  // Reset failed attempts on success
  if (staffMember.failedAttempts > 0) {
    await db.update(user)
      .set({ failedAttempts: 0 })
      .where(eq(user.id, staffMember.id));
  }

  // Create session manually compatible with better-auth
  const token = crypto.randomUUID();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

  await db.insert(sessionTable).values({
    id: crypto.randomUUID(),
    token: token,
    userId: staffMember.id,
    expiresAt: expiresAt,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // Set cookie
  (await cookies()).set("better-auth.session_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  });

  return { success: true };
}

export async function registerOwnerAction(data: any) {
  const { businessName, currency, ownerName, email, password } = data;

  try {
    const businessId = crypto.randomUUID();

    // 1. Create business first
    await db.insert(business).values({
      id: businessId,
      code: businessName.toUpperCase().replace(/\s+/g, '-').slice(0, 10) + "-" + Math.floor(Math.random() * 1000),
      name: businessName,
      currency: currency || "NGN",
      ownerId: "temp", // We will update this after user creation
      createdAt: new Date(),
    });

    // 2. Create the user using Better Auth server API
    // This ensures password hashing uses Better Auth's internal algorithms
    const response = await auth.api.signUpEmail({
      body: {
        email: email,
        password: password,
        name: ownerName
      },
      // Pass a dummy Request object to satisfy Better Auth API
      asResponse: false
    } as any);

    if (!response || !response.user) {
      throw new Error("Failed to create user with Better Auth");
    }

    const userId = response.user.id;

    // 3. Update the user with business ID and role
    await db.update(user).set({
      businessId: businessId,
      role: "owner"
    }).where(eq(user.id, userId));

    // 4. Update the business with the correct owner ID
    await db.update(business).set({
      ownerId: userId
    }).where(eq(business.id, businessId));

    return { success: true };
  } catch (error: any) {
    console.error("Signup error:", error);
    return { error: error.message || "Failed to register" };
  }
}

