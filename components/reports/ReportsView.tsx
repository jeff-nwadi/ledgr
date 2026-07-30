"use client";

import { useState, useEffect, useMemo } from "react";
import { 
  Download, 
  Printer, 
  Calendar, 
  Loader2, 
  FileSpreadsheet, 
  CheckCircle2, 
  Search, 
  Filter, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Package, 
  AlertCircle, 
  UserCheck, 
  BarChart3, 
  ReceiptText 
} from "lucide-react";
import { format, subDays, startOfWeek, startOfMonth } from "date-fns";
import { exportReportsCsvAction } from "@/app/actions/owner";
import { getOwnerReportsDataAction } from "@/app/actions/reports";
import { getCurrencySymbol } from "@/lib/utils";

export function ReportsView() {
  const todayStr = format(new Date(), "yyyy-MM-dd");
  const firstOfMonthStr = format(startOfMonth(new Date()), "yyyy-MM-dd");

  const [startDate, setStartDate] = useState(firstOfMonthStr);
  const [endDate, setEndDate] = useState(todayStr);

  const [loading, setLoading] = useState(true);
  const [exportLoading, setExportLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [reportData, setReportData] = useState<any>(null);

  // Filters for Detailed Sales Table
  const [searchQuery, setSearchQuery] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [staffFilter, setStaffFilter] = useState("all");

  // Fetch report data whenever startDate or endDate changes
  const fetchReportData = async (start: string, end: string) => {
    setLoading(true);
    setError("");
    const res = await getOwnerReportsDataAction(start, end);
    if (res.error) {
      setError(res.error);
    } else {
      setReportData(res);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchReportData(startDate, endDate);
  }, [startDate, endDate]);

  const currencySymbol = getCurrencySymbol(reportData?.currency);

  const handleExportCsv = async () => {
    setExportLoading(true);
    setError("");
    setSuccessMsg("");

    const res = await exportReportsCsvAction(startDate, endDate);

    if (res.error) {
      setError(res.error);
    } else if (res.csvContent) {
      const blob = new Blob([res.csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `ledgr_report_${startDate}_to_${endDate}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setSuccessMsg("CSV report exported successfully!");
      setTimeout(() => setSuccessMsg(""), 4000);
    }

    setExportLoading(false);
  };

  const handlePrintPdf = () => {
    window.print();
  };

  const presetRanges = [
    { label: "Today", getRange: () => ({ start: todayStr, end: todayStr }) },
    { label: "This Week", getRange: () => ({ start: format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd"), end: todayStr }) },
    { label: "This Month", getRange: () => ({ start: firstOfMonthStr, end: todayStr }) },
    { label: "Last 30 Days", getRange: () => ({ start: format(subDays(new Date(), 30), "yyyy-MM-dd"), end: todayStr }) },
  ];

  // Filter detailed sales table
  const filteredSales = useMemo(() => {
    if (!reportData?.detailedSales) return [];
    return reportData.detailedSales.filter((s: any) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = 
        s.staffName.toLowerCase().includes(q) ||
        s.itemsSummary.toLowerCase().includes(q) ||
        (s.customerName && s.customerName.toLowerCase().includes(q));

      const matchesPayment = paymentFilter === "all" || s.paymentType === paymentFilter;
      const matchesStaff = staffFilter === "all" || s.staffName === staffFilter;

      return matchesSearch && matchesPayment && matchesStaff;
    });
  }, [reportData?.detailedSales, searchQuery, paymentFilter, staffFilter]);

  const uniqueStaffNames = useMemo(() => {
    if (!reportData?.detailedSales) return [];
    const set = new Set<string>();
    reportData.detailedSales.forEach((s: any) => set.add(s.staffName));
    return Array.from(set);
  }, [reportData?.detailedSales]);

  return (
    <div className="space-y-8 print:space-y-6">
      
      {/* EXPORT / PRINT COVER HEADER (Visible in Print & Screen) */}
      <div className="hidden print:block p-6 border-b border-border/50 space-y-2 text-center">
        <h1 className="text-3xl font-heading text-text-primary">{reportData?.businessName || "Ledgr Business"}</h1>
        <p className="text-sm text-text-muted">Executive Sales & Stock Reconciliation Report</p>
        <p className="text-xs text-text-muted">Period: {startDate} to {endDate} · Generated on {format(new Date(), "PPpp")}</p>
      </div>

      {/* NO-PRINT CONTROLS SECTION */}
      <div className="print:hidden space-y-6">
        
        {/* Date Range Selector & Presets */}
        <div className="bg-background border border-border/50 rounded-2xl p-5 sm:p-6 space-y-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border/40">
            <div>
              <h2 className="text-text-primary text-base sm:text-lg font-heading">Report Date Range</h2>
              <p className="text-xs text-text-muted font-normal">Select a date range to filter financial metrics, staff accountability, and sales logs.</p>
            </div>

            {/* Dual Separate Export Buttons */}
            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleExportCsv}
                disabled={exportLoading || loading}
                className="flex-1 sm:flex-none px-4 py-2.5 bg-surface border border-border/60 hover:bg-surface/80 text-text-primary text-xs rounded-xl transition-all flex items-center justify-center gap-2 min-h-[44px]"
              >
                {exportLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4 text-emerald-600" />}
                Export CSV
              </button>

              <button
                type="button"
                onClick={handlePrintPdf}
                disabled={loading}
                className="flex-1 sm:flex-none px-4 py-2.5 [background:var(--brand-gradient)] text-white text-xs rounded-xl hover:opacity-90 active:scale-[0.96] transition-all flex items-center justify-center gap-2 min-h-[44px]"
              >
                <Printer className="w-4 h-4" />
                Export PDF
              </button>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="space-y-2">
            <label className="text-xs text-text-muted uppercase">Quick Presets</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {presetRanges.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => {
                    const range = preset.getRange();
                    setStartDate(range.start);
                    setEndDate(range.end);
                  }}
                  className="py-2 px-3 rounded-xl border border-border/50 bg-surface/40 hover:bg-surface text-xs text-text-primary transition-colors min-h-[40px]"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Native Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="startDate" className="text-xs text-text-muted block">
                Start Date
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 absolute left-3 top-3.5 text-brand" />
                <input 
                  id="startDate"
                  type="date"
                  value={startDate}
                  max={endDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-surface border border-border/50 rounded-xl text-sm text-text-primary focus:ring-2 focus:ring-brand/40 outline-none transition-all min-h-[44px]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="endDate" className="text-xs text-text-muted block">
                End Date
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 absolute left-3 top-3.5 text-brand" />
                <input 
                  id="endDate"
                  type="date"
                  value={endDate}
                  min={startDate}
                  max={todayStr}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-surface border border-border/50 rounded-xl text-sm text-text-primary focus:ring-2 focus:ring-brand/40 outline-none transition-all min-h-[44px]"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-danger/10 text-danger text-xs border border-danger/20">
              {error}
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 text-emerald-600 text-xs border border-emerald-500/20 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              {successMsg}
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center space-y-3">
          <Loader2 className="w-8 h-8 text-brand animate-spin mx-auto" />
          <p className="text-xs text-text-muted">Loading report analytics...</p>
        </div>
      ) : (
        <>
          {/* SUMMARY KPI CARDS */}
          <div className="space-y-3">
            <h2 className="text-base sm:text-lg font-heading text-text-primary">Period Financial Summary</h2>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="p-4 rounded-2xl bg-background border border-border/50 space-y-1">
                <span className="text-xs text-text-muted block">Total Revenue</span>
                <p className="text-xl sm:text-2xl font-heading text-text-primary tabular-nums">
                  {currencySymbol}{(reportData?.totalRevenue || 0).toLocaleString()}
                </p>
                <span className="text-[11px] text-text-muted block">{reportData?.totalSalesCount || 0} transactions</span>
              </div>

              <div className="p-4 rounded-2xl bg-background border border-border/50 space-y-1">
                <span className="text-xs text-text-muted block">COGS</span>
                <p className="text-xl sm:text-2xl font-bold font-heading text-danger tabular-nums">
                  {currencySymbol}{(reportData?.totalCogs || 0).toLocaleString()}
                </p>
                <span className="text-[11px] text-text-muted block">Cost of goods sold</span>
              </div>

              <div className="p-4 rounded-2xl bg-background border border-border/50 space-y-1">
                <span className="text-xs text-text-muted block">Gross Profit</span>
                <p className="text-xl sm:text-2xl font-heading text-success tabular-nums">
                  {currencySymbol}{(reportData?.grossProfit || 0).toLocaleString()}
                </p>
                <span className="text-[11px] text-text-muted block">Revenue − COGS</span>
              </div>

              <div className="p-4 rounded-2xl bg-background border border-border/50 shadow-sm space-y-1">
                <span className="text-xs text-text-muted block">Total Waste Cost</span>
                <p className="text-xl sm:text-2xl font-heading text-danger tabular-nums">
                  {currencySymbol}{(reportData?.totalWasteValue || 0).toLocaleString()}
                </p>
                <span className="text-[11px] text-text-muted block">Spoiled inventory</span>
              </div>
            </div>

            {/* Variance Summary Cards (Same visual treatment as Daily Summary) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className={`p-4 rounded-2xl border shadow-sm ${
                (reportData?.cashVarianceSum || 0) !== 0 ? "bg-danger/5 border-danger/30" : "bg-background border-border/50"
              }`}>
                <span className="text-xs text-text-muted uppercase block mb-1">Cash Variance (Sum)</span>
                <div className="flex items-center gap-2">
                  {(reportData?.cashVarianceSum || 0) === 0 ? (
                    <span className="text-xl font-heading text-success">Balanced ({currencySymbol}0)</span>
                  ) : (
                    <span className="text-xl font-heading text-danger tabular-nums">
                      {(reportData?.cashVarianceSum || 0) > 0 ? "+" : ""}{currencySymbol}{(reportData?.cashVarianceSum || 0).toLocaleString()}
                    </span>
                  )}
                </div>
              </div>

              <div className={`p-4 rounded-2xl border ${
                (reportData?.stockVarianceSum || 0) !== 0 ? "bg-danger/5 border-danger/30" : "bg-background border-border/50"
              }`}>
                <span className="text-xs text-text-muted uppercase tracking-wider block mb-1">Stock Variance Value (Sum)</span>
                <div className="flex items-center gap-2">
                  {(reportData?.stockVarianceSum || 0) === 0 ? (
                    <span className="text-xl font-heading text-success">Balanced ({currencySymbol}0)</span>
                  ) : (
                    <span className="text-xl font-heading text-danger tabular-nums">
                      {(reportData?.stockVarianceSum || 0) > 0 ? "+" : ""}{currencySymbol}{(reportData?.stockVarianceSum || 0).toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ACCOUNTABILITY BREAKDOWN BY STAFF */}
          <div className="space-y-3 pt-4">
            <div className="flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-brand" />
              <h2 className="text-base sm:text-lg font-heading text-text-primary">Staff Accountability & Variance Breakdown</h2>
            </div>

            <div className="bg-background border border-border/50 rounded-2xl overflow-hidden">
              {(!reportData?.staffBreakdown || reportData.staffBreakdown.length === 0) ? (
                <div className="p-8 text-center text-xs text-text-muted">No staff activity logged in this period.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-surface border-b border-border/40 text-text-muted uppercase">
                      <tr>
                        <th className="p-3.5">Staff Member</th>
                        <th className="p-3.5 text-right">Sales Count</th>
                        <th className="p-3.5 text-right">Revenue</th>
                        <th className="p-3.5 text-right">Cash Variance</th>
                        <th className="p-3.5 text-right">Stock Variance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40 text-text-primary font-normal">
                      {reportData.staffBreakdown.map((st: any) => (
                        <tr key={st.staffId} className="hover:bg-surface/50 transition-colors">
                          <td className="p-3.5 text-text-primary">{st.staffName}</td>
                          <td className="p-3.5 text-right tabular-nums">{st.totalSalesCount}</td>
                          <td className="p-3.5 text-right text-brand tabular-nums">{currencySymbol}{st.totalRevenue.toLocaleString()}</td>
                          <td className={`p-3.5 text-right tabular-nums ${st.cashVarianceSum === 0 ? "text-success" : "text-danger"}`}>
                            {st.cashVarianceSum > 0 ? "+" : ""}{currencySymbol}{st.cashVarianceSum.toLocaleString()}
                          </td>
                          <td className={`p-3.5 text-right tabular-nums ${st.stockVarianceSum === 0 ? "text-success" : "text-danger"}`}>
                            {st.stockVarianceSum > 0 ? "+" : ""}{currencySymbol}{st.stockVarianceSum.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* PRODUCT BREAKDOWN (TOP SELLERS) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            <div className="space-y-3">
              <h3 className="text-sm font-heading text-text-primary">Top Products by Revenue</h3>
              <div className="bg-background border border-border/50 rounded-2xl p-4 space-y-3">
                {(!reportData?.topByRevenue || reportData.topByRevenue.length === 0) ? (
                  <p className="text-xs text-text-muted text-center py-4">No products sold in period.</p>
                ) : (
                  reportData.topByRevenue.map((p: any, idx: number) => (
                    <div key={p.productId} className="flex items-center justify-between text-xs py-1 border-b border-border/30 last:border-0">
                      <div className="flex items-center gap-2 truncate">
                        <span className="size-5 rounded-full bg-surface flex items-center justify-center text-[10px] text-text-muted shrink-0">{idx + 1}</span>
                        <span className="text-text-primary truncate">{p.productName}</span>
                      </div>
                      <span className="text-brand tabular-nums shrink-0">{currencySymbol}{p.revenueGenerated.toLocaleString()}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-heading text-text-primary">Top Products by Quantity</h3>
              <div className="bg-background border border-border/50 rounded-2xl p-4 space-y-3">
                {(!reportData?.topByQuantity || reportData.topByQuantity.length === 0) ? (
                  <p className="text-xs text-text-muted text-center py-4">No products sold in period.</p>
                ) : (
                  reportData.topByQuantity.map((p: any, idx: number) => (
                    <div key={p.productId} className="flex items-center justify-between text-xs py-1 border-b border-border/30 last:border-0">
                      <div className="flex items-center gap-2 truncate">
                        <span className="size-5 rounded-full bg-surface flex items-center justify-center text-[10px] text-text-muted shrink-0">{idx + 1}</span>
                        <span className="text-text-primary truncate">{p.productName}</span>
                      </div>
                      <span className="text-text-primary tabular-nums shrink-0">{p.quantitySold} {p.unit}s</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* DETAILED SALES TABLE (SEARCHABLE & FILTERABLE) */}
          <div className="space-y-3 pt-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <ReceiptText className="w-5 h-5 text-brand" />
                <h2 className="text-base sm:text-lg font-heading text-text-primary">Detailed Sales Ledger ({filteredSales.length})</h2>
              </div>

              {/* Filters (No-print) */}
              <div className="print:hidden flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-48">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-text-muted" />
                  <input
                    type="text"
                    placeholder="Search staff, item..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-surface border border-border/50 rounded-xl text-xs text-text-primary focus:ring-1 focus:ring-brand outline-none"
                  />
                </div>

                <select
                  value={paymentFilter}
                  onChange={(e) => setPaymentFilter(e.target.value)}
                  className="px-3 py-1.5 bg-surface border border-border/50 rounded-xl text-xs text-text-primary outline-none"
                >
                  <option value="all">All Payments</option>
                  <option value="cash">Cash</option>
                  <option value="credit">Credit</option>
                  <option value="other">Other</option>
                </select>

                <select
                  value={staffFilter}
                  onChange={(e) => setStaffFilter(e.target.value)}
                  className="px-3 py-1.5 bg-surface border border-border/50 rounded-xl text-xs text-text-primary outline-none"
                >
                  <option value="all">All Staff</option>
                  {uniqueStaffNames.map(name => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Desktop Table / Mobile Cards */}
            <div className="bg-background border border-border/50 rounded-2xl overflow-hidden">
              {filteredSales.length === 0 ? (
                <div className="p-8 text-center text-xs text-text-muted">No sales matched your filters.</div>
              ) : (
                <>
                  {/* Desktop Table View */}
                  <div className="hidden sm:block overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-surface border-b border-border/40 text-text-muted  uppercase">
                        <tr>
                          <th className="p-3.5">Date & Time</th>
                          <th className="p-3.5">Staff</th>
                          <th className="p-3.5">Items</th>
                          <th className="p-3.5">Payment</th>
                          <th className="p-3.5 text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/40 text-text-primary font-normal">
                        {filteredSales.map((s: any) => (
                          <tr key={s.id} className="hover:bg-surface/50 transition-colors">
                            <td className="p-3.5 text-text-muted whitespace-nowrap">{s.date}</td>
                            <td className="p-3.5 text-text-primary whitespace-nowrap">{s.staffName}</td>
                            <td className="p-3.5 max-w-xs truncate">{s.itemsSummary || "Sale Item"}</td>
                            <td className="p-3.5 uppercase text-[10px]">
                              <span className={`px-2 py-0.5 rounded-full ${
                                s.paymentType === "credit" ? "bg-amber-500/10 text-amber-600" : "bg-emerald-500/10 text-emerald-600"
                              }`}>
                                {s.paymentType}
                              </span>
                            </td>
                            <td className="p-3.5 text-right text-text-primary tabular-nums">{currencySymbol}{s.total.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Cards View */}
                  <div className="block sm:hidden divide-y divide-border/40">
                    {filteredSales.map((s: any) => (
                      <div key={s.id} className="p-4 space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-text-primary">{s.staffName}</span>
                          <span className="text-brand tabular-nums">{currencySymbol}{s.total.toLocaleString()}</span>
                        </div>
                        <p className="text-xs text-text-muted">{s.itemsSummary}</p>
                        <div className="flex items-center justify-between text-[11px] text-text-muted pt-1">
                          <span>{s.date}</span>
                          <span className="uppercase text-[10px] px-2 py-0.5 rounded-full bg-surface">{s.paymentType}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}

    </div>
  );
}
