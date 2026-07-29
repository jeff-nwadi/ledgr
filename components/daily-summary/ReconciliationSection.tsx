import { AlertCircle, CheckCircle2, Trash2 } from "lucide-react";

export function ReconciliationSection({
  cashVariance,
  stockVariance,
  wasteValue,
}: {
  cashVariance: number | null;
  stockVariance: number | null;
  wasteValue: number;
}) {
  const formatMoney = (amount: number) => {
    return `₦${Math.abs(amount).toLocaleString()}`;
  };

  const isCashMatched = cashVariance === 0;
  const isStockMatched = stockVariance === 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Cash Variance */}
      <div className={`p-5 rounded-[1rem] bg-background border shadow-sm transition-all ${
        cashVariance !== null && !isCashMatched ? "border-danger/40 bg-danger/5" : "border-border/50"
      }`}>
        <div className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Cash Variance</div>
        {cashVariance === null ? (
          <div className="text-2xl font-bold font-heading text-text-muted">—</div>
        ) : isCashMatched ? (
          <div className="flex items-center gap-2.5 text-success">
            <CheckCircle2 className="w-6 h-6 flex-shrink-0" />
            <span className="text-2xl font-bold font-heading">Balanced (₦0)</span>
          </div>
        ) : (
          <div className="flex items-center gap-2.5 text-danger">
            <AlertCircle className="w-6 h-6 flex-shrink-0 animate-pulse" />
            <span className="text-2xl sm:text-3xl font-extrabold font-heading tracking-tight">
              {cashVariance > 0 ? "+" : "-"}{formatMoney(cashVariance)}
            </span>
          </div>
        )}
      </div>

      {/* Stock Variance */}
      <div className={`p-5 rounded-[1rem] bg-background border shadow-sm transition-all ${
        stockVariance !== null && !isStockMatched ? "border-danger/40 bg-danger/5" : "border-border/50"
      }`}>
        <div className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Stock Variance</div>
        {stockVariance === null ? (
          <div className="text-2xl font-bold font-heading text-text-muted">—</div>
        ) : isStockMatched ? (
          <div className="flex items-center gap-2.5 text-success">
            <CheckCircle2 className="w-6 h-6 flex-shrink-0" />
            <span className="text-2xl font-bold font-heading">Balanced (₦0)</span>
          </div>
        ) : (
          <div className="flex items-center gap-2.5 text-danger">
            <AlertCircle className="w-6 h-6 flex-shrink-0 animate-pulse" />
            <span className="text-2xl sm:text-3xl font-extrabold font-heading tracking-tight">
              {stockVariance > 0 ? "+" : "-"}{formatMoney(stockVariance)}
            </span>
          </div>
        )}
      </div>

      {/* Waste Value */}
      <div className="p-5 rounded-[1rem] bg-background border border-border/50 shadow-sm">
        <div className="flex items-center gap-2 mb-2 text-text-muted">
          <Trash2 className="w-4 h-4" />
          <span className="text-xs font-semibold uppercase tracking-wider">Waste Value</span>
        </div>
        <div className="text-2xl sm:text-3xl font-bold font-heading text-text-primary">
          {wasteValue > 0 ? formatMoney(wasteValue) : "₦0"}
        </div>
      </div>
    </div>
  );
}
