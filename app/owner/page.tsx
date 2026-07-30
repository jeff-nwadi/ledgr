import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { ChevronDown, ArrowRight, TrendingUp, Package, Coins, Activity, AlertTriangle, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { product, user } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getOwnerAnalyticsAction } from "@/app/actions/owner";

import { getCurrencySymbol } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function OwnerDashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  let userRole = (session?.user as any)?.role;
  let businessId = (session?.user as any)?.businessId;

  if (session?.user?.id && (!userRole || !businessId)) {
    const dbUser = await db.query.user.findFirst({
      where: eq(user.id, session.user.id),
      columns: { role: true, businessId: true }
    });
    if (dbUser) {
      userRole = dbUser.role;
      businessId = dbUser.businessId;
    }
  }

  userRole = userRole || "owner";

  if (userRole === "staff") {
    const { redirect } = await import("next/navigation");
    redirect("/staff");
  }

  const userName = session?.user?.name?.split(" ")[0] || "there";

  const analytics = await getOwnerAnalyticsAction();
  const currencySymbol = getCurrencySymbol(analytics.currency);

  const grossVolume = analytics.grossVolume || 0;
  const netVolume = analytics.netVolume || 0;
  const stockValue = analytics.stockValue || 0;
  const wasteValue = analytics.wasteValue || 0;
  const totalCustomers = analytics.totalCustomers || 0;
  const customerDebtTotal = analytics.customerDebtTotal || 0;
  const todayCashVariance = analytics.todayCashVariance || 0;
  const todayStockVarianceValue = analytics.todayStockVarianceValue || 0;
  const chartData = analytics.revenueChartData || [];
  const activities = analytics.recentActivities || [];

  const currentHour = new Date().getHours();
  const greeting = 
    currentHour < 12 ? "Good morning" : 
    currentHour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl lg:text-3xl font-heading text-text-primary">
            {greeting}, {userName}
          </h1>
          <p className="text-xs  text-text-muted mt-1">Here is your shop's real-time financial and stock ledger overview.</p>
        </div>

        <Link
          href="/owner/daily"
          data-tour="stock-ledger"
          className="px-4 py-2 bg-brand text-white text-xs font-semibold rounded-xl hover:bg-brand/90 transition-all flex items-center gap-2"
        >
          Daily Stock Ledger <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {!analytics.hasProducts && (
        <div 
          className="rounded-[1.25rem] p-6 md:p-8 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-brand/20"
          style={{ backgroundImage: 'var(--brand-gradient)' }}
        >
          <div className="space-y-1.5">
            <h2 className="text-[22px] text-white">Setup Your Shop Products</h2>
            <p className="text-white/90 text-[15px] max-w-xl font-normal">
              Add your selling products with cost price and selling price to unlock profit tracking and inventory ledger automation.
            </p>
          </div>
          <Link href="/owner/products" className="flex items-center gap-2 bg-white text-text-primary px-5 py-2.5 rounded-full text-sm hover:bg-white/90 transition-colors whitespace-nowrap">
            Add Products <ArrowRight className="w-4 h-4 text-text-muted" />
          </Link>
        </div>
      )}

      {/* Main Grid: Revenue Trend Chart & Shift Close-out */}
      <div data-tour="dashboard-summary" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Line Chart */}
        <div className="lg:col-span-2 rounded-[1rem] border border-border/50 bg-background p-4 sm:p-6 flex flex-col">
          <div className="flex flex-row justify-between items-start gap-2">
            <div className="space-y-1">
              <h3 className="text-text-muted text-xs sm:text-[15px]">Gross Sales Revenue</h3>
              <p className="text-2xl sm:text-[32px] text-text-primary tracking-tight">
                {currencySymbol}{grossVolume.toLocaleString()}
              </p>
            </div>
            <span className="text-[11px] sm:text-xs px-2.5 py-1 rounded-full bg-brand/10 text-brand whitespace-nowrap">
              Last 14 Days
            </span>
          </div>

          <div className="mt-4 flex-1 min-h-[180px] sm:min-h-[260px]">
            <RevenueChart data={chartData} currencySymbol={currencySymbol} />
          </div>
        </div>

        {/* Right Side: Shift Close-out & Recent Activity */}
        <div className="space-y-6">
          {/* Today's Shift Close-out Status Card */}
          <div data-tour="cash-session" className="rounded-[1rem] border border-border/50 bg-background p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm sm:text-[15px] text-text-primary">Today's Close-out Status</h3>
              <span className={`text-[11px] px-2 py-0.5 rounded-full ${
                analytics.hasClosedShiftToday ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" : "bg-amber-500/10 text-amber-600 border border-amber-500/20"
              }`}>
                {analytics.hasClosedShiftToday ? "Shift Closed" : analytics.hasActiveShift ? "Shift Active" : "No Shift Opened"}
              </span>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${todayCashVariance >= 0 ? "bg-emerald-500" : "bg-rose-500"}`}></span>
                  <span className="text-xs sm:text-[13px] text-text-muted">Cash Variance</span>
                </div>
                <span className={`text-xs sm:text-[13px] ${todayCashVariance >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                  {analytics.hasClosedShiftToday ? `${currencySymbol}${todayCashVariance.toLocaleString()}` : "Pending Shift Close"}
                </span>
              </div>
              
              <div className="flex items-center justify-between border-t border-border/40 pt-2">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${todayStockVarianceValue >= 0 ? "bg-emerald-500" : "bg-rose-500"}`}></span>
                  <span className="text-xs sm:text-[13px] text-text-muted">Stock Variance Value</span>
                </div>
                <span className={`text-xs sm:text-[13px] ${todayStockVarianceValue >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                  {analytics.hasClosedShiftToday ? `${currencySymbol}${todayStockVarianceValue.toLocaleString()}` : "Pending Shift Close"}
                </span>
              </div>
            </div>

            <div className="pt-2">
              <Link 
                href="/owner/daily-summary"
                className="w-full block text-center py-2.5 bg-surface hover:bg-border/50 text-text-primary text-xs sm:text-[13px] rounded-xl transition-colors border border-border/50 min-h-[44px] flex items-center justify-center"
              >
                View Full Daily Stock Ledger
              </Link>
            </div>
          </div>

          {/* Recent Activity Feed */}
          <div className="rounded-[1rem] border border-border/50 bg-background p-5 sm:p-6 flex flex-col h-64 sm:h-72">
            <h3 className="text-sm sm:text-[15px] text-text-primary mb-3">Recent Activity</h3>
            {activities.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center space-y-2">
                <Activity className="w-8 h-8 text-text-muted/40" />
                <p className="text-xs sm:text-[13px] text-text-primary">Nothing here yet</p>
                <p className="text-[11px] text-text-muted">Sales and stock changes will appear here live.</p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto space-y-3 pr-1 divide-y divide-border/40">
                {activities.map((act) => (
                  <div key={act.id} className="pt-2 first:pt-0 space-y-0.5">
                    <div className="flex items-center justify-between text-xs">
                      <p className=" text-text-primary">{act.title}</p>
                      <span className="text-[10px] text-text-muted">{act.createdAt}</span>
                    </div>
                    <p className="text-[11px] text-text-muted">{act.detail}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Financial & Inventory KPI Overview Cards (2x2 grid on mobile) */}
      <div className="space-y-4 pt-4">
        <h2 className="text-base sm:text-[18px] text-text-primary">Key Financial & Inventory Metrics</h2>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Gross Sales Volume */}
          <div className="rounded-[1rem] border border-border/50 bg-background p-3.5 sm:p-5 shadow-[0_1px_3px_0_rgba(0,0,0,0.02)] space-y-1.5">
            <span className="text-xs sm:text-[13px] text-text-muted block truncate">Gross Sales Volume</span>
            <p className="text-lg sm:text-[24px] text-text-primary tracking-tight truncate">
              {currencySymbol}{grossVolume.toLocaleString()}
            </p>
            <span className="text-[10px] sm:text-[11px] text-text-muted block truncate">Total customer transactions</span>
          </div>

          {/* Gross Profit (Net Profit) */}
          <div className="rounded-[1rem] border border-border/50 bg-background p-3.5 sm:p-5 shadow-[0_1px_3px_0_rgba(0,0,0,0.02)] space-y-1.5">
            <span className="text-xs sm:text-[13px] text-text-muted block truncate">Gross Profit</span>
            <p className="text-lg sm:text-[24px] tracking-tight truncate">
              {currencySymbol}{netVolume.toLocaleString()}
            </p>
            <span className="text-[10px] sm:text-[11px] text-text-muted block truncate">Revenue minus COGS</span>
          </div>

          {/* Stock Value On Hand */}
          <div className="rounded-[1rem] border border-border/50 bg-background p-3.5 sm:p-5 shadow-[0_1px_3px_0_rgba(0,0,0,0.02)] space-y-1.5">
            <span className="text-xs sm:text-[13px] text-text-muted block truncate">Stock Value On Hand</span>
            <p className="text-lg sm:text-[24px] text-brand tracking-tight truncate">
              {currencySymbol}{stockValue.toLocaleString()}
            </p>
            <span className="text-[10px] sm:text-[11px] text-text-muted block truncate">Stock × cost price</span>
          </div>

          {/* Waste / Spoilage Value */}
          <div className="rounded-[1rem] border border-border/50 bg-background p-3.5 sm:p-5 space-y-1.5">
            <span className="text-xs sm:text-[13px] text-text-muted block truncate">Total Waste Value</span>
            <p className="text-lg sm:text-[24px] tracking-tight truncate">
              {currencySymbol}{wasteValue.toLocaleString()}
            </p>
            <span className="text-[10px] sm:text-[11px] text-text-muted block truncate">Spoiled inventory cost</span>
          </div>
        </div>

        {/* Second Row: Customer Debt & Total Customers (Stacked or 2 columns) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div className="rounded-[1rem] border border-border/50 bg-background p-4 sm:p-5 flex items-center justify-between">
            <div>
              <span className="text-xs sm:text-[13px] text-text-muted block">Total Customer Debt</span>
              <p className="text-xl sm:text-[24px] tracking-tight mt-1">
                {currencySymbol}{customerDebtTotal.toLocaleString()}
              </p>
              <span className="text-[10px] sm:text-[11px] text-text-muted">Uncollected credit sales</span>
            </div>
            <Link href="/owner/customers" className="text-xs text-brand hover:underline min-h-[44px] flex items-center">
              View Debtors
            </Link>
          </div>

          <div className="rounded-[1rem] border border-border/50 bg-background p-4 sm:p-5 flex items-center justify-between">
            <div>
              <span className="text-xs sm:text-[13px]text-text-muted block">Registered Customers</span>
              <p className="text-xl sm:text-[24px] text-text-primary tracking-tight mt-1">
                {totalCustomers.toLocaleString()}
              </p>
              <span className="text-[10px] sm:text-[11px] text-text-muted">Profiles in shop ledger</span>
            </div>
            <Link href="/owner/customers" className="text-xs text-brand hover:underline min-h-[44px] flex items-center">
              Manage Customers 
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
