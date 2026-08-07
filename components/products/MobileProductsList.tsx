"use client";

import { useState, useMemo } from "react";
import { Plus } from "lucide-react";
import { ProductQuickAdd } from "./ProductQuickAdd";

interface MobileProductsListProps {
  products: any[];
  categories: string[];
  currencySymbol?: string;
}

export function MobileProductsList({ products, categories, currencySymbol = "₦" }: MobileProductsListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [activeProduct, setActiveProduct] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (p.status === "archived") return false;
      
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      
      let matchesCategory = true;
      if (selectedCategory === "Low Stock") {
        matchesCategory = p.currentStock <= (p.lowStockThreshold || 5);
      } else if (selectedCategory !== "All") {
        matchesCategory = p.category === selectedCategory;
      }
      
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  const allCategories = ["All", "Low Stock", ...categories.filter(c => c !== "All" && c !== "Low Stock")];

  return (
    <div className="block md:hidden space-y-4 pb-28 px-1 relative min-h-screen">
      {/* Page Title */}
      <h1 className="text-[24px] font-bold font-heading text-text-primary tracking-tight">Products</h1>

      {/* Search Bar + Filter Button */}
      <div className="flex items-center gap-2">
        <div className="flex-1 bg-surface border border-border/60 rounded-2xl px-3.5 py-2.5 flex items-center gap-2 text-sm text-text-muted min-h-[44px]">
          <span>🔍</span>
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products..." 
            className="bg-transparent border-none outline-none w-full text-text-primary placeholder:text-text-muted text-sm font-normal" 
          />
        </div>
        <button 
          onClick={() => setSelectedCategory(selectedCategory === "Low Stock" ? "All" : "Low Stock")}
          className={`w-11 h-11 rounded-2xl border flex items-center justify-center transition-colors min-h-[44px] shrink-0 ${
            selectedCategory === "Low Stock" ? "bg-brand text-white border-brand" : "bg-surface border-border/60 text-text-primary hover:bg-border/40"
          }`}
          aria-label="Filter Low Stock"
        >
          🎛️
        </button>
      </div>

      {/* Horizontal Filter Pill Row */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {allCategories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-xs font-normal whitespace-nowrap transition-colors min-h-[36px] ${
              selectedCategory === cat
                ? "bg-text-primary text-background font-medium"
                : "bg-surface border border-border/60 text-text-primary hover:bg-border/40"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Product Cards List */}
      <div className="rounded-2xl border border-border/60 bg-surface overflow-hidden divide-y divide-border/40">
        {filteredProducts.length === 0 ? (
          <div className="p-8 text-center text-xs text-text-muted font-normal">
            No products match your filter. Click + below to add a new product.
          </div>
        ) : (
          filteredProducts.map((p) => {
            const isLowStock = p.currentStock <= (p.lowStockThreshold || 5);
            return (
              <div 
                key={p.id} 
                onClick={() => {
                  setActiveProduct(p);
                  setIsModalOpen(true);
                }}
                className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-border/20 active:bg-border/30 transition-colors"
              >
                <div>
                  <p className="text-sm font-normal text-text-primary">{p.name}</p>
                  <p className={`text-xs font-normal mt-0.5 ${isLowStock ? "text-[#E0665D] flex items-center gap-1" : "text-text-muted"}`}>
                    {isLowStock && <span>⚠️</span>}
                    <span>{p.currentStock} in stock</span>
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-sm font-normal text-text-primary tabular-nums block">
                      {currencySymbol}{(p.sellingPrice ?? 0).toLocaleString()}
                    </span>
                    <span className="text-xs text-text-muted font-normal block mt-0.5">
                      Cost {currencySymbol}{(p.costPrice ?? 0).toLocaleString()}
                    </span>
                  </div>
                  <span className="text-text-muted text-base font-normal">›</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Floating Action Button (+ icon) -> Opens Add Product Modal */}
      <button 
        onClick={() => {
          setActiveProduct(null);
          setIsModalOpen(true);
        }}
        className="fixed bottom-20 right-5 z-30 w-14 h-14 rounded-full text-white flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-transform min-h-[56px] min-w-[56px]"
        style={{ backgroundImage: 'var(--brand-gradient)' }}
        aria-label="Add Product"
      >
        <Plus className="w-6 h-6 stroke-[2.5]" />
      </button>

      {/* Product Add/Edit Modal */}
      {isModalOpen && (
        <ProductQuickAdd
          initialData={activeProduct}
          existingCategories={categories}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}
