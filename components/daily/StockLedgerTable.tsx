"use client";

import { useState } from "react";
import { confirmStockCountAction } from "@/app/actions/daily";
import { Check, Loader2 } from "lucide-react";

interface LedgerRow {
  productId: string;
  name: string;
  unit: string;
  costPrice: number;
  openingQty: number;
  addedQty: number;
  soldQty: number;
  wasteQty: number;
  calculatedClosingQty: number;
  countedClosingQty?: number | null;
  varianceQty?: number | null;
}

interface StockLedgerTableProps {
  ledger: LedgerRow[];
}

export function StockLedgerTable({ ledger: initialLedger }: StockLedgerTableProps) {
  const [ledger, setLedger] = useState(initialLedger);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleConfirm = async (productId: string) => {
    const row = ledger.find(r => r.productId === productId);
    if (!row || row.countedClosingQty === undefined || row.countedClosingQty === null) return;

    setLoadingId(productId);
    
    const res = await confirmStockCountAction(
      productId,
      row.openingQty,
      row.addedQty,
      row.soldQty,
      row.wasteQty,
      row.calculatedClosingQty,
      row.countedClosingQty,
      row.costPrice
    );

    if (res.success) {
      setLedger(ledger.map(r => 
        r.productId === productId 
          ? { ...r, varianceQty: r.countedClosingQty! - r.calculatedClosingQty }
          : r
      ));
    }
    
    setLoadingId(null);
  };

  if (ledger.length === 0) {
    return (
      <div className="py-12 text-center text-text-muted border border-border/50 rounded-2xl bg-surface/50">
        No products available to reconcile.
      </div>
    );
  }

  return (
    <div className="bg-background border border-border/50 rounded-[1.25rem] shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-[13px]">
          <thead className="bg-surface/50 border-b border-border/40 text-text-muted">
            <tr>
              <th className="px-6 py-4 font-medium">Product Name</th>
              <th className="px-6 py-4 font-medium text-right">Opening</th>
              <th className="px-6 py-4 font-medium text-right">Added</th>
              <th className="px-6 py-4 font-medium text-right text-success">Sold</th>
              <th className="px-6 py-4 font-medium text-right text-danger">Waste</th>
              <th className="px-6 py-4 font-medium text-right text-brand">Calculated</th>
              <th className="px-6 py-4 font-medium text-right">Counted</th>
              <th className="px-6 py-4 font-medium text-right">Variance</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            {ledger.map((row) => (
              <tr key={row.productId} className="hover:bg-surface/30 transition-colors">
                <td className="px-6 py-4 font-medium text-text-primary">
                  {row.name}
                  <span className="block text-[11px] font-normal text-text-muted mt-0.5">{row.unit}</span>
                </td>
                <td className="px-6 py-4 text-text-muted font-medium text-right">{row.openingQty}</td>
                <td className="px-6 py-4 text-text-muted font-medium text-right">{row.addedQty}</td>
                <td className="px-6 py-4 text-success font-medium text-right">{row.soldQty}</td>
                <td className="px-6 py-4 text-danger font-medium text-right">{row.wasteQty}</td>
                <td className="px-6 py-4 text-brand font-medium text-right bg-brand/5">{row.calculatedClosingQty}</td>
                
                <td className="px-6 py-4 text-right">
                  {row.varianceQty !== undefined && row.varianceQty !== null ? (
                    <span className="font-medium text-text-primary">{row.countedClosingQty}</span>
                  ) : (
                    <input 
                      type="number"
                      min="0"
                      value={row.countedClosingQty ?? ''}
                      onChange={(e) => {
                        const val = e.target.value === '' ? null : parseInt(e.target.value, 10);
                        setLedger(ledger.map(r => r.productId === row.productId ? { ...r, countedClosingQty: val } : r));
                      }}
                      className="w-20 px-2 py-1.5 text-right bg-surface border border-border/50 rounded-lg text-sm text-text-primary focus:ring-1 focus:ring-brand/50 outline-none"
                    />
                  )}
                </td>

                <td className="px-6 py-4 text-right">
                  {row.varianceQty !== undefined && row.varianceQty !== null ? (
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full font-medium ${
                      row.varianceQty === 0 
                        ? 'bg-success/10 text-success' 
                        : 'bg-danger/10 text-danger'
                    }`}>
                      {row.varianceQty > 0 ? '+' : ''}{row.varianceQty}
                    </span>
                  ) : (
                    <span className="text-text-muted/40">-</span>
                  )}
                </td>

                <td className="px-6 py-4 text-right">
                  {row.varianceQty === undefined || row.varianceQty === null ? (
                    <button
                      onClick={() => handleConfirm(row.productId)}
                      disabled={loadingId === row.productId || row.countedClosingQty === undefined || row.countedClosingQty === null}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-background border border-border/50 hover:bg-surface text-text-primary text-xs font-medium rounded-full transition-colors disabled:opacity-50"
                    >
                      {loadingId === row.productId ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                      Confirm
                    </button>
                  ) : (
                    <span className="text-success text-xs font-medium flex items-center justify-end gap-1">
                      <Check className="w-3.5 h-3.5" /> Reconciled
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
