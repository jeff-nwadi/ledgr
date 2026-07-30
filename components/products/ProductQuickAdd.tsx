"use client";

import { useState } from "react";
import { X, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { createProductAction } from "@/app/actions/products";

interface ProductQuickAddProps {
  onClose: () => void;
  initialData?: any;
  existingCategories?: string[];
  currencySymbol?: string;
}

export function ProductQuickAdd({ onClose, initialData, existingCategories = [], currencySymbol = "₦" }: ProductQuickAddProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showMore, setShowMore] = useState(false);

  const [startingStock, setStartingStock] = useState<string>(initialData?.currentStock?.toString() || "");
  const [threshold, setThreshold] = useState<string>(initialData?.lowStockThreshold?.toString() || "");

  // Auto calculate threshold when starting stock changes, if user hasn't manually overridden it
  const handleStockChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setStartingStock(val);
    
    // Only auto-calc if we're creating new (not editing) and threshold is currently empty
    if (!initialData && !threshold && val) {
      const parsed = parseInt(val, 10);
      if (!isNaN(parsed) && parsed > 0) {
        setThreshold(Math.round(parsed * 0.2).toString());
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const sellingPriceStr = formData.get("sellingPrice") as string;
    const costPriceStr = formData.get("costPrice") as string;
    const startingStockStr = formData.get("startingStock") as string;
    const thresholdStr = formData.get("lowStockThreshold") as string;

    const data = {
      name: (formData.get("name") as string) || "",
      unit: (formData.get("unit") as string) || "each",
      sellingPrice: parseFloat(sellingPriceStr) || 0,
      costPrice: costPriceStr ? parseFloat(costPriceStr) : null,
      startingStock: parseInt(startingStockStr, 10) || 0,
      lowStockThreshold: thresholdStr ? parseInt(thresholdStr, 10) : null,
      category: (formData.get("category") as string) || null,
    };

    if (!data.name.trim()) {
      setError("Product name is required.");
      setLoading(false);
      return;
    }

    const result = await createProductAction(data);

    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-background border border-border rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* HEADER */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/50">
          <h2 className="font-heading text-lg font-bold text-text-primary">
            {initialData ? "Edit Product" : "Add New Product"}
          </h2>
          <button 
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 text-xs text-danger bg-danger/10 border border-danger/20 rounded-lg">
              {error}
            </div>
          )}

          {initialData?.id && (
            <input type="hidden" name="id" value={initialData.id} />
          )}

          {/* ESSENTIAL FIELDS (ALWAYS VISIBLE) */}
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label htmlFor="name" className="text-[13px] font-medium text-text-primary">Product Name</label>
              <input 
                id="name"
                name="name" 
                type="text" 
                defaultValue={initialData?.name}
                required
                placeholder="e.g. Sliced Bread"
                className="w-full px-3 py-2.5 bg-surface border border-border/50 rounded-lg text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:ring-1 focus:ring-brand/50 transition-shadow"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="sellingPrice" className="text-[13px] font-medium text-text-primary">Selling Price ({currencySymbol})</label>
                <input 
                  id="sellingPrice"
                  name="sellingPrice" 
                  type="number" 
                  defaultValue={initialData?.sellingPrice}
                  min="0"
                  required
                  placeholder="0"
                  className="w-full px-3 py-2.5 bg-surface border border-border/50 rounded-lg text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:ring-1 focus:ring-brand/50 transition-shadow"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="startingStock" className="text-[13px] font-medium text-text-primary">Starting Stock</label>
                <input 
                  id="startingStock"
                  name="startingStock" 
                  type="number" 
                  value={startingStock}
                  onChange={handleStockChange}
                  min="0"
                  required
                  placeholder="0"
                  className="w-full px-3 py-2.5 bg-surface border border-border/50 rounded-lg text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:ring-1 focus:ring-brand/50 transition-shadow"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="unit" className="text-[13px] font-medium text-text-primary">Unit</label>
              <select 
                id="unit"
                name="unit" 
                defaultValue={initialData?.unit || "each"}
                className="w-full px-3 py-2.5 bg-surface border border-border/50 rounded-lg text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-brand/50 transition-shadow appearance-none"
              >
                <option value="each">Each</option>
                <option value="kg">Kg</option>
                <option value="litre">Litre</option>
                <option value="pack">Pack</option>
                <option value="loaf">Loaf</option>
              </select>
            </div>

            {/* PROGRESSIVE DISCLOSURE TOGGLE */}
            <button
              type="button"
              onClick={() => setShowMore(!showMore)}
              className="flex items-center gap-1 text-[13px] font-medium text-brand hover:text-brand/80 transition-colors pt-2"
            >
              {showMore ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              {showMore ? "Hide advanced details" : "Add cost, category & alerts"}
            </button>

            {/* ADVANCED FIELDS */}
            {showMore && (
              <div className="space-y-4 pt-2 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="costPrice" className="text-[13px] font-medium text-text-primary">Cost Price ({currencySymbol})</label>
                    <input 
                      id="costPrice"
                      name="costPrice" 
                      type="number" 
                      defaultValue={initialData?.costPrice || ""}
                      min="0"
                      placeholder="Optional"
                      className="w-full px-3 py-2.5 bg-surface border border-border/50 rounded-lg text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:ring-1 focus:ring-brand/50 transition-shadow"
                    />
                  </div>
                  
                  <div className="space-y-1.5">
                    <label htmlFor="lowStockThreshold" className="text-[13px] font-medium text-text-primary">Low Stock Alert At</label>
                    <input 
                      id="lowStockThreshold"
                      name="lowStockThreshold" 
                      type="number"
                      value={threshold}
                      onChange={(e) => setThreshold(e.target.value)}
                      min="0"
                      placeholder="Optional"
                      className="w-full px-3 py-2.5 bg-surface border border-border/50 rounded-lg text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:ring-1 focus:ring-brand/50 transition-shadow"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="category" className="text-[13px] font-medium text-text-primary">Category</label>
                  <input 
                    id="category"
                    name="category" 
                    type="text" 
                    list="categories-list"
                    defaultValue={initialData?.category || ""}
                    placeholder="e.g. Pastries, Drinks"
                    className="w-full px-3 py-2.5 bg-surface border border-border/50 rounded-lg text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:ring-1 focus:ring-brand/50 transition-shadow"
                  />
                  <datalist id="categories-list">
                    {existingCategories.map(cat => (
                      <option key={cat} value={cat} />
                    ))}
                  </datalist>
                </div>
              </div>
            )}
          </div>

          {/* ACTIONS */}
          <div className="pt-4 flex justify-end gap-3 border-t border-border/40">
            <button 
              type="button" 
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-xs font-semibold text-text-muted hover:text-text-primary transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="flex items-center justify-center min-w-[120px] px-5 py-2 text-xs font-semibold text-white rounded-xl [background:var(--brand-gradient)] hover:opacity-90 transition-all active:scale-[0.96] disabled:opacity-50 shadow-sm"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Product"}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
