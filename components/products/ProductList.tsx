"use client";

import { useState, useMemo } from "react";
import { Package, Search, MoreHorizontal, Edit, Copy, Archive, AlertCircle } from "lucide-react";
import { ProductQuickAdd } from "./ProductQuickAdd";
import { archiveProductAction } from "@/app/actions/products";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function ProductList({ products, categories }: { products: any[], categories: string[] }) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  
  const [activeProduct, setActiveProduct] = useState<any>(null);
  const [modalMode, setModalMode] = useState<"none" | "edit" | "duplicate">("none");
  const [archivingProduct, setArchivingProduct] = useState<{id: string, name: string} | null>(null);
  const [isArchiving, setIsArchiving] = useState(false);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      // Don't show archived products in main list by default unless we add a filter for it (skipping for MVP simplicity, just show active)
      if (p.status === "archived") return false;
      
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
      const matchesCat = categoryFilter === "all" || p.category === categoryFilter;
      return matchesSearch && matchesCat;
    });
  }, [products, search, categoryFilter]);

  const formatMoney = (amount: number) => {
    return `₦${amount.toLocaleString()}`;
  };

  const confirmArchive = async () => {
    if (!archivingProduct) return;
    setIsArchiving(true);
    await archiveProductAction(archivingProduct.id);
    setIsArchiving(false);
    setArchivingProduct(null);
  };

  if (products.length === 0) {
    return (
      <div className="rounded-[1rem] border border-border/50 bg-background shadow-[0_1px_3px_0_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="flex flex-col items-center justify-center py-24 text-center space-y-3">
          <div className="w-12 h-12 bg-surface rounded-full flex items-center justify-center text-text-muted/60 mb-2">
            <Package className="w-6 h-6" />
          </div>
          <p className="text-[14px] font-semibold text-text-primary">No products added yet</p>
          <p className="text-[13px] text-text-muted max-w-sm">
            Click the "Add product" button above to add your first product to the catalog.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input 
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-surface border border-border/50 rounded-lg text-[13px] text-text-primary placeholder:text-text-muted/60 focus:outline-none focus:ring-1 focus:ring-brand/50 transition-shadow"
          />
        </div>
        
        {categories.length > 0 && (
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full sm:w-48 px-3 py-2 bg-surface border border-border/50 rounded-lg text-[13px] text-text-primary focus:outline-none focus:ring-1 focus:ring-brand/50 transition-shadow"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        )}
      </div>

      <div className="rounded-[1rem] border border-border/50 bg-background shadow-[0_1px_3px_0_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead className="bg-surface/50 border-b border-border/40 text-text-muted">
              <tr>
                <th className="px-6 py-4 font-medium">Product</th>
                <th className="px-6 py-4 font-medium text-right">Cost</th>
                <th className="px-6 py-4 font-medium text-right">Selling Price</th>
                <th className="px-6 py-4 font-medium text-right">Stock</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {filteredProducts.map((p) => {
                const isLowStock = p.lowStockThreshold !== null && p.currentStock <= p.lowStockThreshold;
                
                return (
                  <tr key={p.id} className={`transition-colors hover:bg-surface/30 ${archivingProduct?.id === p.id ? 'opacity-50' : ''}`}>
                    <td className="px-6 py-3.5">
                      <div className="font-medium text-text-primary">{p.name}</div>
                      <div className="text-text-muted text-xs flex items-center gap-2 mt-0.5">
                        <span>{p.unit}</span>
                        {p.category && (
                          <>
                            <span className="w-1 h-1 rounded-full bg-border"></span>
                            <span>{p.category}</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      {p.costPrice !== null ? (
                        <span className="text-text-primary font-medium">{formatMoney(p.costPrice)}</span>
                      ) : (
                        <span className="inline-flex items-center text-xs font-medium text-text-muted px-2 py-0.5 rounded-full bg-surface border border-border/50">
                          Not set
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-3.5 text-text-primary font-medium text-right">
                      {formatMoney(p.sellingPrice)}
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full font-medium text-xs ${
                        isLowStock
                          ? 'bg-danger/10 text-danger'
                          : 'bg-success/10 text-success'
                      }`}>
                        {isLowStock && <AlertCircle className="w-3 h-3 mr-1" />}
                        {p.currentStock.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => { setActiveProduct(p); setModalMode("edit"); }}
                          className="p-1.5 text-text-muted hover:text-text-primary hover:bg-surface rounded-md transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => { setActiveProduct(p); setModalMode("duplicate"); }}
                          className="p-1.5 text-text-muted hover:text-text-primary hover:bg-surface rounded-md transition-colors"
                          title="Duplicate"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setArchivingProduct({ id: p.id, name: p.name })}
                          disabled={archivingProduct?.id === p.id || isArchiving}
                          className="p-1.5 text-text-muted hover:text-danger hover:bg-danger/10 rounded-md transition-colors"
                          title="Archive"
                        >
                          <Archive className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-text-muted text-[13px]">
                    No products match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalMode !== "none" && activeProduct && (
        <ProductQuickAdd 
          initialData={modalMode === "edit" ? activeProduct : { ...activeProduct, name: `${activeProduct.name} (Copy)` }}
          existingCategories={categories}
          onClose={() => {
            setModalMode("none");
            setActiveProduct(null);
          }}
        />
      )}

      <AlertDialog open={!!archivingProduct} onOpenChange={(open) => !open && !isArchiving && setArchivingProduct(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive Product?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to archive "{archivingProduct?.name}"? It will be hidden from new sales but remain in your history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isArchiving}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault();
                confirmArchive();
              }}
              disabled={isArchiving}
              className="bg-danger hover:bg-danger/90 text-white"
            >
              {isArchiving ? "Archiving..." : "Archive"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
