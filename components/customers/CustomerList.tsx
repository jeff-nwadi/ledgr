"use client";

import { useState } from "react";
import { Plus, Search, User, CreditCard, Loader2 } from "lucide-react";
import { addCustomerAction, markPaymentReceivedAction } from "@/app/actions/customers";

interface Customer {
  id: string;
  name: string;
  phone: string | null;
  balanceOwed: number;
}

interface CustomerListProps {
  customers: Customer[];
  currencySymbol?: string;
}

export function CustomerList({ customers, currencySymbol = "₦" }: CustomerListProps) {
  const [search, setSearch] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [paymentModalData, setPaymentModalData] = useState<Customer | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");

  const formatMoney = (amount: number) => `${currencySymbol}${amount.toLocaleString()}`;

  const filtered = customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    (c.phone && c.phone.includes(search))
  );

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await addCustomerAction(newName, newPhone);
    if (res.error) setError(res.error);
    else {
      setIsAddModalOpen(false);
      setNewName("");
      setNewPhone("");
    }
    setLoading(false);
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentModalData) return;
    setLoading(true);
    setError("");
    const res = await markPaymentReceivedAction(paymentModalData.id, parseInt(paymentAmount, 10));
    if (res.error) setError(res.error);
    else {
      setPaymentModalData(null);
      setPaymentAmount("");
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-center gap-4 justify-between">
        <div className="relative w-full sm:w-60">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input 
            type="text" 
            placeholder="Search customers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-background border border-border/50 rounded-full text-[13px] focus:ring-1 focus:ring-brand/50 outline-none transition-all"
          />
        </div>
        
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="w-full sm:w-auto px-5 py-2.5 [background:var(--brand-gradient)] text-white text-[13px] font-medium rounded-full hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Customer
        </button>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-border/50 rounded-[1.25rem] bg-surface/30">
          <div className="w-12 h-12 bg-background rounded-full flex items-center justify-center text-text-muted/50 mx-auto mb-3">
            <User className="w-6 h-6" />
          </div>
          <h3 className="text-[14px] font-medium text-text-primary">No customers found</h3>
          <p className="text-[13px] text-text-muted mt-1">Add your first customer to start tracking debt.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(c => {
            const isOwing = c.balanceOwed > 0;

            return (
              <div 
                key={c.id} 
                className={`bg-background border rounded-2xl p-5 transition-all shadow-xs space-y-4 ${
                  isOwing ? "border-danger/40 bg-danger/5" : "border-border/50 hover:border-brand/30"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-text-primary text-base sm:text-[17px]">{c.name}</h3>
                    {c.phone && <p className="text-xs text-text-muted mt-0.5">{c.phone}</p>}
                  </div>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isOwing ? "bg-danger/10 text-danger" : "bg-emerald-500/10 text-emerald-600"
                  }`}>
                    <User className="w-5 h-5" />
                  </div>
                </div>
                
                {/* Visual Anchor: Owed Balance Big & Color-coded */}
                <div className="p-3 rounded-xl bg-background/90 border border-border/40 flex items-center justify-between">
                  <div>
                    <p className="text-[11px] uppercase tracking-wider font-semibold text-text-muted">Balance Status</p>
                    <p className={`font-extrabold text-xl sm:text-2xl mt-0.5 tracking-tight ${
                      isOwing ? 'text-danger' : 'text-emerald-600'
                    }`}>
                      {formatMoney(c.balanceOwed)}
                    </p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    isOwing ? 'bg-danger/10 text-danger border border-danger/20' : 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                  }`}>
                    {isOwing ? "Owing Debt" : "Paid Up"}
                  </span>
                </div>

                {/* Mark Payment Action Button (≥44px touch target) */}
                {isOwing ? (
                  <button 
                    onClick={() => setPaymentModalData(c)}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 [background:var(--brand-gradient)] text-white text-xs font-bold rounded-xl shadow-xs hover:opacity-90 transition-opacity min-h-[44px]"
                  >
                    <CreditCard className="w-4 h-4" />
                    Mark Payment Received
                  </button>
                ) : (
                  <div className="text-center py-2 text-xs font-medium text-text-muted/60">
                    No outstanding balance
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-background w-full max-w-md rounded-[1.25rem] shadow-xl overflow-hidden border border-border/50">
            <div className="px-6 py-4 border-b border-border/40 flex items-center justify-between">
              <h2 className="font-semibold text-text-primary text-[16px]">Add Customer</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-text-muted hover:text-text-primary">
                <Plus className="w-5 h-5 rotate-45" />
              </button>
            </div>
            <form onSubmit={handleAdd} className="p-6 space-y-4">
              {error && <div className="text-[13px] text-danger bg-danger/10 p-2 rounded">{error}</div>}
              <div>
                <label className="text-[13px] font-medium text-text-primary block mb-1">Customer Name</label>
                <input 
                  type="text" required value={newName} onChange={e => setNewName(e.target.value)}
                  className="w-full px-3 py-2 bg-surface border border-border/50 rounded-lg text-sm text-text-primary focus:ring-1 focus:ring-brand/50 outline-none"
                />
              </div>
              <div>
                <label className="text-[13px] font-medium text-text-primary block mb-1">Phone Number (Optional)</label>
                <input 
                  type="tel" value={newPhone} onChange={e => setNewPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-surface border border-border/50 rounded-lg text-sm text-text-primary focus:ring-1 focus:ring-brand/50 outline-none"
                />
              </div>
              <div className="pt-2">
                <button type="submit" disabled={loading} className="w-full py-2.5 [background:var(--brand-gradient)] text-white text-[13px] font-medium rounded-full hover:opacity-90 flex justify-center">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Customer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {paymentModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-background w-full max-w-md rounded-[1.25rem] shadow-xl overflow-hidden border border-border/50">
            <div className="px-6 py-4 border-b border-border/40 flex items-center justify-between">
              <h2 className="font-semibold text-text-primary text-[16px]">Receive Payment</h2>
              <button onClick={() => setPaymentModalData(null)} className="text-text-muted hover:text-text-primary">
                <Plus className="w-5 h-5 rotate-45" />
              </button>
            </div>
            <form onSubmit={handlePayment} className="p-6 space-y-4">
              {error && <div className="text-[13px] text-danger bg-danger/10 p-2 rounded">{error}</div>}
              <div className="mb-4">
                <p className="text-[13px] text-text-muted">Recording payment for</p>
                <p className="font-semibold text-text-primary text-[15px]">{paymentModalData.name}</p>
                <p className="text-[13px] text-danger mt-1">Current Balance: {formatMoney(paymentModalData.balanceOwed)}</p>
              </div>
              <div>
                <label className="text-[13px] font-medium text-text-primary block mb-1">Payment Amount ({currencySymbol})</label>
                <input 
                  type="number" required min="1" max={paymentModalData.balanceOwed} value={paymentAmount} onChange={e => setPaymentAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-surface border border-border/50 rounded-lg text-sm text-text-primary focus:ring-1 focus:ring-brand/50 outline-none"
                />
              </div>
              <div className="pt-2">
                <button type="submit" disabled={loading} className="w-full py-2.5 [background:var(--brand-gradient)] text-white text-[13px] font-medium rounded-full hover:opacity-90 flex justify-center">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm Payment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
