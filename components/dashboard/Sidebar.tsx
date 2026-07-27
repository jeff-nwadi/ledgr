"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, FileText, Package, DollarSign, Users, UserSquare2, BarChart2, Settings } from "lucide-react";
import { PanelLeftIcon } from "@/components/animate-ui/icons/panel-left";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/animate-ui/components/animate/tooltip";

const mainLinks = [
  { href: "/dashboard", label: "Home", icon: Home, exact: true },
  { href: "/dashboard/daily-summary", label: "Daily Summary", icon: FileText },
  { href: "/dashboard/products", label: "Products", icon: Package },
  { href: "/dashboard/sales", label: "Sales", icon: DollarSign },
  { href: "/dashboard/customers", label: "Customers", icon: Users },
  { href: "/dashboard/staff", label: "Staff", icon: UserSquare2 },
  { href: "/dashboard/reports", label: "Reports", icon: BarChart2 },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

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

        <div className={`px-4 mb-2 ${isCollapsed ? "flex justify-center px-2" : ""}`}>
          <Tooltip side="right">
            <TooltipTrigger asChild>
              <Link 
                href="/dashboard/pos" 
                className={`flex items-center justify-center gap-2 ${isCollapsed ? "w-10 h-10 p-0" : "w-full py-2.5"} [background:var(--brand-gradient)] text-white text-[13px] font-medium rounded-xl hover:opacity-90 shadow-sm transition-all`}
              >
                <DollarSign className="w-4 h-4" />
                {!isCollapsed && "New Sale"}
              </Link>
            </TooltipTrigger>
            {isCollapsed && <TooltipContent>New Sale</TooltipContent>}
          </Tooltip>
        </div>

        <nav className="flex-1 px-3 space-y-1 overflow-y-auto mt-2">
          {mainLinks.map((link) => {
            const isActive = link.exact 
              ? pathname === link.href 
              : pathname.startsWith(link.href);

            const Icon = link.icon;

            const linkContent = (
              <Link 
                href={link.href} 
                className={`flex items-center ${isCollapsed ? "justify-center px-0 w-10 h-10 mx-auto" : "gap-3 px-3 py-2.5"} font-medium rounded-lg transition-colors ${
                  isActive 
                    ? "bg-surface text-text-primary" 
                    : "hover:bg-surface/50 text-text-muted hover:text-text-primary"
                }`}
              >
                <Icon className="w-[18px] h-[18px]" strokeWidth={2} />
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

      <div className={`p-3 mt-auto space-y-1 ${isCollapsed ? "flex flex-col items-center" : ""}`}>
        {isCollapsed ? (
          <Tooltip side="right">
            <TooltipTrigger asChild>
              <Link 
                href="/dashboard/settings" 
                className={`flex items-center justify-center w-10 h-10 font-medium rounded-lg transition-colors ${
                  pathname.startsWith("/dashboard/settings")
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
            href="/dashboard/settings" 
            className={`flex items-center gap-3 px-3 py-2.5 font-medium rounded-lg transition-colors ${
              pathname.startsWith("/dashboard/settings")
                ? "bg-surface text-text-primary" 
                : "hover:bg-surface/50 text-text-muted hover:text-text-primary"
            }`}
          >
            <Settings className="w-[18px] h-[18px]" strokeWidth={2} />
            Settings
          </Link>
        )}
      </div>
    </aside>
    </TooltipProvider>
  );
}
