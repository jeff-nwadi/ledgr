"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Home, FileText, Package, DollarSign, Users, UserSquare2, BarChart2, Settings, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

const ownerSearchItems = [
  { label: "Home", href: "/owner", icon: Home },
  { label: "Daily Summary", href: "/owner/daily-summary", icon: FileText },
  { label: "Products", href: "/owner/products", icon: Package },
  { label: "Sales", href: "/owner/sales", icon: DollarSign },
  { label: "Customers", href: "/owner/customers", icon: Users },
  { label: "Staff", href: "/owner/staff", icon: UserSquare2 },
  { label: "Reports", href: "/owner/reports", icon: BarChart2 },
  { label: "Settings", href: "/owner/settings", icon: Settings },
];

const staffSearchItems = [
  { label: "Shift Overview", href: "/staff", icon: Home },
  { label: "Log Sale", href: "/staff?tab=sale", icon: DollarSign },
  { label: "Log Waste", href: "/staff?tab=waste", icon: FileText },
  { label: "Stock Count", href: "/staff?tab=stock", icon: Package },
  { label: "Shift Activity", href: "/staff?tab=activity", icon: BarChart2 },
];

const ownerFilters = ["All", "Pages", "Customers", "Products", "Sales"];
const staffFilters = ["All", "Shift Actions", "Products", "Customers"];

export function GlobalSearch({ iconOnly = false, userRole = "owner" }: { iconOnly?: boolean; userRole?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const isStaff = userRole === "staff";
  const searchItems = isStaff ? staffSearchItems : ownerSearchItems;
  const filters = isStaff ? staffFilters : ownerFilters;

  // Handle Ctrl+K shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Auto-focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const filteredItems = searchItems.filter((item) =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {/* Search Bar Trigger */}
      {iconOnly ? (
        <button 
          onClick={() => setIsOpen(true)}
          className="p-2 text-text-muted hover:text-text-primary rounded-full hover:bg-surface transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Search"
        >
          <Search className="w-5 h-5" />
        </button>
      ) : (
        <button 
          onClick={() => setIsOpen(true)}
          className="hidden md:flex items-center gap-2 px-3 py-1 bg-surface border border-border/40 rounded-full text-xs text-text-muted w-56 hover:border-brand/30 hover:ring-1 hover:ring-brand/20 transition-all text-left min-h-[36px]"
        >
          <Search className="w-3.5 h-3.5 text-text-muted/70" />
          <span className="flex-1 text-text-muted/70 truncate">Search...</span>
          <div className="flex items-center gap-0.5 text-[10px] font-medium text-text-muted px-1.5 py-0.5 bg-background/60 rounded border border-border/40">
            <span>Ctrl K</span>
          </div>
        </button>
      )}

      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] sm:pt-[15vh] px-4">
          <div 
            className="fixed inset-0 bg-background/80 backdrop-blur-sm" 
            onClick={() => setIsOpen(false)}
          />
          
          <div className="relative w-full max-w-2xl bg-background rounded-2xl shadow-2xl border border-border/60 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
            {/* Search Input Area */}
            <div className="p-4 border-b border-border/40">
              <div className="relative flex items-center">
                <Search className="absolute left-3 w-5 h-5 text-text-muted/70" />
                <input 
                  ref={inputRef}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  type="text" 
                  placeholder={isStaff ? "Search shift catalog, quick sales & actions..." : "Search documents, transactions, accounts..."} 
                  className="w-full pl-10 pr-4 py-3 bg-transparent outline-none text-text-primary placeholder:text-text-muted text-base"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="px-4 py-3 border-b border-border/40 flex items-center gap-2 overflow-x-auto no-scrollbar">
              {filters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-3 py-1.5 rounded-lg text-[13px] font-medium whitespace-nowrap transition-colors ${
                    activeFilter === filter 
                      ? "bg-brand/10 text-brand" 
                      : "bg-surface text-text-muted hover:text-text-primary hover:bg-surface/80 border border-border/40"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            {/* Results List */}
            <div className="max-h-[60vh] overflow-y-auto p-2">
              {filteredItems.length > 0 ? (
                <div className="flex flex-col">
                  {filteredItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.href}
                        onClick={() => {
                          router.push(item.href);
                          setIsOpen(false);
                        }}
                        className="flex items-center justify-between w-full p-3 text-left rounded-xl hover:bg-surface transition-colors group"
                      >
                        <div className="flex items-center gap-3 text-text-primary">
                          <Icon className="w-5 h-5 text-text-muted group-hover:text-text-primary transition-colors" strokeWidth={1.5} />
                          <span className="font-medium">{item.label}</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-text-muted/50 group-hover:text-text-muted transition-colors" />
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="py-14 flex flex-col items-center justify-center text-center">
                  <Search className="w-8 h-8 text-border mb-3" />
                  <p className="text-text-primary font-medium">No results found</p>
                  <p className="text-sm text-text-muted mt-1">We couldn't find anything matching "{searchQuery}"</p>
                </div>
              )}
            </div>
            
            {/* Footer */}
            <div className="px-4 py-3 bg-surface/50 border-t border-border/40 flex items-center justify-between text-xs text-text-muted">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">Navigate with <span className="px-1.5 py-0.5 rounded bg-surface border border-border font-medium">↑</span> <span className="px-1.5 py-0.5 rounded bg-surface border border-border font-medium">↓</span></span>
                <span className="flex items-center gap-1">Select with <span className="px-1.5 py-0.5 rounded bg-surface border border-border font-medium">Enter</span></span>
              </div>
              <span className="flex items-center gap-1">Close <span className="px-1.5 py-0.5 rounded bg-surface border border-border font-medium">Esc</span></span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
