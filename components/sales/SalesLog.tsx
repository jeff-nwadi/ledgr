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
}

export function SalesLog({ sales }: SalesLogProps) {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("all");

  const formatMoney = (amount: number) => `₦${amount.toLocaleString()}`;

  const filtered = sales.filter(s => {
    const matchesSearch = 
      s.staffName.toLowerCase().includes(search.toLowerCase()) || 
      s.customerName?.toLowerCase().includes(search.toLowerCase());
    
    const matchesType = filterType === "all" || s.paymentType === filterType;

    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-center gap-4 justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input 
            type="text" 
            placeholder="Search by staff or customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-background border border-border/50 rounded-full text-[13px] focus:ring-1 focus:ring-brand/50 outline-none transition-all"
          />
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-text-muted hidden sm:block" />
          <select 
            value={filterType} 
            onChange={e => setFilterType(e.target.value)}
            className="w-full sm:w-auto px-4 py-2.5 bg-background border border-border/50 rounded-full text-[13px] text-text-primary focus:outline-none focus:ring-1 focus:ring-brand/50 capitalize"
          >
            <option value="all">All Payment Types</option>
            <option value="cash">Cash</option>
            <option value="credit">Credit</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-background border border-border/50 rounded-[1.25rem] overflow-hidden shadow-sm">
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
