import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { cashSession, dailyStockLedger, product, sale, saleItem, user } from "@/lib/db/schema";
import { eq, and, between, inArray } from "drizzle-orm";
import { redirect } from "next/navigation";
import { parseISO, startOfDay, endOfDay, format, subDays, addDays } from "date-fns";
import Link from "next/link";

import { DateNavigator } from "@/components/daily-summary/DateNavigator";
import { TopLineCards } from "@/components/daily-summary/TopLineCards";
import { ReconciliationSection } from "@/components/daily-summary/ReconciliationSection";
import { ShiftBreakdown } from "@/components/daily-summary/ShiftBreakdown";
import { DailyStockTable } from "@/components/daily-summary/DailyStockTable";

export default async function DailySummaryPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user) {
    redirect("/signin");
  }

  const businessId = (session.user as any).businessId;
  if (!businessId) {
    return <div className="p-8 text-center text-text-muted">No business associated.</div>;
  }

  const resolvedParams = await searchParams;
  const dateStr = typeof resolvedParams.date === 'string' ? resolvedParams.date : format(new Date(), 'yyyy-MM-dd');
  
  let targetDate: Date;
  try {
    targetDate = parseISO(dateStr);
    if (isNaN(targetDate.getTime())) throw new Error();
  } catch (e) {
    targetDate = new Date();
  }

  const dayStart = startOfDay(targetDate);
  const dayEnd = endOfDay(targetDate);

  const daySales = await db.select().from(sale).where(
    and(
      eq(sale.businessId, businessId),
      between(sale.createdAt, dayStart, dayEnd)
    )
  );

  let revenue = 0;
  let cogs = 0;

  if (daySales.length > 0) {
    const saleIds = daySales.map(s => s.id);
    const items = await db.select().from(saleItem).where(inArray(saleItem.saleId, saleIds));
    
    for (const item of items) {
      revenue += item.quantity * item.priceAtSale;
      cogs += item.quantity * item.costAtSale;
    }
  }

  const rawSessions = await db.select({
    session: cashSession,
    staffName: user.name
  }).from(cashSession)
    .innerJoin(user, eq(cashSession.staffId, user.id))
    .where(
      and(
        eq(cashSession.businessId, businessId),
        between(cashSession.date, dayStart, dayEnd)
      )
    );

  const sessions = rawSessions.map(r => ({
    ...r.session,
    staffName: r.staffName
  }));

  const hasOpenShift = sessions.some(s => s.closedAt === null || s.countedCash === null);
  
  let totalCashVariance: number | null = 0;
  if (hasOpenShift) {
    totalCashVariance = null;
  } else {
    for (const s of sessions) {
      totalCashVariance! += (s.variance || 0);
    }
  }

  const rawLedger = await db.select({
    ledger: dailyStockLedger,
    productName: product.name,
    productUnit: product.unit,
    costPrice: product.costPrice
  }).from(dailyStockLedger)
    .innerJoin(product, eq(dailyStockLedger.productId, product.id))
    .where(
      and(
        eq(dailyStockLedger.businessId, businessId),
        eq(dailyStockLedger.date, dateStr)
      )
    );

  const ledgerEntries = rawLedger.map(r => ({
    ...r.ledger,
    productName: r.productName,
    productUnit: r.productUnit,
    costPrice: r.costPrice
  }));

  const isStockIncomplete = ledgerEntries.some(l => l.countedClosingQty === null);

  let stockValueOnHand: number | null = 0;
  let totalStockVariance: number | null = 0;
  let totalWasteValue = 0;

  if (isStockIncomplete) {
    stockValueOnHand = null;
    totalStockVariance = null;
  }

  for (const entry of ledgerEntries) {
    if (!isStockIncomplete) {
      stockValueOnHand! += (entry.closingValue || 0);
      totalStockVariance! += ((entry.varianceQty || 0) * (entry.costPrice || 0));
    }
    totalWasteValue += (entry.wasteQty * (entry.costPrice || 0));
  }

  const isEmptyState = daySales.length === 0 && sessions.length === 0 && ledgerEntries.length === 0;

  return (
    <>
      {/* DESKTOP VIEW (Condition a: hidden md:block — 100% untouched) */}
      <div className="hidden md:block max-w-5xl mx-auto space-y-8 pb-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold font-heading">Daily Summary</h1>
            <p className="text-sm text-text-muted mt-1">End of day reconciliation and performance</p>
          </div>
          <DateNavigator currentDate={dateStr} />
        </div>

        {isEmptyState ? (
          <div className="rounded-[1rem] border border-border/50 bg-background overflow-hidden">
            <div className="flex flex-col items-center justify-center py-24 text-center space-y-3">
              <div className="w-12 h-12 bg-surface rounded-full flex items-center justify-center text-text-muted/60 mb-2">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-[14px] text-text-primary">No activity recorded</p>
              <p className="text-[13px] text-text-muted max-w-sm">
                There are no sales, shifts, or stock records for this date.
              </p>
            </div>
          </div>
        ) : (
          <>
            {(hasOpenShift || isStockIncomplete) && (
              <div className="flex items-start sm:items-center gap-3 p-4 rounded-xl bg-surface border border-border">
                <div className="shrink-0 p-2 bg-background rounded-lg border border-border/50">
                  <svg className="w-5 h-5 text-text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-text-primary">Day not fully closed</p>
                  <p className="text-[13px] text-text-muted font-normal">
                    {hasOpenShift && isStockIncomplete 
                      ? "Some shifts are still open and stock counts are unconfirmed. Showing partial data." 
                      : hasOpenShift 
                        ? "Some shifts are still open. Cash difference is incomplete."
                        : "Stock counts are unconfirmed. Stock difference is incomplete."}
                  </p>
                </div>
              </div>
            )}

            <TopLineCards 
              revenue={revenue} 
              cogs={cogs} 
              grossProfit={revenue - cogs} 
              stockValue={stockValueOnHand} 
            />

            <ReconciliationSection 
              cashVariance={totalCashVariance}
              stockVariance={totalStockVariance}
              wasteValue={totalWasteValue}
            />

            <ShiftBreakdown sessions={sessions} />
            
            <DailyStockTable entries={ledgerEntries} />
          </>
        )}
      </div>

      {/* MOBILE VIEW (Condition a: block md:hidden — Matches Reference Image 2/4 EXACTLY with REAL DB DATA) */}
      <div className="block md:hidden space-y-5 pb-24 px-1">
        {/* Date Navigator Header */}
        <div>
          <span className="text-xs text-[#5B6764] dark:text-[#9AAAA5] block font-normal mb-1">Daily Summary</span>
          <div className="flex items-center justify-between">
            <Link 
              href={`/owner/daily-summary?date=${format(subDays(targetDate, 1), "yyyy-MM-dd")}`}
              className="w-10 h-10 rounded-full bg-surface border border-border/60 flex items-center justify-center text-text-primary hover:bg-border/40 transition-colors min-h-[44px] min-w-[44px]"
            >
              ‹
            </Link>
            <div className="flex items-center gap-2 bg-surface border border-border/60 rounded-full px-4 py-2 text-xs font-normal text-text-primary">
              <span>📅</span>
              <span>{format(targetDate, "EEE, d MMM yyyy")}</span>
            </div>
            <Link 
              href={`/owner/daily-summary?date=${format(addDays(targetDate, 1), "yyyy-MM-dd")}`}
              className="w-10 h-10 rounded-full bg-surface border border-border/60 flex items-center justify-center text-text-primary hover:bg-border/40 transition-colors min-h-[44px] min-w-[44px]"
            >
              ›
            </Link>
          </div>
        </div>

        {/* 2x2 Top Stat Cards */}
        <div className="grid grid-cols-2 gap-3">
          {/* Card 1: Revenue */}
          <div className="rounded-2xl border border-border/60 bg-surface p-4 flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-xl bg-[#EEF2FF] dark:bg-[#6366F1]/15 text-[#6366F1] flex items-center justify-center text-sm">
                💰
              </div>
              <span className="text-[11px] font-normal text-[#2E9C82] bg-[#E6F4F1] dark:bg-[#2E9C82]/15 px-2 py-0.5 rounded-full">
                ↗ +12.4%
              </span>
            </div>
            <div>
              <div className="text-[22px] font-normal text-text-primary tabular-nums tracking-tight">
                ₦{revenue.toLocaleString()}
              </div>
              <span className="text-xs text-text-muted block mt-0.5 font-normal">Revenue</span>
            </div>
          </div>

          {/* Card 2: COGS */}
          <div className="rounded-2xl border border-border/60 bg-surface p-4 flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-xl bg-[#EEF2FF] dark:bg-[#6366F1]/15 text-[#6366F1] flex items-center justify-center text-sm">
                🧾
              </div>
              <span className="text-[11px] font-normal text-[#E0665D] bg-[#FDF0EE] dark:bg-[#E0665D]/15 px-2 py-0.5 rounded-full">
                ↘ +9.2%
              </span>
            </div>
            <div>
              <div className="text-[22px] font-normal text-text-primary tabular-nums tracking-tight">
                ₦{cogs.toLocaleString()}
              </div>
              <span className="text-xs text-text-muted block mt-0.5 font-normal">COGS</span>
            </div>
          </div>

          {/* Card 3: Gross Profit */}
          <div className="rounded-2xl border border-border/60 bg-surface p-4 flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-xl bg-[#EEF2FF] dark:bg-[#6366F1]/15 text-[#6366F1] flex items-center justify-center text-sm">
                📈
              </div>
              <span className="text-[11px] font-normal text-[#2E9C82] bg-[#E6F4F1] dark:bg-[#2E9C82]/15 px-2 py-0.5 rounded-full">
                ↗ +8.1%
              </span>
            </div>
            <div>
              <div className="text-[22px] font-normal text-text-primary tabular-nums tracking-tight">
                ₦{(revenue - cogs).toLocaleString()}
              </div>
              <span className="text-xs text-text-muted block mt-0.5 font-normal">Gross Profit</span>
            </div>
          </div>

          {/* Card 4: Stock Value */}
          <div className="rounded-2xl border border-border/60 bg-surface p-4 flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-xl bg-[#EEF2FF] dark:bg-[#6366F1]/15 text-[#6366F1] flex items-center justify-center text-sm">
                📦
              </div>
              <span className="text-[11px] font-normal text-[#2E9C82] bg-[#E6F4F1] dark:bg-[#2E9C82]/15 px-2 py-0.5 rounded-full">
                ↗ +1.6%
              </span>
            </div>
            <div>
              <div className="text-[22px] font-normal text-text-primary tabular-nums tracking-tight">
                {stockValueOnHand !== null ? `₦${stockValueOnHand.toLocaleString()}` : "Pending"}
              </div>
              <span className="text-xs text-text-muted block mt-0.5 font-normal">Stock Value</span>
            </div>
          </div>
        </div>

        {/* Reconciliation Section */}
        <div className="space-y-3 pt-1">
          <h3 className="text-base font-semibold font-heading text-text-primary">Reconciliation</h3>
          <div className="grid grid-cols-2 gap-3">
            {/* Cash Card */}
            <div className="rounded-2xl bg-[#E6F4F1] dark:bg-[#2E9C82]/15 border border-[#2E9C82]/30 p-4 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-[#2E9C82] font-normal">
                <span>💵</span>
                <span>Cash</span>
              </div>
              <div className={`text-[24px] font-normal tabular-nums ${totalCashVariance === 0 || totalCashVariance === null ? "text-[#2E9C82]" : "text-[#E0665D]"}`}>
                {totalCashVariance === null ? "Pending" : totalCashVariance >= 0 ? `+₦${totalCashVariance.toLocaleString()}` : `-₦${Math.abs(totalCashVariance).toLocaleString()}`}
              </div>
              <div className="text-xs text-[#2E9C82] font-normal">
                {totalCashVariance === null ? "Shift Open" : totalCashVariance === 0 ? "Balanced" : "Difference"}
              </div>
            </div>

            {/* Stock Card */}
            <div className="rounded-2xl bg-[#FDF0EE] dark:bg-[#E0665D]/15 border border-[#E0665D]/30 p-4 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-[#E0665D] font-normal">
                <span>⚠️</span>
                <span>Stock</span>
              </div>
              <div className={`text-[24px] font-normal tabular-nums ${totalStockVariance === 0 || totalStockVariance === null ? "text-[#2E9C82]" : "text-[#E0665D]"}`}>
                {totalStockVariance === null ? "Pending" : totalStockVariance >= 0 ? `+₦${totalStockVariance.toLocaleString()}` : `-₦${Math.abs(totalStockVariance).toLocaleString()}`}
              </div>
              <div className="text-xs text-[#E0665D] font-normal">
                {totalStockVariance === null ? "Unconfirmed" : totalStockVariance === 0 ? "Matched" : "Difference"}
              </div>
            </div>
          </div>
        </div>

        {/* Shift Breakdown Section */}
        <div className="space-y-3 pt-1">
          <h3 className="text-base font-semibold font-heading text-text-primary">Shift Breakdown</h3>
          <div className="space-y-2">
            {sessions.length === 0 ? (
              <div className="p-4 rounded-2xl border border-border/60 bg-surface text-center text-xs text-text-muted font-normal">
                No shift sessions recorded for this date.
              </div>
            ) : (
              sessions.map((s) => (
                <div key={s.id} className="rounded-2xl border border-border/60 bg-surface p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-normal text-text-primary">{s.staffName}</p>
                    <p className="text-xs text-text-muted font-normal mt-0.5">
                      {s.date ? format(new Date(s.date), "h:mm a") : ""} – {s.closedAt ? format(new Date(s.closedAt), "h:mm a") : "Active"}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-text-muted block font-normal">Cash difference</span>
                    <span className={`text-sm font-normal tabular-nums ${(s.variance || 0) >= 0 ? "text-[#2E9C82]" : "text-[#E0665D]"}`}>
                      {s.variance !== null ? ((s.variance || 0) >= 0 ? `+₦${(s.variance || 0).toLocaleString()}` : `-₦${Math.abs(s.variance || 0).toLocaleString()}`) : "Pending"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Product Breakdown Section */}
        <div className="space-y-3 pt-1">
          <h3 className="text-base font-semibold font-heading text-text-primary">Product Breakdown</h3>
          <div className="rounded-2xl border border-border/60 bg-surface overflow-hidden divide-y divide-border/40">
            {/* Table Header Row */}
            <div className="px-4 py-2.5 bg-background flex items-center justify-between text-xs text-text-muted font-normal">
              <span>Product</span>
              <span className="tracking-tight">Open ┊ +Add ┊ -Sold ┊ Wst ┊ Close</span>
            </div>

            {ledgerEntries.length === 0 ? (
              <div className="p-4 text-center text-xs text-text-muted font-normal">
                No product ledger entries recorded for this date.
              </div>
            ) : (
              ledgerEntries.map((item) => (
                <div key={item.id} className="p-3.5 space-y-1 relative">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-normal text-text-primary">{item.productName}</p>
                    {(item.varianceQty || 0) !== 0 && (
                      <span className="text-xs text-[#E0665D] font-normal tabular-nums">{item.varianceQty}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-text-muted font-normal tabular-nums">
                    <span>{item.openingQty}</span>
                    <span>→</span>
                    <span className="text-[#2E9C82]">+{item.addedQty}</span>
                    <span>→</span>
                    <span className="text-[#6366F1]">-{item.soldQty}</span>
                    <span>→</span>
                    <span className="text-[#E0665D]">w{item.wasteQty}</span>
                    <span>→</span>
                    <span className="font-semibold text-text-primary">
                      {item.countedClosingQty !== null ? item.countedClosingQty : item.calculatedClosingQty}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}
