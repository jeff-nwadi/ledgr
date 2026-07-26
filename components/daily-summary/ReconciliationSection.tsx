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
    <div className="grid md:grid-cols-3 gap-4">
      {/* Cash Variance */}
      <div className="p-5 rounded-[1rem] bg-background border border-border/50 shadow-sm">
        <div className="text-[13px] font-medium text-text-muted mb-4">Cash Variance</div>
        {cashVariance === null ? (
          <div className="text-xl font-bold font-heading text-text-primary">—</div>
        ) : isCashMatched ? (
          <div className="flex items-center gap-2 text-success">
            <CheckCircle2 className="w-5 h-5" />
            <span className="text-xl font-bold font-heading">Matched</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-danger">
            <AlertCircle className="w-5 h-5" />
            <span className="text-xl font-bold font-heading">
              {cashVariance > 0 ? "+" : "-"}{formatMoney(cashVariance)}
            </span>
          </div>
        )}
      </div>

      {/* Stock Variance */}
      <div className="p-5 rounded-[1rem] bg-background border border-border/50 shadow-sm">
        <div className="text-[13px] font-medium text-text-muted mb-4">Stock Variance</div>
        {stockVariance === null ? (
          <div className="text-xl font-bold font-heading text-text-primary">—</div>
        ) : isStockMatched ? (
          <div className="flex items-center gap-2 text-success">
            <CheckCircle2 className="w-5 h-5" />
            <span className="text-xl font-bold font-heading">Matched</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-danger">
            <AlertCircle className="w-5 h-5" />
            <span className="text-xl font-bold font-heading">
              {stockVariance > 0 ? "+" : "-"}{formatMoney(stockVariance)}
            </span>
          </div>
        )}
      </div>

      {/* Waste Value */}
      <div className="p-5 rounded-[1rem] bg-background border border-border/50 shadow-sm">
        <div className="flex items-center gap-2 mb-4 text-text-muted">
          <Trash2 className="w-4 h-4" />
          <span className="text-[13px] font-medium">Waste Value</span>
        </div>
        <div className="text-xl font-bold font-heading text-text-primary">
          {wasteValue > 0 ? formatMoney(wasteValue) : "₦0"}
        </div>
      </div>
    </div>
  );
}
