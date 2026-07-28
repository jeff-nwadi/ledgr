import { betterAuth } from "better-auth";
import { createAuthEndpoint, APIError } from "better-auth/api";
import { setSessionCookie } from "better-auth/cookies";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db";
import * as schema from "../db/schema";
import { eq, and, or, ne, isNull } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { z } from "zod";

export const staffPinAuthPlugin = () => ({
  id: "staff-pin-auth",
  endpoints: {
    staffPinLogin: createAuthEndpoint(
      "/staff-pin-login",
      {
        method: "POST",
        body: z.object({
          businessCode: z.string(),
          pin: z.string(),
        }),
      },
      async (ctx) => {
        const GENERIC_ERROR = "Invalid Business ID code or PIN.";
        const cleanCode = (ctx.body.businessCode || "").trim().toUpperCase();
        const cleanPin = (ctx.body.pin || "").trim();

        if (!cleanCode || !cleanPin || cleanPin.length !== 4) {
          throw new APIError("BAD_REQUEST", { message: GENERIC_ERROR });
        }

        // 1. Look up business by Business ID code
        const b = await db.query.business.findFirst({
          where: eq(schema.business.code, cleanCode),
        });

        if (!b) {
          throw new APIError("UNAUTHORIZED", { message: GENERIC_ERROR });
        }

        // 2. Find active staff users in this business
        const staffMembers = await db.query.user.findMany({
          where: and(
            eq(schema.user.businessId, b.id),
            eq(schema.user.role, "staff"),
            or(ne(schema.user.status, "deactivated"), isNull(schema.user.status))
          ),
        });

        if (!staffMembers || staffMembers.length === 0) {
          throw new APIError("UNAUTHORIZED", { message: GENERIC_ERROR });
        }

        // Match PIN against candidate staff members
        let matchedStaff: typeof staffMembers[0] | null = null;
        for (const staffMember of staffMembers) {
          if (!staffMember.pinHash) continue;
          const isMatch = await bcrypt.compare(cleanPin, staffMember.pinHash);
          if (isMatch) {
            matchedStaff = staffMember;
            break;
          }
        }

        if (!matchedStaff) {
          // Track failed attempts if single staff member in business
          if (staffMembers.length === 1) {
            const s = staffMembers[0];
            const newAttempts = (s.failedAttempts || 0) + 1;
            const isLocked = newAttempts >= 5;
            await db.update(schema.user)
              .set({
                failedAttempts: newAttempts,
                locked: isLocked,
                updatedAt: new Date()
              })
              .where(eq(schema.user.id, s.id));
          }
          throw new APIError("UNAUTHORIZED", { message: GENERIC_ERROR });
        }

        // 3. Check account lock status
        if (matchedStaff.locked) {
          throw new APIError("FORBIDDEN", { message: "Account is locked. Please ask the owner to unlock it." });
        }

        // Reset failed attempts on success
        if (matchedStaff.failedAttempts > 0) {
          await db.update(schema.user)
            .set({ failedAttempts: 0, locked: false, updatedAt: new Date() })
            .where(eq(schema.user.id, matchedStaff.id));
        }

        // Create Better Auth session directly via internalAdapter
        const session = await ctx.context.internalAdapter.createSession(matchedStaff.id);
        if (!session) {
          throw new APIError("INTERNAL_SERVER_ERROR", { message: "Failed to create session." });
        }

        // Set official Better Auth signed session cookie
        await setSessionCookie(ctx, {
          session,
          user: {
            ...matchedStaff,
            email: matchedStaff.email || `staff_${matchedStaff.id}@ledgr.internal`,
          },
        });

        return ctx.json({
          success: true,
          user: {
            id: matchedStaff.id,
            name: matchedStaff.name,
            role: matchedStaff.role,
            businessId: matchedStaff.businessId,
          },
        });
      }
    ),
  },
});

export const auth = betterAuth({
  trustedOrigins: [process.env.BETTER_BASE_URL || "http://localhost:3000"],
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: schema
  }),
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      businessId: {
        type: "string",
        required: false,
      },
      role: {
        type: "string",
        required: false,
        defaultValue: "staff",
      },
      pinHash: {
        type: "string",
        required: false,
      },
      locked: {
        type: "boolean",
        required: false,
      },
      failedAttempts: {
        type: "number",
        required: false,
      }
    }
  },
  plugins: [
    staffPinAuthPlugin(),
  ],
});
