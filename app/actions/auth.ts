'use server';

import { db } from "@/lib/db";
import { user, business } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";
import { auth } from "@/lib/auth/auth";
import { generateUniqueBusinessCode } from "@/lib/auth/pin-utils";

export async function registerOwnerAction(data: any) {
  const { businessName, currency, ownerName, email, password } = data;
  const cleanEmail = (email || "").trim().toLowerCase();

  try {
    const businessId = crypto.randomUUID();
    const uniqueCode = await generateUniqueBusinessCode();

    // 1. Create business first
    await db.insert(business).values({
      id: businessId,
      code: uniqueCode,
      name: businessName,
      currency: currency || "NGN",
      ownerId: "temp",
      createdAt: new Date(),
    });

    // 2. Create user using Better Auth server API
    const response: any = await auth.api.signUpEmail({
      body: {
        email: cleanEmail,
        password: password,
        name: ownerName
      },
      asResponse: false
    } as any);

    if (!response || !response.user) {
      throw new Error("Failed to create user with Better Auth");
    }

    const userId = response.user.id;

    // 3. Update user with business ID and role
    await db.update(user).set({
      businessId: businessId,
      role: "owner",
      status: "active"
    }).where(eq(user.id, userId));

    // 4. Update business with owner ID
    await db.update(business).set({
      ownerId: userId
    }).where(eq(business.id, businessId));

    return { success: true };
  } catch (error: any) {
    console.error("Signup error:", error);
    return { error: error.message || "Failed to register" };
  }
}

export async function signOutAction() {
  const { headers } = await import("next/headers");
  const { redirect } = await import("next/navigation");
  await auth.api.signOut({
    headers: await headers()
  });
  redirect("/signin?type=pin");
}
