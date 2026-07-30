import { AlertCircle, CheckCircle2, Trash2 } from "lucide-react";

export function ReconciliationSection({
  cashVariance,
  stockVariance,
  wasteValue,
  currencySymbol = "₦",
}: {
  cashVariance: number | null;
  stockVariance: number | null;
  wasteValue: number;
  currencySymbol?: string;
}) {
  const formatMoney = (amount: number) => {
    return `${currencySymbol}${Math.abs(amount).toLocaleString()}`;
  };

  const isCashMatched = cashVariance === 0;
  const isStockMatched = stockVariance === 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Cash Variance */}
      <div className={`p-5 rounded-[1rem] bg-background border shadow-sm transition-[background-color,border-color,transform] duration-220 ease-out motion-reduce:transition-none ${
        cashVariance !== null && !isCashMatched ? "border-danger/40 bg-danger/5 shadow-danger/5" : "border-border/50"
      }`}>
        <div className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Cash Variance</div>
        {cashVariance === null ? (
          <div className="text-2xl font-bold font-heading text-text-muted">—</div>
        ) : isCashMatched ? (
          <div className="flex items-center gap-2.5 text-success animate-in fade-in zoom-in-95 duration-200">
            <CheckCircle2 className="w-6 h-6 flex-shrink-0" />
            <span className="text-2xl font-bold font-heading tabular-nums">Balanced ({currencySymbol}0)</span>
          </div>
        ) : (
          <div className="flex items-center gap-2.5 text-danger animate-in fade-in zoom-in-95 duration-200">
            <AlertCircle className="w-6 h-6 flex-shrink-0 animate-in zoom-in-75 duration-200" />
            <span className="text-2xl sm:text-3xl font-extrabold font-heading tracking-tight tabular-nums">
              {cashVariance > 0 ? "+" : "-"}{formatMoney(cashVariance)}
            </span>
          </div>
        )}
      </div>

      {/* Stock Variance */}
      <div className={`p-5 rounded-[1rem] bg-background border shadow-sm transition-[background-color,border-color,transform] duration-220 ease-out motion-reduce:transition-none ${
        stockVariance !== null && !isStockMatched ? "border-danger/40 bg-danger/5 shadow-danger/5" : "border-border/50"
      }`}>
        <div className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Stock Variance</div>
        {stockVariance === null ? (
          <div className="text-2xl font-bold font-heading text-text-muted">—</div>
        ) : isStockMatched ? (
          <div className="flex items-center gap-2.5 text-success animate-in fade-in zoom-in-95 duration-200">
            <CheckCircle2 className="w-6 h-6 flex-shrink-0" />
            <span className="text-2xl font-bold font-heading tabular-nums">Balanced ({currencySymbol}0)</span>
          </div>
        ) : (
          <div className="flex items-center gap-2.5 text-danger animate-in fade-in zoom-in-95 duration-200">
            <AlertCircle className="w-6 h-6 flex-shrink-0 animate-in zoom-in-75 duration-200" />
            <span className="text-2xl sm:text-3xl font-extrabold font-heading tracking-tight tabular-nums">
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
        <div className="text-2xl sm:text-3xl font-bold font-heading text-text-primary tabular-nums">
          {wasteValue > 0 ? formatMoney(wasteValue) : `${currencySymbol}0`}
        </div>
      </div>
    </div>
  );
}
