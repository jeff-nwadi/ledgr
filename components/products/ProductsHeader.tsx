"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { AddProductForm } from "./AddProductForm";

export function ProductsHeader() {
  const [isAdding, setIsAdding] = useState(false);

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-text-primary">Products</h1>
          <p className="text-[13px] text-text-muted mt-1">Manage your catalog, pricing, and starting stock.</p>
        </div>
        
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white rounded-full bg-[var(--brand-gradient)] hover:opacity-90 transition-opacity shadow-sm whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          Add product
        </button>
      </div>

      {isAdding && <AddProductForm onClose={() => setIsAdding(false)} />}
    </>
  );
}
