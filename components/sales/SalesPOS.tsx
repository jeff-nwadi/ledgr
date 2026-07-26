"use client";

import { useCartStore } from "@/lib/store/cartStore";
import { Plus, Minus, X, ShoppingCart, Loader2 } from "lucide-react";
import { useState } from "react";
import { logSaleAction, logWasteAction } from "@/app/actions/sales";

interface Product {
  id: string;
  name: string;
  unit: string;
  sellingPrice: number;
  costPrice: number;
  currentStock: number;
}

interface SalesPOSProps {
  products: Product[];
}

export function SalesPOS({ products }: SalesPOSProps) {
  const { items, mode, setMode, addItem, removeItem, updateQuantity, clearCart, getTotal } = useCartStore();
  const [paymentType, setPaymentType] = useState<"cash" | "credit" | "other">("cash");
  const [wasteReason, setWasteReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const formatMoney = (amount: number) => `₦${amount.toLocaleString()}`;

  const handleCheckout = async () => {
    if (items.length === 0) return;
    setLoading(true);
    setError("");

    const payload = items.map(i => ({
      productId: i.productId,
      quantity: i.quantity,
      price: i.price,
      cost: i.cost
    }));

    let res;
    if (mode === "sale") {
      res = await logSaleAction(payload, paymentType);
    } else {
      if (!wasteReason) {
        setError("Please provide a reason for the waste.");
        setLoading(false);
        return;
      }
      res = await logWasteAction(payload, wasteReason);
    }

    if (res.error) {
      setError(res.error);
    } else {
      clearCart();
      setWasteReason("");
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      
      {/* LEFT PANE: Product Grid */}
      <div className="flex-1 space-y-4">
        {/* Mode Toggle */}
        <div className="flex bg-surface p-1 rounded-xl w-fit border border-border/50">
          <button 
            onClick={() => setMode('sale')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === 'sale' ? 'bg-white text-text-primary shadow-sm' : 'text-text-muted hover:text-text-primary'}`}
          >
            Log Sale
          </button>
          <button 
            onClick={() => setMode('waste')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === 'waste' ? 'bg-white text-danger shadow-sm' : 'text-text-muted hover:text-text-primary'}`}
          >
            Log Waste
          </button>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-12 text-text-muted">No products available. Add some from the Products tab.</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {products.map(p => (
              <button
                key={p.id}
                onClick={() => addItem({
                  productId: p.id,
                  name: p.name,
                  price: p.sellingPrice,
                  cost: p.costPrice,
                  maxStock: p.currentStock
                })}
                className="flex flex-col items-start p-4 bg-background border border-border/50 rounded-2xl hover:border-brand/30 hover:shadow-sm transition-all text-left"
              >
                <div className="font-semibold text-text-primary mb-1 line-clamp-1">{p.name}</div>
                <div className="text-sm font-medium text-text-muted mb-3">{formatMoney(p.sellingPrice)}</div>
                
                <div className="mt-auto pt-3 border-t border-border/30 w-full flex justify-between items-center text-xs">
                  <span className="text-text-muted">Stock</span>
                  <span className={`font-medium ${p.currentStock > 0 ? 'text-success' : 'text-danger'}`}>
                    {p.currentStock} {p.unit}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* RIGHT PANE: Cart */}
      <div className="w-full lg:w-[400px] flex-shrink-0">
        <div className="bg-background border border-border/50 rounded-2xl p-5 sticky top-4 shadow-[0_2px_8px_0_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-2 mb-6 text-text-primary font-heading font-semibold text-lg">
            <ShoppingCart className="w-5 h-5" />
            Current {mode === 'sale' ? 'Sale' : 'Waste'}
          </div>

          {error && (
            <div className="p-3 mb-4 rounded-lg bg-danger/10 text-danger text-[13px] font-medium">
              {error}
            </div>
          )}

          {items.length === 0 ? (
            <div className="py-12 text-center text-text-muted text-sm border-2 border-dashed border-border/50 rounded-xl">
              Tap a product to add to cart
            </div>
          ) : (
            <div className="space-y-6">
              {/* Items List */}
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                {items.map(item => (
                  <div key={item.productId} className="flex items-center justify-between gap-3 p-3 bg-surface rounded-xl border border-border/40">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-text-primary truncate">{item.name}</div>
                      {mode === 'sale' && <div className="text-xs text-text-muted mt-0.5">{formatMoney(item.price)} each</div>}
                    </div>
                    
                    <div className="flex items-center gap-2 bg-background rounded-lg border border-border/50 p-1">
                      <button 
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="p-1 hover:bg-surface rounded text-text-muted hover:text-text-primary transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-6 text-center text-sm font-medium text-text-primary">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="p-1 hover:bg-surface rounded text-text-muted hover:text-text-primary transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button 
                      onClick={() => removeItem(item.productId)}
                      className="p-1.5 text-text-muted/50 hover:text-danger hover:bg-danger/10 rounded-lg transition-colors ml-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="border-t border-border/50 pt-4 space-y-4">
                {/* Sale Mode Controls */}
                {mode === 'sale' && (
                  <>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-text-muted uppercase tracking-wider">Payment Method</label>
                      <div className="grid grid-cols-3 gap-2">
                        {['cash', 'credit', 'other'].map(type => (
                          <button
                            key={type}
                            onClick={() => setPaymentType(type as any)}
                            className={`py-2 rounded-lg text-[13px] font-medium capitalize border transition-all ${
                              paymentType === type 
                                ? 'bg-brand/10 border-brand text-brand' 
                                : 'bg-surface border-border/50 text-text-muted hover:border-brand/30'
                            }`}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between py-2 text-lg font-bold text-text-primary">
                      <span>Total</span>
                      <span>{formatMoney(getTotal())}</span>
                    </div>
                  </>
                )}

                {/* Waste Mode Controls */}
                {mode === 'waste' && (
                  <div className="space-y-2 pb-2">
                    <label className="text-xs font-medium text-text-muted uppercase tracking-wider">Reason for waste</label>
                    <input 
                      type="text" 
                      value={wasteReason}
                      onChange={(e) => setWasteReason(e.target.value)}
                      placeholder="e.g. Expired, Dropped..."
                      className="w-full px-3 py-2 bg-surface border border-border/50 rounded-lg text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-danger/50"
                    />
                  </div>
                )}

                {/* Submit Action */}
                <button
                  onClick={handleCheckout}
                  disabled={loading}
                  className={`w-full py-3.5 rounded-full text-white font-medium shadow-sm transition-opacity flex items-center justify-center gap-2 ${
                    mode === 'waste' ? 'bg-danger hover:bg-danger/90' : 'bg-[var(--brand-gradient)] hover:opacity-90'
                  } disabled:opacity-50`}
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : mode === 'sale' ? 'Complete Sale' : 'Log Waste'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
