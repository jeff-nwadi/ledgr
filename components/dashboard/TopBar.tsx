"use client";

import { Bell, HelpCircle } from "lucide-react";
import { UserProfileDropdown } from "./UserProfileDropdown";
import { GlobalSearch } from "./GlobalSearch";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useTourStore } from "@/lib/store/tour-store";

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
  "/staff/settings": "Staff Settings",
  "/staff/profile": "Staff Profile",
};

export function TopBar({ user }: { user?: any }) {
  const pathname = usePathname();
  const userRole = user?.role || (pathname.startsWith("/staff") ? "staff" : "owner");
  const currentTitle = pageTitles[pathname] || (userRole === "staff" ? "Staff Shift" : "Ledgr");

  return (
    <header className="hidden md:flex h-16 items-center justify-between px-8 flex-shrink-0 bg-background border-b border-border/40 z-30 sticky top-0">
      {/* Desktop Search Command Palette */}
      <div className="flex items-center gap-4 flex-1">
        <GlobalSearch userRole={userRole} />
      </div>

      {/* Desktop Right Actions */}
      <div className="flex items-center gap-3">
        {/* Desktop Help Button */}
        <button
          data-tour="help-trigger"
          onClick={() => {
            const tourId = userRole === "staff" ? "staff-tour" : "owner-tour";
            useTourStore.getState().resetTour(tourId);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-surface text-text-primary rounded-full hover:bg-border/50 transition-colors min-h-[36px]"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          Need help? <span className="text-text-muted ml-1">Take Tour</span>
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

