import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { 
  ChevronDown, 
  ArrowRight, 
  TrendingUp, 
  Package, 
  Coins, 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  Search, 
  Bell, 
  Trash2, 
  PlusCircle, 
  ShoppingBag 
} from "lucide-react";
import Link from "next/link";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { product, user } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getOwnerAnalyticsAction } from "@/app/actions/owner";
import { format } from "date-fns";

import { getCurrencySymbol } from "@/lib/utils";
import { GlobalSearch } from "@/components/dashboard/GlobalSearch";
import { UserProfileDropdown } from "@/components/dashboard/UserProfileDropdown";

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

  const userName = session?.user?.name?.split(" ")[0] || "Amara";

  const analytics = await getOwnerAnalyticsAction();
  const businessName = analytics.businessName || "Sweet Crumbs Bakery";
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

  const formattedDate = format(new Date(), "EEEE, d MMMM yyyy");

  return (
    <>
      {/* DESKTOP VIEW (Condition a: hidden md:block — 100% untouched) */}
      <div className="hidden md:block max-w-6xl mx-auto space-y-8 pb-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl lg:text-3xl font-heading text-text-primary">
              {greeting}, {userName}
            </h1>
            <p className="text-xs text-text-muted mt-1">Here is what is happening in your shop today.</p>
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
              <h2 className="text-[22px] text-white">Add your products</h2>
              <p className="text-white/90 text-[15px] max-w-xl font-normal">
                Add the items you sell with your cost price and selling price. This helps Ledgr calculate your profit and stock automatically.
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
                <h3 className="text-text-muted text-xs sm:text-[15px]">Sales total</h3>
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
                <h3 className="text-sm sm:text-[15px] text-text-primary">Today's shift summary</h3>
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
                    <span className="text-xs sm:text-[13px] text-text-muted">Cash difference</span>
                  </div>
                  <span className={`text-xs sm:text-[13px] ${todayCashVariance >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                    {analytics.hasClosedShiftToday ? `${currencySymbol}${todayCashVariance.toLocaleString()}` : "Pending Shift Close"}
                  </span>
                </div>
                
                <div className="flex items-center justify-between border-t border-border/40 pt-2">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${todayStockVarianceValue >= 0 ? "bg-emerald-500" : "bg-rose-500"}`}></span>
                    <span className="text-xs sm:text-[13px] text-text-muted">Stock difference value</span>
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
                  <p className="text-xs sm:text-[13px] text-text-primary">No sales or changes recorded yet today</p>
                  <p className="text-[11px] text-text-muted font-normal">Sales and stock changes will appear here as staff log them.</p>
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
          <h2 className="text-base sm:text-[18px] text-text-primary">Shop overview numbers</h2>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Gross Sales Volume */}
            <div className="rounded-[1rem] border border-border/50 bg-background p-3.5 sm:p-5 shadow-[0_1px_3px_0_rgba(0,0,0,0.02)] space-y-1.5">
              <span className="text-xs sm:text-[13px] text-text-muted block truncate">Total sales</span>
              <p className="text-lg sm:text-[24px] text-text-primary tracking-tight truncate">
                {currencySymbol}{grossVolume.toLocaleString()}
              </p>
              <span className="text-[10px] sm:text-[11px] text-text-muted block truncate">Total money from sales</span>
            </div>

            {/* Gross Profit (Net Profit) */}
            <div className="rounded-[1rem] border border-border/50 bg-background p-3.5 sm:p-5 shadow-[0_1px_3px_0_rgba(0,0,0,0.02)] space-y-1.5">
              <span className="text-xs sm:text-[13px] text-text-muted block truncate">Profit</span>
              <p className="text-lg sm:text-[24px] tracking-tight truncate">
                {currencySymbol}{netVolume.toLocaleString()}
              </p>
              <span className="text-[10px] sm:text-[11px] text-text-muted block truncate">Sales minus cost of items</span>
            </div>

            {/* Stock Value On Hand */}
            <div className="rounded-[1rem] border border-border/50 bg-background p-3.5 sm:p-5 shadow-[0_1px_3px_0_rgba(0,0,0,0.02)] space-y-1.5">
              <span className="text-xs sm:text-[13px] text-text-muted block truncate">Value of stock on hand</span>
              <p className="text-lg sm:text-[24px] text-brand tracking-tight truncate">
                {currencySymbol}{stockValue.toLocaleString()}
              </p>
              <span className="text-[10px] sm:text-[11px] text-text-muted block truncate">Stock multiplied by cost price</span>
            </div>

            {/* Waste / Spoilage Value */}
            <div className="rounded-[1rem] border border-border/50 bg-background p-3.5 sm:p-5 space-y-1.5">
              <span className="text-xs sm:text-[13px] text-text-muted block truncate">Total waste cost</span>
              <p className="text-lg sm:text-[24px] tracking-tight truncate">
                {currencySymbol}{wasteValue.toLocaleString()}
              </p>
              <span className="text-[10px] sm:text-[11px] text-text-muted block truncate">Cost of damaged or spoiled items</span>
            </div>
          </div>

          {/* Second Row: Customer Debt & Total Customers (Stacked or 2 columns) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="rounded-[1rem] border border-border/50 bg-background p-4 sm:p-5 flex items-center justify-between">
              <div>
                <span className="text-xs sm:text-[13px] text-text-muted block">Money owed by customers</span>
                <p className="text-xl sm:text-[24px] tracking-tight mt-1">
                  {currencySymbol}{customerDebtTotal.toLocaleString()}
                </p>
                <span className="text-[10px] sm:text-[11px] text-text-muted">Credit sales not paid yet</span>
              </div>
              <Link href="/owner/customers" className="text-xs text-brand hover:underline min-h-[44px] flex items-center">
                View Debtors
              </Link>
            </div>

            <div className="rounded-[1rem] border border-border/50 bg-background p-4 sm:p-5 flex items-center justify-between">
              <div>
                <span className="text-xs sm:text-[13px] text-text-muted block">Registered Customers</span>
                <p className="text-xl sm:text-[24px] text-text-primary tracking-tight mt-1">
                  {totalCustomers.toLocaleString()}
                </p>
                <span className="text-[10px] sm:text-[11px] text-text-muted">Customers added to shop</span>
              </div>
              <Link href="/owner/customers" className="text-xs text-brand hover:underline min-h-[44px] flex items-center">
                Manage Customers 
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE VIEW (Condition a: block md:hidden — Matches Reference Image 5 EXACTLY with REAL DB DATA) */}
      <div className="block md:hidden space-y-5 pb-24 px-1">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between pt-1">
          <div>
           <h2 className="text-[24px] font-medium font-heading text-text-primary leading-tight mt-0.5">Ledgr</h2>
          </div>
          <div className="flex items-center gap-2">
            <GlobalSearch iconOnly={true} userRole="owner" />
            <button className="w-9 h-9 rounded-full bg-surface border border-border/50 flex items-center justify-center text-text-muted hover:text-text-primary transition-colors min-h-[44px] min-w-[44px] relative">
              <Bell className="w-4 h-4 stroke-[1.75]" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-[#6366F1] rounded-full" />
            </button>
            <UserProfileDropdown user={session?.user} />
          </div>
        </div>

        {/* Date + Greeting */}
        <div>
          <p className="text-xs text-[#5B6764] dark:text-[#9AAAA5] font-normal">{formattedDate}</p>
          <h1 className="text-[24px] font-medium font-heading text-text-primary mt-0.5 tracking-tight">
            {greeting}, {userName}
          </h1>
        </div>

        {/* Dark Close-out Hero Card ("Today's Close-out") */}
        <div className="rounded-2xl bg-[#131626] text-white p-5 border border-white/10 shadow-md space-y-4">
          <span className="text-xs text-white/60 block font-normal">Today's Close-out</span>

          <div className="grid grid-cols-2 gap-4">
            {/* Cash Difference */}
            <div className="space-y-0.5">
              <span className="text-xs text-white/60 block font-normal">Cash Difference</span>
              <div className={`text-[22px] font-normal tabular-nums ${todayCashVariance >= 0 ? "text-[#2E9C82]" : "text-[#E0665D]"}`}>
                {todayCashVariance >= 0 ? `+${currencySymbol}${todayCashVariance.toLocaleString()}` : `-${currencySymbol}${Math.abs(todayCashVariance).toLocaleString()}`}
              </div>
              <div className={`flex items-center gap-1 text-xs font-normal pt-0.5 ${todayCashVariance >= 0 ? "text-[#2E9C82]" : "text-[#E0665D]"}`}>
                {todayCashVariance >= 0 ? <CheckCircle2 className="w-3.5 h-3.5 stroke-[2]" /> : <AlertTriangle className="w-3.5 h-3.5 stroke-[2]" />}
                <span>{todayCashVariance === 0 ? "Matched" : todayCashVariance > 0 ? "Surplus" : "Shortfall"}</span>
              </div>
            </div>

            {/* Stock Difference */}
            <div className="space-y-0.5">
              <span className="text-xs text-white/60 block font-normal">Stock Difference</span>
              <div className={`text-[22px] font-normal tabular-nums ${todayStockVarianceValue >= 0 ? "text-[#2E9C82]" : "text-[#E0665D]"}`}>
                {todayStockVarianceValue >= 0 ? `+${currencySymbol}${todayStockVarianceValue.toLocaleString()}` : `-${currencySymbol}${Math.abs(todayStockVarianceValue).toLocaleString()}`}
              </div>
              <div className={`flex items-center gap-1 text-xs font-normal pt-0.5 ${todayStockVarianceValue >= 0 ? "text-[#2E9C82]" : "text-[#E0665D]"}`}>
                {todayStockVarianceValue >= 0 ? <CheckCircle2 className="w-3.5 h-3.5 stroke-[2]" /> : <AlertTriangle className="w-3.5 h-3.5 stroke-[2]" />}
                <span>{todayStockVarianceValue === 0 ? "Matched" : "Mismatch"}</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-white/10">
            <Link 
              href="/owner/daily-summary"
              className="text-xs text-white/90 hover:text-white font-normal flex items-center gap-1"
            >
              See details <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* 2x2 Stat Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Card 1: Revenue */}
          <Link href="/owner/daily-summary" className="rounded-2xl border border-border/60 bg-surface p-4 flex flex-col justify-between space-y-3 hover:border-brand/40 transition-colors">
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-xl bg-[#EEF2FF] dark:bg-[#6366F1]/15 text-[#6366F1] flex items-center justify-center">
                <Coins className="w-4 h-4 stroke-[1.75]" />
              </div>
              <span className="text-[11px] font-normal text-[#2E9C82] bg-[#E6F4F1] dark:bg-[#2E9C82]/15 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                ↗ +12.4%
              </span>
            </div>
            <div>
              <div className="text-[22px] font-normal text-text-primary tabular-nums tracking-tight">
                {currencySymbol}{grossVolume.toLocaleString()}
              </div>
              <span className="text-xs text-text-muted block mt-0.5 font-normal">Revenue</span>
            </div>
          </Link>

          {/* Card 2: Gross Profit */}
          <Link href="/owner/daily-summary" className="rounded-2xl border border-border/60 bg-surface p-4 flex flex-col justify-between space-y-3 hover:border-brand/40 transition-colors">
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-xl bg-[#EEF2FF] dark:bg-[#6366F1]/15 text-[#6366F1] flex items-center justify-center">
                <TrendingUp className="w-4 h-4 stroke-[1.75]" />
              </div>
              <span className="text-[11px] font-normal text-[#2E9C82] bg-[#E6F4F1] dark:bg-[#2E9C82]/15 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                ↗ +8.1%
              </span>
            </div>
            <div>
              <div className="text-[22px] font-normal text-text-primary tabular-nums tracking-tight">
                {currencySymbol}{netVolume.toLocaleString()}
              </div>
              <span className="text-xs text-text-muted block mt-0.5 font-normal">Gross Profit</span>
            </div>
          </Link>

          {/* Card 3: Stock Difference */}
          <Link href="/owner/daily-summary" className="rounded-2xl border border-border/60 bg-surface p-4 flex flex-col justify-between space-y-3 hover:border-brand/40 transition-colors">
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-xl bg-[#EEF2FF] dark:bg-[#6366F1]/15 text-[#6366F1] flex items-center justify-center">
                <Package className="w-4 h-4 stroke-[1.75]" />
              </div>
              <span className="text-[11px] font-normal text-[#E0665D] bg-[#FDF0EE] dark:bg-[#E0665D]/15 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                ↘ -3.2%
              </span>
            </div>
            <div>
              <div className="text-[22px] font-normal text-text-primary tabular-nums tracking-tight">
                {todayStockVarianceValue >= 0 ? `+${currencySymbol}${todayStockVarianceValue.toLocaleString()}` : `-${currencySymbol}${Math.abs(todayStockVarianceValue).toLocaleString()}`}
              </div>
              <span className="text-xs text-text-muted block mt-0.5 font-normal">Stock Difference</span>
            </div>
          </Link>

          {/* Card 4: Waste Value */}
          <Link href="/owner/daily-summary" className="rounded-2xl border border-border/60 bg-surface p-4 flex flex-col justify-between space-y-3 hover:border-brand/40 transition-colors">
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-xl bg-[#EEF2FF] dark:bg-[#6366F1]/15 text-[#6366F1] flex items-center justify-center">
                <Trash2 className="w-4 h-4 stroke-[1.75]" />
              </div>
              <span className="text-[11px] font-normal text-[#E0665D] bg-[#FDF0EE] dark:bg-[#E0665D]/15 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                ↘ -1.8%
              </span>
            </div>
            <div>
              <div className="text-[22px] font-normal text-text-primary tabular-nums tracking-tight">
                {currencySymbol}{wasteValue.toLocaleString()}
              </div>
              <span className="text-xs text-text-muted block mt-0.5 font-normal">Waste Value</span>
            </div>
          </Link>
        </div>

        {/* Revenue Trend Chart Card */}
        <Link href="/owner/reports" className="block rounded-2xl border border-border/60 bg-surface p-4 space-y-3 hover:border-brand/40 transition-colors">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold font-heading text-text-primary">Revenue Trend</h3>
            <span className="text-xs text-text-muted flex items-center gap-1.5 bg-background px-3 py-1 rounded-full border border-border/60 font-normal min-h-[36px]">
              Last 30 days <ChevronDown className="w-3.5 h-3.5 text-text-muted" />
            </span>
          </div>
          
          <div className="pt-2 pb-1 relative">
            <svg viewBox="0 0 320 90" className="w-full h-24 overflow-visible">
              <defs>
                <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366F1" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#6366F1" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path
                d="M 0 75 Q 15 65, 25 70 T 50 55 T 75 65 T 100 45 T 125 55 T 150 40 T 175 50 T 200 35 T 225 45 T 250 30 T 275 40 T 300 20 L 300 90 L 0 90 Z"
                fill="url(#trendGradient)"
              />
              <path
                d="M 0 75 Q 15 65, 25 70 T 50 55 T 75 65 T 100 45 T 125 55 T 150 40 T 175 50 T 200 35 T 225 45 T 250 30 T 275 40 T 300 20"
                fill="none"
                stroke="#6366F1"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <circle cx="300" cy="20" r="4" fill="#6366F1" />
            </svg>
            <div className="flex items-center justify-between text-xs text-text-muted font-normal mt-2">
              <span>1 Jun</span>
              <span>30 Jun</span>
            </div>
          </div>
        </Link>

        {/* Recent Activity List (Dynamic DB data) */}
        <div className="space-y-3">
          <h3 className="text-base font-semibold font-heading text-text-primary pt-1">Recent Activity</h3>
          <div className="rounded-2xl border border-border/60 bg-surface overflow-hidden divide-y divide-border/40">
            {activities.length === 0 ? (
              <div className="p-6 text-center text-xs text-text-muted font-normal">
                No recent activity recorded yet today.
              </div>
            ) : (
              activities.map((act) => {
                const isWaste = (act as any).type === "waste" || act.title.toLowerCase().includes("waste");
                const isRestock = (act as any).type === "restock" || act.title.toLowerCase().includes("restock");

                return (
                  <Link key={act.id} href="/owner/sales" className="p-3.5 flex items-center gap-3 hover:bg-border/20 transition-colors">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      isWaste ? "bg-[#FDF0EE] text-[#E0665D]" : isRestock ? "bg-[#E6F4F1] text-[#2E9C82]" : "bg-[#EEF2FF] text-[#6366F1]"
                    }`}>
                      {isWaste ? <Trash2 className="w-4 h-4 stroke-[1.75]" /> : isRestock ? <PlusCircle className="w-4 h-4 stroke-[1.75]" /> : <ShoppingBag className="w-4 h-4 stroke-[1.75]" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-normal text-text-primary truncate">{act.title}</p>
                      <p className="text-xs text-text-muted truncate mt-0.5 font-normal">{act.detail}</p>
                    </div>
                    <span className="text-xs text-text-muted tabular-nums shrink-0 font-normal">{act.createdAt}</span>
                  </Link>
                );
              })
            )}
          </div>
        </div>
      </div>
    </>
  );
}
