"use client";

import { useState } from "react";
import { Download, Calendar, Loader2, FileSpreadsheet, CheckCircle2 } from "lucide-react";
import { format, subDays } from "date-fns";
import { exportReportsCsvAction } from "@/app/actions/owner";

export function ReportsView() {
  const todayStr = format(new Date(), "yyyy-MM-dd");
  const thirtyDaysAgoStr = format(subDays(new Date(), 30), "yyyy-MM-dd");

  const [startDate, setStartDate] = useState(thirtyDaysAgoStr);
  const [endDate, setEndDate] = useState(todayStr);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleExport = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMsg("");

    const res = await exportReportsCsvAction(startDate, endDate);

    if (res.error) {
      setError(res.error);
    } else if (res.csvContent) {
      // Trigger native file download
      const blob = new Blob([res.csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `ledgr_sales_report_${startDate}_to_${endDate}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setSuccessMsg("CSV report exported successfully!");
      setTimeout(() => setSuccessMsg(""), 4000);
    }

    setLoading(false);
  };

  const presetRanges = [
    { label: "Today", getRange: () => ({ start: todayStr, end: todayStr }) },
    { label: "Last 7 Days", getRange: () => ({ start: format(subDays(new Date(), 7), "yyyy-MM-dd"), end: todayStr }) },
    { label: "Last 30 Days", getRange: () => ({ start: thirtyDaysAgoStr, end: todayStr }) },
    { label: "This Month", getRange: () => ({ start: format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), "yyyy-MM-dd"), end: todayStr }) },
  ];

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      
      {/* Date Range Selection Card */}
      <div className="bg-background border border-border/50 rounded-2xl p-5 sm:p-7 shadow-sm space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-border/40">
          <div className="p-3 bg-brand/10 text-brand rounded-xl">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-bold text-text-primary text-base sm:text-lg">Export Financial Ledger Data</h2>
            <p className="text-xs sm:text-sm text-text-muted">Select a date range to generate a generic CSV export (Revenue, Cost, Profit, Qty).</p>
          </div>
        </div>

        {/* Quick Date Presets */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">Quick Date Presets</label>
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
                className="py-2.5 px-3 rounded-xl border border-border/50 bg-surface/40 hover:bg-surface text-xs font-semibold text-text-primary transition-colors min-h-[44px]"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleExport} className="space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-danger/10 text-danger text-xs font-semibold border border-danger/20">
              {error}
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 text-emerald-600 text-xs font-semibold border border-emerald-500/20 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              {successMsg}
            </div>
          )}

          {/* Full-Width Touch Native Date Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="startDate" className="text-xs font-semibold text-text-primary block">
                Start Date
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 absolute left-3 top.1/2 top-3.5 text-brand" />
                <input 
                  id="startDate"
                  type="date"
                  value={startDate}
                  max={endDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full pl-9 pr-4 py-3 bg-surface border border-border/50 rounded-xl text-sm font-medium text-text-primary focus:ring-2 focus:ring-brand/40 outline-none transition-all min-h-[48px]"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="endDate" className="text-xs font-semibold text-text-primary block">
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
                  className="w-full pl-9 pr-4 py-3 bg-surface border border-border/50 rounded-xl text-sm font-medium text-text-primary focus:ring-2 focus:ring-brand/40 outline-none transition-all min-h-[48px]"
                  required
                />
              </div>
            </div>
          </div>

          {/* Large Full-Width Primary Gradient Export Button */}
          <button 
            type="submit"
            disabled={loading}
            className="w-full py-4 px-6 [background:var(--brand-gradient)] text-white text-base font-bold rounded-2xl shadow-lg hover:opacity-90 active:scale-[0.99] transition-all flex items-center justify-center gap-2.5 min-h-[52px]"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Download className="w-5 h-5" />
                Export CSV Report
              </>
            )}
          </button>
        </form>
      </div>

    </div>
  );
}
