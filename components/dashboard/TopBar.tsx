"use client";

import { Bell, HelpCircle } from "lucide-react";
import { UserProfileDropdown } from "./UserProfileDropdown";
import { GlobalSearch } from "./GlobalSearch";
import { usePathname } from "next/navigation";
import Link from "next/link";

const pageTitles: Record<string, string> = {
  "/owner": "Dashboard",
  "/owner/daily-summary": "Daily Summary",
  "/owner/daily": "Daily Ledger",
  "/owner/products": "Products",
  "/owner/sales": "Sales Log",
  "/owner/customers": "Customers & Debt",
  "/owner/staff": "Staff Management",
  "/owner/reports": "Reports & Exports",
  "/owner/pos": "Point of Sale",
  "/owner/settings": "Settings",
};

export function TopBar({ user }: { user?: any }) {
  const pathname = usePathname();
  const userRole = user?.role || (pathname.startsWith("/staff") ? "staff" : "owner");
  const currentTitle = pageTitles[pathname] || (userRole === "staff" ? "Staff Shift" : "Ledgr");

  return (
    <header className="h-14 md:h-16 flex items-center justify-between px-4 md:px-8 flex-shrink-0 bg-background border-b border-border/40 z-30 sticky top-0 md:relative">
      {/* Mobile Top Bar Left: Business Name & Page Title */}
      <div className="flex md:hidden items-center gap-2 flex-1 min-w-0">
        <Link href={userRole === "staff" ? "/staff" : "/owner"} className="font-heading font-bold text-base text-brand flex-shrink-0">
          Ledgr
        </Link>
        <span className="text-text-muted/40 font-light text-sm">/</span>
        <h1 className="text-sm font-semibold text-text-primary truncate">
          {currentTitle}
        </h1>
      </div>

      {/* Desktop Search Command Palette */}
      <div className="hidden md:flex items-center gap-4 flex-1">
        <GlobalSearch userRole={userRole} />
      </div>

      {/* Mobile Right & Desktop Right Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Mobile Search Icon Trigger */}
        <div className="md:hidden">
          <GlobalSearch iconOnly userRole={userRole} />
        </div>

        {/* Desktop Help Button */}
        <button className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-surface text-text-primary rounded-full hover:bg-border/50 transition-colors min-h-[36px]">
          <HelpCircle className="w-3.5 h-3.5" />
          Need help? <span className="text-text-muted ml-1">Ctrl H</span>
        </button>

        {/* Notification Bell */}
        <button 
          className="p-2 text-text-muted hover:text-text-primary relative rounded-full hover:bg-surface transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Notifications"
        >
          <Bell className="w-[18px] h-[18px]" />
          <span className="absolute top-2.5 right-2.5 w-[6px] h-[6px] bg-danger rounded-full" />
        </button>
        
        {/* Avatar Dropdown */}
        <UserProfileDropdown user={user} />
      </div>
    </header>
  );
}

