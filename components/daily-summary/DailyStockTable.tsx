export function DailyStockTable({ entries }: { entries: any[] }) {
  if (entries.length === 0) return null;

  return (
    <div className="rounded-[1rem] bg-background border border-border/50 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-border/50 bg-surface/30">
        <h2 className="text-[15px] font-semibold text-text-primary">Stock Ledger</h2>
        <p className="text-[13px] text-text-muted mt-0.5">Physical product reconciliation for the day</p>
      </div>
      
      <div className="overflow-x-auto">
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
