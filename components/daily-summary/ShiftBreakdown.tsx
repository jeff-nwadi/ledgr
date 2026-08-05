import { format } from "date-fns";

export function ShiftBreakdown({ sessions }: { sessions: any[] }) {
  if (sessions.length === 0) return null;

  const formatMoney = (amount: number) => `₦${amount.toLocaleString()}`;

  return (
    <div className="rounded-[1rem] bg-background border border-border/50 shadow-sm overflow-hidden">
      <div className="p-4 sm:p-5 border-b border-border/50 bg-surface/30">
        <h2 className="text-sm sm:text-[15px] font-semibold text-text-primary">Shift Breakdown</h2>
        <p className="text-xs text-text-muted mt-0.5">Cash reconciliation across all shifts for the day</p>
      </div>
      
      {/* Mobile Shift Cards View */}
      <div className="block md:hidden divide-y divide-border/40 p-3 space-y-3">
        {sessions.map((s) => {
          const isOpen = s.closedAt === null || s.countedCash === null;
          return (
            <div key={s.id} className="p-4 rounded-xl border border-border/40 bg-surface/20 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-text-primary text-base">{s.staffName}</h3>
                  <p className="text-xs text-text-muted">
                    {format(new Date(s.date), "h:mm a")} - {isOpen ? "Ongoing" : format(new Date(s.closedAt), "h:mm a")}
                  </p>
                </div>
                {isOpen ? (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                    Active Shift
                  </span>
                ) : (
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                    s.variance === 0 
                      ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" 
                      : "bg-rose-500/10 text-rose-600 border border-rose-500/20"
                  }`}>
                    {s.variance === 0 ? "Balanced" : `Difference: ${s.variance > 0 ? "+" : ""}${formatMoney(s.variance)}`}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/30 text-center">
                <div className="p-2 rounded-lg bg-surface/50">
                  <span className="text-[10px] text-text-muted block uppercase">Float</span>
                  <span className="text-xs font-semibold text-text-primary">{formatMoney(s.openingFloat)}</span>
                </div>
                <div className="p-2 rounded-lg bg-surface/50">
                  <span className="text-[10px] text-text-muted block uppercase">Expected</span>
                  <span className="text-xs font-semibold text-text-primary">{formatMoney(s.expectedCash)}</span>
                </div>
                <div className="p-2 rounded-lg bg-surface/50">
                  <span className="text-[10px] text-text-muted block uppercase">Counted</span>
                  <span className="text-xs font-semibold text-text-primary">
                    {isOpen ? "—" : formatMoney(s.countedCash)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="border-b border-border/50 bg-surface/50">
              <th className="px-5 py-3 text-[12px] font-medium text-text-muted uppercase tracking-wider">Staff</th>
              <th className="px-5 py-3 text-[12px] font-medium text-text-muted uppercase tracking-wider">Shift Time</th>
              <th className="px-5 py-3 text-[12px] font-medium text-text-muted uppercase tracking-wider text-right">Opening Float</th>
              <th className="px-5 py-3 text-[12px] font-medium text-text-muted uppercase tracking-wider text-right">Expected</th>
              <th className="px-5 py-3 text-[12px] font-medium text-text-muted uppercase tracking-wider text-right">Counted</th>
              <th className="px-5 py-3 text-[12px] font-medium text-text-muted uppercase tracking-wider text-right">Difference</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            {sessions.map((s) => {
              const isOpen = s.closedAt === null || s.countedCash === null;
              return (
                <tr key={s.id} className="hover:bg-surface/30 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="text-[14px] font-medium text-text-primary">{s.staffName}</div>
                  </td>
                  <td className="px-5 py-3.5 text-[13px] text-text-muted">
                    {format(new Date(s.date), "h:mm a")} - {isOpen ? "Ongoing" : format(new Date(s.closedAt), "h:mm a")}
                  </td>
                  <td className="px-5 py-3.5 text-right font-medium text-[14px] text-text-primary">
                    {formatMoney(s.openingFloat)}
                  </td>
                  <td className="px-5 py-3.5 text-right font-medium text-[14px] text-text-primary">
                    {formatMoney(s.expectedCash)}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    {isOpen ? (
                      <span className="text-[13px] text-text-muted">—</span>
                    ) : (
                      <span className="font-medium text-[14px] text-text-primary">{formatMoney(s.countedCash)}</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    {isOpen ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-surface text-text-muted border border-border">
                        Open
                      </span>
                    ) : (
                      <span className={`font-medium text-[14px] ${s.variance === 0 ? 'text-success' : 'text-danger'}`}>
                        {s.variance > 0 ? "+" : ""}{formatMoney(s.variance)}
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
