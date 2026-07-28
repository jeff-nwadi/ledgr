import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { cashSession, dailyStockLedger, product, stockEvent, sale } from "@/lib/db/schema";
import { eq, and, gte, lt, desc } from "drizzle-orm";
import { startOfDay, endOfDay, format } from "date-fns";
import { CashSessionCard } from "@/components/daily/CashSessionCard";
import { StockLedgerTable, type LedgerRow } from "@/components/daily/StockLedgerTable";

export default async function DailyBalancePage() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user) redirect("/signin");

  const businessId = (session.user as any).businessId;
  if (!businessId) redirect("/owner");

  const today = new Date();
  const start = startOfDay(today);
  const end = endOfDay(today);

  const activeSession = await db.query.cashSession.findFirst({
    where: and(
      eq(cashSession.businessId, businessId),
      eq(cashSession.staffId, session.user.id),
      gte(cashSession.date, start),
      lt(cashSession.date, end)
    ),
    orderBy: (cashSession, { desc }) => [desc(cashSession.date)]
  });

  let cashSalesTotal = 0;
  if (activeSession && !activeSession.closedAt) {
    const sales = await db.query.sale.findMany({
      where: and(
        eq(sale.businessId, businessId),
        eq(sale.staffId, session.user.id),
        eq(sale.paymentType, "cash"),
        gte(sale.createdAt, activeSession.date)
      )
    });
    cashSalesTotal = sales.reduce((sum, s) => sum + s.total, 0);
  }

  const products = await db.query.product.findMany({
    where: eq(product.businessId, businessId),
  });

  const eventsToday = await db.query.stockEvent.findMany({
    where: and(
      eq(stockEvent.businessId, businessId),
      gte(stockEvent.createdAt, start),
      lt(stockEvent.createdAt, end)
    )
  });

  const todayStr = format(today, "yyyy-MM-dd");
  const ledgersToday = await db.query.dailyStockLedger.findMany({
    where: and(
      eq(dailyStockLedger.businessId, businessId),
      eq(dailyStockLedger.date, todayStr)
    )
  });

  const ledgerData: LedgerRow[] = products.map(p => {
    const reconciled = ledgersToday.find(l => l.productId === p.id);
    if (reconciled) {
      return {
        productId: p.id,
        name: p.name,
        unit: p.unit,
        costPrice: p.costPrice || 0,
        openingQty: reconciled.openingQty,
        addedQty: reconciled.addedQty,
        soldQty: reconciled.soldQty,
        wasteQty: reconciled.wasteQty,
        calculatedClosingQty: reconciled.calculatedClosingQty,
        countedClosingQty: reconciled.countedClosingQty,
        varianceQty: reconciled.varianceQty,
      };
    }

    const events = eventsToday.filter(e => e.productId === p.id);
    const addedQty = events.filter(e => e.type === "restock").reduce((sum, e) => sum + e.quantity, 0);
    const soldQty = events.filter(e => e.type === "sale").reduce((sum, e) => sum + e.quantity, 0);
    const wasteQty = events.filter(e => e.type === "waste").reduce((sum, e) => sum + e.quantity, 0);
    const openingQty = p.currentStock + soldQty + wasteQty - addedQty;
    const calculatedClosingQty = p.currentStock;

    return {
      productId: p.id,
      name: p.name,
      unit: p.unit,
      costPrice: p.costPrice || 0,
      openingQty,
      addedQty,
      soldQty,
      wasteQty,
      calculatedClosingQty,
      countedClosingQty: null,
      varianceQty: null,
    };
  });

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-text-primary">Daily Stock & Cash Balance</h1>
          <p className="text-[13px] text-text-muted mt-1">
            Real-time calculation of today's expected stock and cash drawer float.
          </p>
        </div>
      </div>

      <CashSessionCard 
        activeSession={activeSession ? {
          ...activeSession,
          createdAt: activeSession.date.toISOString(),
          closedAt: activeSession.closedAt ? activeSession.closedAt.toISOString() : null,
        } : null}
        cashSalesTotal={cashSalesTotal}
      />

      <StockLedgerTable ledger={ledgerData} />
    </div>
  );
}
