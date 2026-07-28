import { db } from "@/lib/db";
import { business, user } from "@/lib/db/schema";
import { eq, and, ne } from "drizzle-orm";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const BUSINESS_CODE_CHARSET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"; // 32 chars: no 0/O, 1/I

/**
 * Generates a globally unique 6-character Business ID code.
 * Format: 6 characters, uppercase letters + digits, avoiding ambiguous characters (0/O, 1/I).
 */
export async function generateUniqueBusinessCode(): Promise<string> {
  let attempts = 0;
  while (attempts < 20) {
    let code = "";
    const bytes = crypto.randomBytes(6);
    for (let i = 0; i < 6; i++) {
      code += BUSINESS_CODE_CHARSET[bytes[i] % BUSINESS_CODE_CHARSET.length];
    }

    const existing = await db.query.business.findFirst({
      where: eq(business.code, code),
    });

    if (!existing) {
      return code;
    }
    attempts++;
  }
  throw new Error("Failed to generate unique business code");
}

/**
 * Generates a 4-digit numeric PIN system-generated for staff.
 * Scoped to the business_id, ensuring no collision with any ACTIVE staff member in the same business.
 */
export async function generateUniqueStaffPin(businessId: string): Promise<string> {
  // Fetch active staff in the business
  const activeStaff = await db.query.user.findMany({
    where: and(
      eq(user.businessId, businessId),
      eq(user.role, "staff"),
      ne(user.status, "deactivated")
    ),
    columns: { pinHash: true },
  });

  const activeHashes = activeStaff.map((s) => s.pinHash).filter(Boolean) as string[];

  let attempts = 0;
  while (attempts < 100) {
    const num = Math.floor(crypto.randomInt(0, 10000));
    const candidatePin = num.toString().padStart(4, "0");

    let collision = false;
    for (const hash of activeHashes) {
      if (await bcrypt.compare(candidatePin, hash)) {
        collision = true;
        break;
      }
    }

    if (!collision) {
      return candidatePin;
    }
    attempts++;
  }

  throw new Error("Unable to generate unique PIN for staff member in this business");
}
