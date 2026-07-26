"use client";

import { useState } from "react";
import { Plus, Upload } from "lucide-react";
import { ProductQuickAdd } from "./ProductQuickAdd";
import { BulkImportModal } from "./BulkImportModal";

export function ProductsHeader({ existingCategories }: { existingCategories: string[] }) {
  const [isAdding, setIsAdding] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-text-primary">Products</h1>
          <p className="text-[13px] text-text-muted mt-1">Manage your catalog, pricing, and starting stock.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsImporting(true)}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-text-primary rounded-full bg-surface border border-border hover:bg-border/50 transition-colors shadow-sm whitespace-nowrap"
          >
            <Upload className="w-4 h-4" />
            Bulk Import
          </button>
          
          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white rounded-full [background:var(--brand-gradient)] hover:opacity-90 transition-opacity shadow-sm whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            Add product
          </button>
        </div>
      </div>

      {isAdding && (
        <ProductQuickAdd 
          existingCategories={existingCategories}
          onClose={() => setIsAdding(false)} 
        />
      )}
      
      {isImporting && (
        <BulkImportModal onClose={() => setIsImporting(false)} />
      )}
    </>
  );
}
