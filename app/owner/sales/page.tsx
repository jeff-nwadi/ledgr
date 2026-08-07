import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { sale, user, customer } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { SalesLog } from "@/components/sales/SalesLog";
import { format } from "date-fns";

export default async function SalesPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user) redirect("/signin");

  const businessId = (session.user as any).businessId;
  if (!businessId) redirect("/owner");

  const salesRaw = await db.select({
    id: sale.id,
    createdAt: sale.createdAt,
    total: sale.total,
    paymentType: sale.paymentType,
    staffName: user.name,
    customerName: customer.name,
  })
  .from(sale)
  .leftJoin(user, eq(sale.staffId, user.id))
  .leftJoin(customer, eq(sale.customerId, customer.id))
  .where(eq(sale.businessId, businessId))
  .orderBy(desc(sale.createdAt));

  const salesData = salesRaw.map(s => ({
    id: s.id,
    createdAt: s.createdAt,
    total: s.total,
    paymentType: s.paymentType,
    staffName: s.staffName || "Unknown Staff",
    customerName: s.customerName
  }));

  const todaySales = salesData.filter(s => {
    const d = new Date(s.createdAt);
    const today = new Date();
    return d.toDateString() === today.toDateString();
  });

  const todayTotal = todaySales.reduce((sum, s) => sum + s.total, 0);
  const transactionsCount = todaySales.length;
  const creditTotal = salesData.filter(s => s.paymentType === "credit").reduce((sum, s) => sum + s.total, 0);

  return (
    <>
      {/* DESKTOP VIEW (Condition a: hidden md:block — 100% untouched) */}
      <div className="hidden md:block max-w-5xl mx-auto space-y-8 pb-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold font-heading text-text-primary">Sales Log</h1>
            <p className="text-[13px] text-text-muted mt-1">Review historical sales and filter by payment type or staff.</p>
          </div>
        </div>

        <SalesLog sales={salesData} />
      </div>

      {/* MOBILE VIEW (Condition a: block md:hidden — Matches Reference Image 4 EXACTLY with REAL DB DATA) */}
      <div className="block md:hidden space-y-4 pb-28 px-1">
        {/* Header Title + Filter Button */}
        <div className="flex items-center justify-between">
          <h1 className="text-[24px] font-bold font-heading text-text-primary tracking-tight">Sales</h1>
          <button className="flex items-center gap-1.5 bg-surface border border-border/60 rounded-full px-4 py-2 text-xs font-normal text-text-primary hover:bg-border/40 transition-colors min-h-[44px]">
            <span>🎛️</span>
            <span>Filter</span>
          </button>
        </div>

        {/* 3 Top Stat Cards */}
        <div className="grid grid-cols-3 gap-2">
          {/* Card 1: Today */}
          <div className="rounded-2xl border border-border/60 bg-surface p-3 space-y-1">
            <span className="text-xs text-text-muted block font-normal">Today</span>
            <div className="text-base font-normal text-text-primary tabular-nums tracking-tight">
              ₦{todayTotal.toLocaleString()}
            </div>
          </div>

          {/* Card 2: Transactions */}
          <div className="rounded-2xl border border-border/60 bg-surface p-3 space-y-1">
            <span className="text-xs text-text-muted block font-normal">Transactions</span>
            <div className="text-base font-normal text-text-primary tabular-nums tracking-tight">
              {transactionsCount}
            </div>
          </div>

          {/* Card 3: Credit */}
          <div className="rounded-2xl border border-border/60 bg-surface p-3 space-y-1">
            <span className="text-xs text-text-muted block font-normal">Credit</span>
            <div className="text-base font-normal text-[#E0665D] tabular-nums tracking-tight">
              ₦{creditTotal.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Grouped Sales List (Dynamic DB Data) */}
        <div className="space-y-4 pt-1">
          <div className="space-y-2">
            <span className="text-[11px] font-normal tracking-wider text-text-muted uppercase px-1">ALL SALES LOG</span>
            <div className="rounded-2xl border border-border/60 bg-surface overflow-hidden divide-y divide-border/40">
              {salesData.length === 0 ? (
                <div className="p-6 text-center text-xs text-text-muted font-normal">
                  No sales recorded yet.
                </div>
              ) : (
                salesData.map((s) => (
                  <div key={s.id} className="p-3.5 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-normal text-text-primary">
                        Sale #{s.id.slice(0, 6)} {s.customerName ? `· ${s.customerName}` : ""}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[10px] font-normal px-2 py-0.5 rounded-full ${
                          s.paymentType === "credit" ? "text-[#E0665D] bg-[#FDF0EE] dark:bg-[#E0665D]/15" : "text-[#2E9C82] bg-[#E6F4F1] dark:bg-[#2E9C82]/15"
                        }`}>
                          {s.paymentType === "credit" ? "Credit" : "Paid"}
                        </span>
                        <span className="text-xs text-text-muted font-normal">
                          {s.staffName.split(" ")[0]} · {format(new Date(s.createdAt), "h:mm a")}
                        </span>
                      </div>
                    </div>
                    <span className="text-sm font-normal text-text-primary tabular-nums">₦{s.total.toLocaleString()}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
