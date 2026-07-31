"use client";

import { useState } from "react";
import { Search, Filter, ReceiptText } from "lucide-react";
import { format } from "date-fns";

interface SaleRecord {
  id: string;
  createdAt: Date;
  total: number;
  paymentType: string;
  staffName: string;
  customerName?: string | null;
}

interface SalesLogProps {
  sales: SaleRecord[];
  currencySymbol?: string;
}

export function SalesLog({ sales, currencySymbol = "₦" }: SalesLogProps) {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("all");

  const formatMoney = (amount: number) => `${currencySymbol}${amount.toLocaleString()}`;

  const filtered = sales.filter(s => {
    const matchesSearch = 
      s.staffName.toLowerCase().includes(search.toLowerCase()) || 
      s.customerName?.toLowerCase().includes(search.toLowerCase());
    
    const matchesType = filterType === "all" || s.paymentType === filterType;

    return matchesSearch && matchesType;
  });

  const [isFilterOpen, setIsFilterOpen] = useState(false);

  return (
    <div className="space-y-6">
      
      {/* Toolbar */}
      <div className="flex items-center gap-3 justify-between">
        <div className="relative flex-1 sm:max-w-xs sm:w-60">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input 
            type="text" 
            placeholder="Search by staff or customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-background border border-border/50 rounded-xl text-sm focus:ring-1 focus:ring-brand/50 outline-none transition-all min-h-[44px]"
          />
        </div>

        {/* Mobile Filter Button */}
        <button
          onClick={() => setIsFilterOpen(true)}
          className="flex md:hidden items-center gap-2 px-4 py-2.5 bg-surface border border-border/50 rounded-xl text-sm font-medium text-text-primary min-h-[44px]"
        >
          <Filter className="w-4 h-4 text-brand" />
          Filter
        </button>
        
        {/* Desktop Filter Dropdown */}
        <div className="hidden md:flex items-center gap-2">
          <Filter className="w-4 h-4 text-text-muted" />
          <select 
            value={filterType} 
            onChange={e => setFilterType(e.target.value)}
            className="px-4 py-2.5 bg-background border border-border/50 rounded-xl text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-brand/50 capitalize"
          >
            <option value="all">All Payment Types</option>
            <option value="cash">Cash</option>
            <option value="credit">Credit</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      {/* Filter Bottom Sheet for Mobile */}
      {isFilterOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setIsFilterOpen(false)} />
          <div className="relative bg-background border-t border-border rounded-t-2xl p-6 space-y-4 z-10 animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-border/40">
              <h3 className="font-bold text-text-primary text-base">Filter Sales Log</h3>
              <button 
                onClick={() => setIsFilterOpen(false)}
                className="text-xs font-semibold text-brand px-3 py-1.5 rounded-lg bg-brand/10"
              >
                Done
              </button>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-semibold text-text-muted uppercase">Payment Type</label>
              <div className="grid grid-cols-2 gap-2">
                {["all", "cash", "credit", "other"].map((type) => (
                  <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-medium capitalize min-h-[44px] ${
                      filterType === type 
                        ? "bg-brand text-white border-brand font-bold" 
                        : "bg-surface text-text-primary border-border/40"
                    }`}
                  >
                    {type === "all" ? "All Types" : type}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Sales Cards View */}
      <div className="block md:hidden space-y-3">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-text-muted text-sm bg-background border border-border/40 rounded-xl">
            <ReceiptText className="w-8 h-8 opacity-20 mx-auto mb-2" />
            No sales found matching your filters.
          </div>
        ) : (
          filtered.map((s) => (
            <div key={s.id} className="p-4 rounded-xl border border-border/50 bg-background shadow-xs space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-lg font-bold font-heading text-text-primary tabular-nums">
                    {formatMoney(s.total)}
                  </span>
                  <div className="text-xs text-text-muted mt-0.5">
                    {format(new Date(s.createdAt), "MMM d, yyyy · h:mm a")}
                  </div>
                </div>

                <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                  s.paymentType === 'cash' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' :
                  s.paymentType === 'credit' ? 'bg-rose-500/10 text-rose-600 border-rose-500/20' :
                  'bg-surface text-text-muted border-border'
                }`}>
                  {s.paymentType}
                </span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border/30 text-xs">
                <span className="text-text-muted">Logged by: <strong className="text-text-primary">{s.staffName}</strong></span>
                {s.customerName && (
                  <span className="bg-brand/10 text-brand px-2 py-0.5 rounded font-medium">
                    Customer: {s.customerName}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-background border border-border/50 rounded-[1.25rem] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border/50 bg-surface/30">
                <th className="px-5 py-4 text-[12px] font-semibold text-text-muted uppercase tracking-wider">Date & Time</th>
                <th className="px-5 py-4 text-[12px] font-semibold text-text-muted uppercase tracking-wider">Staff</th>
                <th className="px-5 py-4 text-[12px] font-semibold text-text-muted uppercase tracking-wider">Customer</th>
                <th className="px-5 py-4 text-[12px] font-semibold text-text-muted uppercase tracking-wider">Type</th>
                <th className="px-5 py-4 text-[12px] font-semibold text-text-muted uppercase tracking-wider text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-text-muted text-[13px]">
                    <div className="flex flex-col items-center gap-2">
                      <ReceiptText className="w-8 h-8 opacity-20" />
                      No sales found matching your filters.
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map(s => (
                  <tr key={s.id} className="hover:bg-surface/30 transition-colors group">
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="text-[13px] font-medium text-text-primary">{format(new Date(s.createdAt), "MMM d, yyyy")}</div>
                      <div className="text-[11px] text-text-muted mt-0.5">{format(new Date(s.createdAt), "h:mm a")}</div>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-[13px] text-text-primary">
                      {s.staffName}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-[13px] text-text-primary">
                      {s.customerName ? (
                        <span className="bg-brand/10 text-brand px-2 py-1 rounded-md text-[11px] font-medium">{s.customerName}</span>
                      ) : (
                        <span className="text-text-muted">-</span>
                      )}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className={`text-[11px] font-medium uppercase tracking-wider px-2 py-1 rounded-md ${
                        s.paymentType === 'cash' ? 'bg-success/10 text-success' :
                        s.paymentType === 'credit' ? 'bg-danger/10 text-danger' :
                        'bg-surface text-text-muted'
                      }`}>
                        {s.paymentType}
                      </span>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-right text-[14px] font-semibold text-text-primary tabular-nums">
                      {formatMoney(s.total)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
