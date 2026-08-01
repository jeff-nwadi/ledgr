"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { 
  Home, 
  FileText, 
  Package, 
  DollarSign, 
  Users, 
  UserSquare2, 
  BarChart2, 
  Settings,
  ShoppingBag,
  PackagePlus,
  Trash2,
  ClipboardList,
  Clock
} from "lucide-react";
import { PanelLeftIcon } from "@/components/animate-ui/icons/panel-left";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/animate-ui/components/animate/tooltip";

interface SidebarProps {
  userRole?: string;
}

interface SidebarLink {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  exact?: boolean;
  tab?: string;
}

const ownerLinks: SidebarLink[] = [
  { href: "/owner", label: "Home", icon: Home, exact: true },
  { href: "/owner/daily-summary", label: "Daily Summary", icon: FileText },
  { href: "/owner/products", label: "Products", icon: Package },
  { href: "/owner/sales", label: "Sales", icon: DollarSign },
  { href: "/owner/customers", label: "Customers", icon: Users },
  { href: "/owner/staff", label: "Staff", icon: UserSquare2 },
  { href: "/owner/reports", label: "Reports", icon: BarChart2 },
];

const staffLinks: SidebarLink[] = [
  { href: "/staff", tab: "home", label: "Overview", icon: Home },
  { href: "/staff?tab=sale", tab: "sale", label: "Log Sale", icon: ShoppingBag },
  { href: "/staff?tab=waste", tab: "waste", label: "Log Waste", icon: Trash2 },
  { href: "/staff?tab=stock", tab: "stock", label: "Stock Count", icon: ClipboardList },
  { href: "/staff?tab=activity", tab: "activity", label: "Activity Log", icon: Clock },
];

export function Sidebar({ userRole = "owner" }: SidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const currentTab = searchParams.get("tab") || "home";
  const mainLinks = userRole === "staff" ? staffLinks : ownerLinks;

  return (
    <TooltipProvider>
      <aside 
        className={`flex-shrink-0 border-r border-border/40 bg-background hidden md:flex flex-col h-full text-sm transition-all duration-300 ease-in-out ${isCollapsed ? "w-[70px]" : "w-60"}`}
      >
        <div className={`px-4 py-5 flex items-center ${isCollapsed ? "justify-center" : "justify-between"} h-[68px]`}>
          {!isCollapsed && <h1 className="text-xl font-bold font-heading text-text-primary px-2">Ledgr</h1>}
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-md hover:bg-surface/80 text-text-muted hover:text-text-primary transition-colors"
          >
            <PanelLeftIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Primary Action Button */}
        <div data-tour="pos-action" className={`px-4 mb-2 ${isCollapsed ? "flex justify-center px-2" : ""}`}>
          <Tooltip side="right">
            <TooltipTrigger asChild>
              <Link 
                href={userRole === "staff" ? "/staff?tab=sale" : "/owner/products?action=new"} 
                className={`flex items-center justify-center gap-2 ${isCollapsed ? "w-10 h-10 p-0" : "w-full py-2.5"} [background:var(--brand-gradient)] text-white text-[13px] font-medium rounded-xl hover:opacity-90 shadow-sm transition-all`}
              >
                {userRole === "staff" ? <ShoppingBag className="w-4 h-4" /> : <PackagePlus className="w-4 h-4" />}
                {!isCollapsed && (userRole === "staff" ? "Log Sale" : "Add Product")}
              </Link>
            </TooltipTrigger>
            {isCollapsed && <TooltipContent>{userRole === "staff" ? "Log Sale" : "Add Product"}</TooltipContent>}
          </Tooltip>
        </div>

        <nav data-tour="nav-menu" className="flex-1 px-3 space-y-1 overflow-y-auto mt-2">
          {mainLinks.map((link) => {
            const isActive = userRole === "staff"
              ? (link.tab ? currentTab === link.tab : (pathname === "/staff" && currentTab === "home"))
              : (link.exact ? pathname === link.href : pathname.startsWith(link.href));

            const Icon = link.icon;

            const linkContent = (
              <Link 
                href={link.href} 
                className={`flex items-center ${isCollapsed ? "justify-center px-0 w-10 h-10 mx-auto" : "gap-3 px-3 py-2.5"} font-medium rounded-lg transition-colors ${
                  isActive 
                    ? "bg-surface text-text-primary font-bold" 
                    : "hover:bg-surface/50 text-text-muted hover:text-text-primary"
                }`}
              >
                <Icon className="w-[18px] h-[18px]" strokeWidth={isActive ? 2.5 : 2} />
                {!isCollapsed && link.label}
              </Link>
            );

            return isCollapsed ? (
              <Tooltip key={link.href} side="right">
                <TooltipTrigger asChild>
                  {linkContent}
                </TooltipTrigger>
                <TooltipContent>
                  {link.label}
                </TooltipContent>
              </Tooltip>
            ) : (
              <div key={link.href}>{linkContent}</div>
            );
          })}
        </nav>

        {userRole !== "staff" && (
          <div className={`p-3 mt-auto space-y-1 ${isCollapsed ? "flex flex-col items-center" : ""}`}>
            {isCollapsed ? (
              <Tooltip side="right">
                <TooltipTrigger asChild>
                  <Link 
                    href="/owner/settings" 
                    className={`flex items-center justify-center w-10 h-10 font-medium rounded-lg transition-colors ${
                      pathname.startsWith("/owner/settings")
                        ? "bg-surface text-text-primary" 
                        : "hover:bg-surface/50 text-text-muted hover:text-text-primary"
                    }`}
                  >
                    <Settings className="w-[18px] h-[18px]" strokeWidth={2} />
                  </Link>
                </TooltipTrigger>
                <TooltipContent>Settings</TooltipContent>
              </Tooltip>
            ) : (
              <Link 
                href="/owner/settings" 
                className={`flex items-center gap-3 px-3 py-2.5 font-medium rounded-lg transition-colors ${
                  pathname.startsWith("/owner/settings")
                    ? "bg-surface text-text-primary" 
                    : "hover:bg-surface/50 text-text-muted hover:text-text-primary"
                }`}
              >
                <Settings className="w-[18px] h-[18px]" strokeWidth={2} />
                Settings
              </Link>
            )}
          </div>
        )}
      </aside>
    </TooltipProvider>
  );
}
