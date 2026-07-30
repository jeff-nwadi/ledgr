"use client";

import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { createProductAction } from "@/app/actions/products";

interface AddProductFormProps {
  onClose: () => void;
  currencySymbol?: string;
}

export function AddProductForm({ onClose, currencySymbol = "₦" }: AddProductFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
    };
    const res = await createProductAction(data);

    if (res.error) {
      setError(res.error);
      setLoading(false);
    } else {
      onClose(); // Close the modal on success, Next.js action will revalidate
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <div className="bg-background border border-border/50 rounded-[1.25rem] shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/40">
          <h2 className="text-[18px] font-semibold text-text-primary font-heading">Add New Product</h2>
          <button 
            onClick={onClose}
            className="p-1.5 text-text-muted hover:text-text-primary rounded-lg hover:bg-surface transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
              required
              placeholder="e.g. Sliced Bread"
              className="w-full px-3 py-2 bg-surface border border-border/50 rounded-lg text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:ring-1 focus:ring-brand/50 transition-shadow"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="unit" className="text-[13px] font-medium text-text-primary">Unit of Measurement</label>
            <input 
              id="unit"
              name="unit" 
              type="text" 
              required
              placeholder="e.g. loaf, kg, piece"
              className="w-full px-3 py-2 bg-surface border border-border/50 rounded-lg text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:ring-1 focus:ring-brand/50 transition-shadow"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="costPrice" className="text-[13px] font-medium text-text-primary">Cost Price ({currencySymbol})</label>
              <input 
                id="costPrice"
                name="costPrice" 
                type="number" 
                min="0"
                required
                placeholder="0"
                className="w-full px-3 py-2 bg-surface border border-border/50 rounded-lg text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:ring-1 focus:ring-brand/50 transition-shadow"
              />
            </div>
            
            <div className="space-y-1.5">
              <label htmlFor="sellingPrice" className="text-[13px] font-medium text-text-primary">Selling Price (₦)</label>
              <input 
                id="sellingPrice"
                name="sellingPrice" 
                type="number" 
                min="0"
                required
                placeholder="0"
                className="w-full px-3 py-2 bg-surface border border-border/50 rounded-lg text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:ring-1 focus:ring-brand/50 transition-shadow"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="startingStock" className="text-[13px] font-medium text-text-primary">Starting Stock (Optional)</label>
            <input 
              id="startingStock"
              name="startingStock" 
              type="number" 
              min="0"
              placeholder="0"
              className="w-full px-3 py-2 bg-surface border border-border/50 rounded-lg text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:ring-1 focus:ring-brand/50 transition-shadow"
            />
            <p className="text-xs text-text-muted">Enter how much you currently have on hand.</p>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button 
              type="button" 
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-[13px] font-medium text-text-muted hover:text-text-primary transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="flex items-center justify-center min-w-[120px] px-4 py-2 text-[13px] font-medium text-white rounded-full bg-[var(--brand-gradient)] hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
