import { AlertTriangle, CheckCircle2, ArrowRight } from "lucide-react";

export function DailyStockTable({ entries }: { entries: any[] }) {
  if (entries.length === 0) return null;

  return (
    <div className="rounded-[1rem] bg-background border border-border/50 shadow-sm overflow-hidden">
      <div className="p-4 sm:p-5 border-b border-border/50 bg-surface/30">
        <h2 className="text-sm sm:text-[15px] font-semibold text-text-primary">Stock Ledger</h2>
        <p className="text-xs text-text-muted mt-0.5">Physical product reconciliation for the day</p>
      </div>
      
      {/* Mobile Stacked Product Cards View */}
      <div className="block md:hidden divide-y divide-border/40 p-3 space-y-3">
        {entries.map((entry) => {
          const isUncounted = entry.countedClosingQty === null;
          const hasVariance = !isUncounted && entry.varianceQty !== 0;

          return (
            <div 
              key={entry.id} 
              className={`p-4 rounded-xl border transition-all space-y-3 ${
                hasVariance ? "border-danger/40 bg-danger/5" : "border-border/40 bg-surface/20"
              }`}
            >
              {/* Product Card Header */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-bold text-text-primary text-base leading-snug">{entry.productName}</h3>
                  <span className="text-xs text-text-muted">{entry.productUnit || "Unit"}</span>
                </div>
                {isUncounted ? (
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-surface text-text-muted border border-border/60">
                    Not Counted
                  </span>
                ) : entry.varianceQty === 0 ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Balanced
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-600 border border-rose-500/20">
                    <AlertTriangle className="w-3.5 h-3.5" /> 
                    {entry.varianceQty > 0 ? `+${entry.varianceQty} Surplus` : `${entry.varianceQty} Shortfall`}
                  </span>
                )}
              </div>

              {/* Horizontal Movement Flow (Left-to-Right Ledger Sequence) */}
              <div className="bg-background/80 p-2.5 rounded-lg border border-border/30 overflow-x-auto">
                <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider block mb-1">
                  Ledger Flow Sequence
                </span>
                <div className="flex items-center gap-1.5 text-xs whitespace-nowrap">
                  <div className="px-2 py-1 bg-surface rounded-md font-semibold text-text-primary">
                    Open: <span className="font-bold">{entry.openingQty}</span>
                  </div>
                  <ArrowRight className="w-3 h-3 text-text-muted/60 flex-shrink-0" />
                  <div className="px-2 py-1 bg-surface rounded-md font-semibold text-text-primary">
                    Added: <span className="font-bold">{entry.addedQty > 0 ? `+${entry.addedQty}` : "0"}</span>
                  </div>
                  <ArrowRight className="w-3 h-3 text-text-muted/60 flex-shrink-0" />
                  <div className="px-2 py-1 bg-surface rounded-md font-semibold text-text-primary">
                    Sold: <span className="font-bold">{entry.soldQty > 0 ? `-${entry.soldQty}` : "0"}</span>
                  </div>
                  <ArrowRight className="w-3 h-3 text-text-muted/60 flex-shrink-0" />
                  <div className="px-2 py-1 bg-surface rounded-md font-semibold text-text-primary">
                    Waste: <span className="font-bold">{entry.wasteQty > 0 ? `-${entry.wasteQty}` : "0"}</span>
                  </div>
                </div>
              </div>

              {/* Reconciled Closing Summary Footer */}
              <div className="grid grid-cols-3 gap-2 pt-1 text-center text-xs">
                <div className="p-2 rounded-lg bg-surface/60">
                  <span className="text-[10px] text-text-muted block uppercase">System Calc</span>
                  <span className="font-bold text-text-primary">{entry.calculatedClosingQty}</span>
                </div>
                <div className="p-2 rounded-lg bg-surface/60">
                  <span className="text-[10px] text-text-muted block uppercase">Phys Counted</span>
                  <span className="font-bold text-text-primary">{isUncounted ? "—" : entry.countedClosingQty}</span>
                </div>
                <div className={`p-2 rounded-lg ${hasVariance ? "bg-rose-500/10 text-rose-600" : "bg-surface/60 text-text-primary"}`}>
                  <span className="text-[10px] block uppercase opacity-80">Variance</span>
                  <span className="font-extrabold">{isUncounted ? "—" : `${entry.varianceQty > 0 ? "+" : ""}${entry.varianceQty}`}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="border-b border-border/50 bg-surface/50">
              <th className="px-5 py-3 text-[12px] font-medium text-text-muted uppercase tracking-wider">Product</th>
              <th className="px-5 py-3 text-[12px] font-medium text-text-muted uppercase tracking-wider text-right">Opening</th>
              <th className="px-5 py-3 text-[12px] font-medium text-text-muted uppercase tracking-wider text-right">Added</th>
              <th className="px-5 py-3 text-[12px] font-medium text-text-muted uppercase tracking-wider text-right">Sold</th>
              <th className="px-5 py-3 text-[12px] font-medium text-text-muted uppercase tracking-wider text-right">Waste</th>
              <th className="px-5 py-3 text-[12px] font-medium text-text-muted uppercase tracking-wider text-right">System Closing</th>
              <th className="px-5 py-3 text-[12px] font-medium text-text-muted uppercase tracking-wider text-right">Counted</th>
              <th className="px-5 py-3 text-[12px] font-medium text-text-muted uppercase tracking-wider text-right">Variance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            {entries.map((entry) => {
              const isUncounted = entry.countedClosingQty === null;
              
              return (
                <tr key={entry.id} className="hover:bg-surface/30 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="text-[14px] font-medium text-text-primary">{entry.productName}</div>
                    <div className="text-[12px] text-text-muted">{entry.productUnit}</div>
                  </td>
                  <td className="px-5 py-3.5 text-right font-medium text-[14px] text-text-primary">
                    {entry.openingQty}
                  </td>
                  <td className="px-5 py-3.5 text-right font-medium text-[14px] text-text-primary">
                    {entry.addedQty > 0 ? `+${entry.addedQty}` : "0"}
                  </td>
                  <td className="px-5 py-3.5 text-right font-medium text-[14px] text-text-primary">
                    {entry.soldQty > 0 ? `-${entry.soldQty}` : "0"}
                  </td>
                  <td className="px-5 py-3.5 text-right font-medium text-[14px] text-text-primary">
                    {entry.wasteQty > 0 ? `-${entry.wasteQty}` : "0"}
                  </td>
                  <td className="px-5 py-3.5 text-right font-medium text-[14px] text-text-muted bg-surface/30 border-l border-r border-border/30">
                    {entry.calculatedClosingQty}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    {isUncounted ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-surface text-text-muted border border-border">
                        Not Counted
                      </span>
                    ) : (
                      <span className="font-medium text-[14px] text-text-primary">{entry.countedClosingQty}</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    {isUncounted ? (
                      <span className="text-[13px] text-text-muted">—</span>
                    ) : (
                      <span className={`font-medium text-[14px] ${entry.varianceQty === 0 ? 'text-success' : 'text-danger'}`}>
                        {entry.varianceQty > 0 ? "+" : ""}{entry.varianceQty}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
