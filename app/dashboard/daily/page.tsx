import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { cashSession, dailyStockLedger, product, stockEvent, sale } from "@/lib/db/schema";
import { eq, and, gte, lt, desc } from "drizzle-orm";
import { startOfDay, endOfDay } from "date-fns";
import { CashSessionCard } from "@/components/daily/CashSessionCard";
import { StockLedgerTable } from "@/components/daily/StockLedgerTable";

export default async function DailyBalancePage() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user) redirect("/signin");
  const businessId = (session.user as any).businessId;
  if (!businessId) redirect("/dashboard");

  const today = new Date();
  const start = startOfDay(today);
  const end = endOfDay(today);

  // 1. Fetch Active Cash Session
  const activeSession = await db.query.cashSession.findFirst({
    where: and(
      eq(cashSession.businessId, businessId),
      eq(cashSession.staffId, session.user.id),
      gte(cashSession.date, start),
      lt(cashSession.date, end)
    ),
    orderBy: (cashSession, { desc }) => [desc(cashSession.date)]
  });

  // Calculate cash sales total if session is open
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

  // 2. Compute Stock Ledger for Today
  const products = await db.query.product.findMany({
    where: eq(product.businessId, businessId)
  });

  const allEventsToday = await db.query.stockEvent.findMany({
    where: and(
      eq(stockEvent.businessId, businessId),
      gte(stockEvent.createdAt, start),
      lt(stockEvent.createdAt, end)
    )
  });

  // Also check if any ledger entries were already saved today
  const ledgersToday = await db.query.dailyStockLedger.findMany({
    where: and(
      eq(dailyStockLedger.businessId, businessId),
      gte(dailyStockLedger.date, start),
      lt(dailyStockLedger.date, end)
    )
  });

  const ledgerData = products.map(p => {
    // Check if already reconciled today
    const reconciled = ledgersToday.find(l => l.productId === p.id);
    if (reconciled) {
      return {
        productId: p.id,
        name: p.name,
        unit: p.unit,
        costPrice: p.costPrice,
        openingQty: reconciled.openingQty,
        addedQty: reconciled.addedQty,
        soldQty: reconciled.soldQty,
        wasteQty: reconciled.wasteQty,
        calculatedClosingQty: reconciled.calculatedClosingQty,
        countedClosingQty: reconciled.countedClosingQty,
        varianceQty: reconciled.varianceQty
      };
    }

    // Filter events for this product
    const pEvents = allEventsToday.filter(e => e.productId === p.id);
    
    let addedQty = 0;
    let soldQty = 0;
    let wasteQty = 0;

    pEvents.forEach(e => {
      if (e.type === 'restock' || e.type === 'adjustment') {
        if (e.quantity > 0) addedQty += e.quantity; // Adjustments might be negative, but let's count positive as added
      }
      if (e.type === 'sale') soldQty += Math.abs(e.quantity);
      if (e.type === 'waste') wasteQty += Math.abs(e.quantity);
    });

    // Opening quantity is Current Stock - additions + subtractions.
    // Basically, reverse-engineering the opening stock from current stock.
    // currentStock = opening + added - sold - waste -> opening = current - added + sold + waste
    const openingQty = p.currentStock - addedQty + soldQty + wasteQty;
    const calculatedClosingQty = p.currentStock; // Since we are real-time, currentStock IS calculated closing

    return {
      productId: p.id,
      name: p.name,
      unit: p.unit,
      costPrice: p.costPrice,
      openingQty,
      addedQty,
      soldQty,
      wasteQty,
      calculatedClosingQty,
      countedClosingQty: null,
      varianceQty: null
    };
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-text-primary">Daily Balance</h1>
          <p className="text-[13px] text-text-muted mt-1">End of day cash and stock reconciliation.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT PANE: Cash Session */}
        <div className="lg:col-span-1">
          <CashSessionCard 
            activeSession={activeSession} 
            cashSalesTotal={cashSalesTotal} 
          />
        </div>

        {/* RIGHT PANE: Stock Ledger */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-[16px] font-semibold text-text-primary">Stock Ledger</h2>
          <StockLedgerTable ledger={ledgerData} />
        </div>

      </div>
    </div>
  );
}
