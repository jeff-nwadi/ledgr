import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { cashSession, dailyStockLedger, product, sale, saleItem, user } from "@/lib/db/schema";
import { eq, and, between, inArray } from "drizzle-orm";
import { redirect } from "next/navigation";
import { parseISO, startOfDay, endOfDay, format } from "date-fns";

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
    targetDate = new Date(); // Fallback to today if invalid
  }

  const dayStart = startOfDay(targetDate);
  const dayEnd = endOfDay(targetDate);

  // 1. Fetch Sales and calculate Revenue / COGS
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

  // 2. Fetch Cash Sessions for the day
  // Since multiple shifts can exist per day, we fetch them all and aggregate.
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
    totalCashVariance = null; // Unresolved
  } else {
    for (const s of sessions) {
      totalCashVariance! += (s.variance || 0);
    }
  }

  // 3. Fetch Daily Stock Ledger for the day
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
        between(dailyStockLedger.date, dayStart, dayEnd) // dailyStockLedger.date is timestamp
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

  // Check if zero data
  const isEmptyState = daySales.length === 0 && sessions.length === 0 && ledgerEntries.length === 0;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold font-heading">Daily Summary</h1>
          <p className="text-sm text-text-muted mt-1">End of day reconciliation and performance</p>
        </div>
        <DateNavigator currentDate={dateStr} />
      </div>

      {isEmptyState ? (
        <div className="rounded-[1rem] border border-border/50 bg-background shadow-sm overflow-hidden">
          <div className="flex flex-col items-center justify-center py-24 text-center space-y-3">
            <div className="w-12 h-12 bg-surface rounded-full flex items-center justify-center text-text-muted/60 mb-2">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-[14px] font-semibold text-text-primary">No activity recorded</p>
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
                <p className="text-sm font-medium text-text-primary">Day not fully closed</p>
                <p className="text-[13px] text-text-muted">
                  {hasOpenShift && isStockIncomplete 
                    ? "Some shifts are still open and stock counts are unconfirmed. Showing partial data." 
                    : hasOpenShift 
                      ? "Some shifts are still open. Cash variance is incomplete."
                      : "Stock counts are unconfirmed. Stock variance is incomplete."}
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
  );
}
