import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db";
import * as schema from "../db/schema";
import { eq, and } from "drizzle-orm";
import bcrypt from "bcryptjs";

export const auth = betterAuth({
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
    // Better Auth plugins if needed
  ],
  advanced: {
    generateId: false, // let database or better-auth handle it
  },
});
