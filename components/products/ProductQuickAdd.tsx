"use client";

import { useState } from "react";
import { X, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { createProductAction } from "@/app/actions/products";

interface ProductQuickAddProps {
  onClose: () => void;
  initialData?: any;
  existingCategories?: string[];
}

export function ProductQuickAdd({ onClose, initialData, existingCategories = [] }: ProductQuickAddProps) {
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
    
    const data = {
      name: formData.get("name") as string,
      unit: formData.get("unit") as string,
      sellingPrice: parseInt(formData.get("sellingPrice") as string, 10),
      costPrice: formData.get("costPrice") ? parseInt(formData.get("costPrice") as string, 10) : null,
      startingStock: parseInt(formData.get("startingStock") as string, 10) || 0,
      lowStockThreshold: formData.get("lowStockThreshold") ? parseInt(formData.get("lowStockThreshold") as string, 10) : null,
      category: formData.get("category") as string || null,
    };

    if (isNaN(data.sellingPrice)) {
      setError("Selling price must be a valid number.");
      setLoading(false);
      return;
    }

    const res = await createProductAction(data);

    if (res.error) {
      setError(res.error);
      setLoading(false);
    } else {
      onClose(); 
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-background/80 backdrop-blur-sm sm:p-4">
      <div className="bg-background border border-border/50 sm:rounded-[1.25rem] rounded-t-[1.25rem] shadow-xl w-full max-w-md overflow-hidden animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-200 flex flex-col max-h-[90dvh]">
        
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/40 shrink-0">
          <h2 className="text-[18px] font-semibold text-text-primary font-heading">
            {initialData ? "Edit Product" : "Quick Add Product"}
          </h2>
          <button 
            onClick={onClose}
            className="p-1.5 text-text-muted hover:text-text-primary rounded-lg hover:bg-surface transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-6">
          <form id="product-form" onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-danger/10 text-danger text-[13px] font-medium">
                {error}
              </div>
            )}

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
                <label htmlFor="sellingPrice" className="text-[13px] font-medium text-text-primary">Selling Price (₦)</label>
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
                    <label htmlFor="costPrice" className="text-[13px] font-medium text-text-primary">Cost Price (₦)</label>
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
          </form>
        </div>

        <div className="p-4 border-t border-border/40 shrink-0 flex justify-end gap-3 bg-background">
          <button 
            type="button" 
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2.5 text-[13px] font-medium text-text-muted hover:text-text-primary transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            form="product-form"
            disabled={loading}
            className="flex items-center justify-center min-w-[120px] px-4 py-2.5 text-[13px] font-medium text-white rounded-full [background:var(--brand-gradient)] hover:opacity-90 transition-opacity disabled:opacity-50 shadow-sm"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Product"}
          </button>
        </div>

      </div>
    </div>
  );
}
