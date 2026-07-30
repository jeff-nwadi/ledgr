"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { 
  Home, 
  DollarSign, 
  Package, 
  MoreHorizontal, 
  FileText, 
  Users, 
  UserSquare2, 
  BarChart2, 
  Settings, 
  X,
  PlusCircle
} from "lucide-react";

export function MobileBottomNav({ userRole = "owner" }: { userRole?: string }) {
  const pathname = usePathname();
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  // Close bottom sheet when route changes
  useEffect(() => {
    setIsMoreOpen(false);
  }, [pathname]);

  // Prevent scrolling when bottom sheet is open
  useEffect(() => {
    if (isMoreOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMoreOpen]);

  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab") || "home";

  const ownerNavItems = [
    { href: "/owner", label: "Home", icon: Home, exact: true },
    { href: "/owner/sales", label: "Sales", icon: DollarSign },
    { href: "/owner/products", label: "Products", icon: Package },
  ];

  const staffNavItems = [
    { href: "/staff", tab: "home", label: "Home", icon: Home },
    { href: "/staff?tab=sale", tab: "sale", label: "Log Sale", icon: DollarSign },
    { href: "/staff?tab=stock", tab: "stock", label: "Stock", icon: Package },
  ];

  const navItems = userRole === "staff" ? staffNavItems : ownerNavItems;

  const ownerMoreItems = [
    { href: "/owner/daily-summary", label: "Daily Summary", icon: FileText, desc: "Stock ledger & daily counts" },
    { href: "/owner/customers", label: "Customers", icon: Users, desc: "Debt ledger & customer accounts" },
    { href: "/owner/staff", label: "Staff", icon: UserSquare2, desc: "PIN access & staff management" },
    { href: "/owner/reports", label: "Reports", icon: BarChart2, desc: "Business metrics & CSV exports" },
    { href: "/owner/pos", label: "New Sale / POS", icon: PlusCircle, desc: "Log a sale quickly" },
    { href: "/owner/settings", label: "Settings", icon: Settings, desc: "Shop parameters & configuration" },
  ];

  const staffMoreItems = [
    { href: "/staff?tab=waste", tab: "waste", label: "Log Waste", icon: FileText, desc: "Record spoilage or damaged inventory" },
    { href: "/staff?tab=activity", tab: "activity", label: "Activity Log", icon: BarChart2, desc: "View shift audit log & recent entries" },
  ];

  const moreItems = userRole === "staff" ? staffMoreItems : ownerMoreItems;

  const isItemActive = (item: any) => {
    if (userRole === "staff" && item.tab) {
      return currentTab === item.tab;
    }
    return item.exact ? pathname === item.href : pathname.startsWith(item.href);
  };

  // Check if any of the "More" items is currently active
  const isMoreActive = moreItems.some(isItemActive);

  return (
    <>
      {/* Fixed Mobile Bottom Tab Bar */}
      <nav 
        data-tour="nav-menu"
        aria-label="Mobile bottom navigation"
        className="fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-t border-border/60 md:hidden h-16 px-2 flex items-center justify-around shadow-lg select-none"
      >
        {navItems.map((item) => {
          const isActive = isItemActive(item);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 min-h-[44px] flex flex-col items-center justify-center py-1 transition-colors duration-150 relative ${
                isActive 
                  ? "text-brand font-semibold" 
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              {isActive && (
                <span className="absolute top-0 w-8 h-1 bg-brand rounded-b-full transition-[width,background-color] duration-150" />
              )}
              <Icon className="w-5 h-5 mb-0.5" strokeWidth={isActive ? 2.5 : 1.8} />
              <span className="text-[11px] leading-tight tracking-tight">{item.label}</span>
            </Link>
          );
        })}

        {/* "More" Tab Trigger */}
        <button
          type="button"
          onClick={() => setIsMoreOpen(true)}
          className={`flex-1 min-h-[44px] flex flex-col items-center justify-center py-1 transition-colors duration-150 relative ${
            isMoreActive || isMoreOpen
              ? "text-brand font-semibold" 
              : "text-text-muted hover:text-text-primary"
          }`}
          aria-expanded={isMoreOpen}
          aria-label="Open more navigation options"
        >
          {(isMoreActive || isMoreOpen) && (
            <span className="absolute top-0 w-8 h-1 bg-brand rounded-b-full transition-[width,background-color] duration-150" />
          )}
          <MoreHorizontal className="w-5 h-5 mb-0.5" strokeWidth={isMoreActive || isMoreOpen ? 2.5 : 1.8} />
          <span className="text-[11px] leading-tight tracking-tight">More</span>
        </button>
      </nav>

      {/* "More" Slide-up Bottom Sheet Drawer */}
      {isMoreOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-200 animate-in fade-in"
            onClick={() => setIsMoreOpen(false)}
          />

          {/* Drawer Content */}
          <div 
            className="relative bg-background border-t border-border rounded-t-2xl p-5 space-y-4 max-h-[85vh] overflow-y-auto z-10 shadow-2xl animate-in slide-in-from-bottom duration-220 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:animate-none"
          >
            {/* Grab handle bar */}
            <div 
              className="w-12 h-1.5 bg-border rounded-full mx-auto mb-1 cursor-pointer opacity-70"
              onClick={() => setIsMoreOpen(false)}
            />

            <div className="flex items-center justify-between pb-2 border-b border-border/40">
              <div>
                <h3 className="text-base font-bold font-heading text-text-primary">Navigation</h3>
                <p className="text-xs text-text-muted">Access all shop management modules</p>
              </div>
              <button
                onClick={() => setIsMoreOpen(false)}
                className="p-2 rounded-full hover:bg-surface text-text-muted hover:text-text-primary transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-2 pt-1">
              {moreItems.map((item) => {
                const isActive = isItemActive(item);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3.5 p-3 rounded-xl border transition-all min-h-[52px] ${
                      isActive
                        ? "bg-surface border-brand/40 text-brand shadow-xs"
                        : "bg-surface/40 border-border/40 text-text-primary hover:bg-surface"
                    }`}
                  >
                    <div className={`p-2.5 rounded-lg ${isActive ? "bg-brand text-white" : "bg-surface text-text-muted"}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold truncate">{item.label}</div>
                      <div className="text-xs text-text-muted truncate">{item.desc}</div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
