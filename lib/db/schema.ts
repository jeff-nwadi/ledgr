import { pgTable, text, timestamp, boolean, integer } from "drizzle-orm/pg-core";

export const business = pgTable("business", {
  id: text("id").primaryKey(),
  code: text("code").notNull().unique(), // e.g. HERITAGE-01
  name: text("name").notNull(),
  currency: text("currency").notNull(), // ISO 4217 string e.g. NGN
  ownerId: text("owner_id").notNull(), 
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").unique(),
  emailVerified: boolean("email_verified").notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  // Custom extensions
  businessId: text("business_id").references(() => business.id),
  role: text("role").notNull().default("staff"), // 'owner' | 'staff'
  pinHash: text("pin_hash"),
  failedAttempts: integer("failed_attempts").notNull().default(0),
  locked: boolean("locked").notNull().default(false),
  status: text("status").notNull().default("active") // 'active' | 'deactivated'
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id").notNull().references(() => user.id)
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id").notNull().references(() => user.id),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull()
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at")
});

export const product = pgTable("product", {
  id: text("id").primaryKey(),
  businessId: text("business_id").notNull().references(() => business.id),
  name: text("name").notNull(),
  unit: text("unit").notNull(), // e.g. "kg", "loaf"
  sellingPrice: integer("selling_price").notNull(), // in minor units
  costPrice: integer("cost_price"), // nullable
  currentStock: integer("current_stock").notNull().default(0),
  lowStockThreshold: integer("low_stock_threshold"),
  category: text("category"),
  status: text("status").notNull().default("active"),
});

export const sale = pgTable("sale", {
  id: text("id").primaryKey(),
  businessId: text("business_id").notNull().references(() => business.id),
  staffId: text("staff_id").notNull().references(() => user.id),
  customerId: text("customer_id"), // Will reference customer.id
  paymentType: text("payment_type").notNull(), // 'paid' (cash/transfer) | 'credit' (customer debt)
  total: integer("total").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const saleItem = pgTable("sale_item", {
  id: text("id").primaryKey(),
  saleId: text("sale_id").notNull().references(() => sale.id),
  productId: text("product_id").notNull().references(() => product.id),
  quantity: integer("quantity").notNull(),
  priceAtSale: integer("price_at_sale").notNull(),
  costAtSale: integer("cost_at_sale").notNull(),
});

export const stockEvent = pgTable("stock_event", {
  id: text("id").primaryKey(),
  productId: text("product_id").notNull().references(() => product.id),
  businessId: text("business_id").notNull().references(() => business.id),
  type: text("type").notNull(), // 'sale'|'waste'|'restock'|'adjustment'|'opening_count'
  quantity: integer("quantity").notNull(),
  reason: text("reason"),
  note: text("note"),
  createdBy: text("created_by").notNull().references(() => user.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const shiftStockCount = pgTable("shift_stock_count", {
  id: text("id").primaryKey(),
  cashSessionId: text("cash_session_id").notNull().references(() => cashSession.id),
  businessId: text("business_id").notNull().references(() => business.id),
  productId: text("product_id").notNull().references(() => product.id),
  
  // Opening Count Reconciliation
  expectedOpeningQty: integer("expected_opening_qty").notNull().default(0),
  countedOpeningQty: integer("counted_opening_qty").notNull().default(0),
  openingVarianceQty: integer("opening_variance_qty").notNull().default(0),

  // In-Shift Movements
  addedQty: integer("added_qty").notNull().default(0),
  soldQty: integer("sold_qty").notNull().default(0),
  wasteQty: integer("waste_qty").notNull().default(0),

  // Closing Count Reconciliation
  calculatedClosingQty: integer("calculated_closing_qty"),
  countedClosingQty: integer("counted_closing_qty"),
  closingVarianceQty: integer("closing_variance_qty"),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const dailyStockLedger = pgTable("daily_stock_ledger", {
  id: text("id").primaryKey(),
  productId: text("product_id").notNull().references(() => product.id),
  businessId: text("business_id").notNull().references(() => business.id),
  date: text("date").notNull(), // YYYY-MM-DD
  openingQty: integer("opening_qty").notNull(),
  addedQty: integer("added_qty").notNull().default(0),
  soldQty: integer("sold_qty").notNull().default(0),
  wasteQty: integer("waste_qty").notNull().default(0),
  calculatedClosingQty: integer("calculated_closing_qty").notNull(),
  countedClosingQty: integer("counted_closing_qty"), // Nullable until counted
  varianceQty: integer("variance_qty"),
  closingValue: integer("closing_value"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const cashSession = pgTable("cash_session", {
  id: text("id").primaryKey(),
  businessId: text("business_id").notNull().references(() => business.id),
  staffId: text("staff_id").notNull().references(() => user.id),
  date: timestamp("date").notNull().defaultNow(),
  openingFloat: integer("opening_float").notNull().default(0),
  openingCountCompleted: boolean("opening_count_completed").notNull().default(false),
  expectedCash: integer("expected_cash"),
  countedCash: integer("counted_cash"),
  variance: integer("variance"),
  closedAt: timestamp("closed_at"),
});

export const customer = pgTable("customer", {
  id: text("id").primaryKey(),
  businessId: text("business_id").notNull().references(() => business.id),
  name: text("name").notNull(),
  phone: text("phone"),
  balanceOwed: integer("balance_owed").notNull().default(0),
});

export const customerDebtEvent = pgTable("customer_debt_event", {
  id: text("id").primaryKey(),
  customerId: text("customer_id").notNull().references(() => customer.id),
  saleId: text("sale_id").references(() => sale.id),
  amount: integer("amount").notNull(),
  type: text("type").notNull(), // 'charge'|'payment'
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
