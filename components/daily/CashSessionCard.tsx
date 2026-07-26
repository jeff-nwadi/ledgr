"use client";

import { useState } from "react";
import { openCashSessionAction, closeCashSessionAction } from "@/app/actions/daily";
import { Loader2, Wallet, CheckCircle2, AlertCircle } from "lucide-react";

interface CashSessionCardProps {
  activeSession: any; // Ideally typed, using any for brevity in MVP
  cashSalesTotal: number;
}

export function CashSessionCard({ activeSession, cashSalesTotal }: CashSessionCardProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [openingFloat, setOpeningFloat] = useState("");
  const [countedCash, setCountedCash] = useState("");
  const [closedVariance, setClosedVariance] = useState<number | null>(null);

  const formatMoney = (amount: number) => `₦${amount.toLocaleString()}`;

  const handleOpen = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await openCashSessionAction(parseInt(openingFloat, 10));
    if (res.error) setError(res.error);
    setLoading(false);
  };

  const handleClose = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await closeCashSessionAction(activeSession.id, parseInt(countedCash, 10));
    if (res.error) {
      setError(res.error);
    } else {
      if (res.variance !== undefined) {
        setClosedVariance(res.variance);
      }
    }
    setLoading(false);
  };

  // If a session was just closed, show the result.
  if (closedVariance !== null) {
    return (
      <div className="bg-surface rounded-[1.25rem] p-6 border border-border/50 text-center">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 ${closedVariance === 0 ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
          {closedVariance === 0 ? <CheckCircle2 className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
        </div>
        <h3 className="text-[18px] font-semibold text-text-primary">Shift Closed</h3>
        <p className="text-[13px] text-text-muted mt-1 mb-4">
          {closedVariance === 0 
            ? "Your cash drawer matched exactly!" 
            : `You have a variance of ${formatMoney(closedVariance)}.`}
        </p>
      </div>
    );
  }

  if (!activeSession) {
    return (
      <div className="bg-background rounded-[1.25rem] p-6 border border-border/50 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-brand/10 text-brand rounded-full flex items-center justify-center">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-text-primary text-[16px]">Start Cash Shift</h3>
            <p className="text-[13px] text-text-muted">Enter the starting float in your drawer.</p>
          </div>
        </div>

        <form onSubmit={handleOpen} className="space-y-4">
          {error && <div className="text-[13px] text-danger bg-danger/10 p-2 rounded">{error}</div>}
          <div>
            <label className="text-[13px] font-medium text-text-primary block mb-1">Opening Float (₦)</label>
            <input 
              type="number"
              required
              min="0"
              value={openingFloat}
              onChange={(e) => setOpeningFloat(e.target.value)}
              className="w-full px-3 py-2 bg-surface border border-border/50 rounded-lg text-sm text-text-primary focus:ring-1 focus:ring-brand/50 outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-[var(--brand-gradient)] text-white text-sm font-medium rounded-full hover:opacity-90 transition-opacity flex justify-center items-center"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Open Shift"}
          </button>
        </form>
      </div>
    );
  }

  const expectedTotal = activeSession.openingFloat + cashSalesTotal;

  return (
    <div className="bg-background rounded-[1.25rem] p-6 border border-border/50 shadow-sm">
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-border/40">
        <div>
          <h3 className="font-semibold text-text-primary text-[16px]">Active Shift</h3>
          <p className="text-[13px] text-success font-medium">Shift in progress</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <p className="text-[12px] text-text-muted uppercase tracking-wider font-medium mb-1">Opening Float</p>
          <p className="font-semibold text-text-primary text-[15px]">{formatMoney(activeSession.openingFloat)}</p>
        </div>
        <div>
          <p className="text-[12px] text-text-muted uppercase tracking-wider font-medium mb-1">Expected Cash</p>
          <p className="font-semibold text-brand text-[15px]">{formatMoney(expectedTotal)}</p>
        </div>
      </div>

      <form onSubmit={handleClose} className="space-y-4 pt-4 border-t border-border/40">
        {error && <div className="text-[13px] text-danger bg-danger/10 p-2 rounded">{error}</div>}
        <div>
          <label className="text-[13px] font-medium text-text-primary block mb-1">Counted Cash in Drawer (₦)</label>
          <input 
            type="number"
            required
            min="0"
            value={countedCash}
            onChange={(e) => setCountedCash(e.target.value)}
            placeholder="Enter actual physical cash"
            className="w-full px-3 py-2 bg-surface border border-border/50 rounded-lg text-sm text-text-primary focus:ring-1 focus:ring-brand/50 outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-background text-text-primary border border-border text-sm font-medium rounded-full hover:bg-surface transition-colors flex justify-center items-center"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Close Shift"}
        </button>
      </form>
    </div>
  );
}
