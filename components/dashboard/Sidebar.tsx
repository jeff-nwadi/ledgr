import Link from "next/link";
import { Home, FileText, Package, DollarSign, Users, UserSquare2, BarChart2, Settings, Code, SlidersHorizontal } from "lucide-react";

export function Sidebar() {
  return (
    <aside className="w-60 flex-shrink-0 border-r border-border/40 bg-background hidden md:flex flex-col h-full text-sm">
      <div className="px-6 py-5">
        <h1 className="text-xl font-bold font-heading text-text-primary">Ledgr</h1>
      </div>

      <nav className="flex-1 px-3 space-y-1 overflow-y-auto mt-2">
        <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 font-medium rounded-lg bg-surface text-text-primary">
          <Home className="w-[18px] h-[18px]" strokeWidth={2} />
          Home
        </Link>
        <Link href="/dashboard/daily" className="flex items-center gap-3 px-3 py-2.5 font-medium rounded-lg hover:bg-surface/50 text-text-muted hover:text-text-primary transition-colors">
          <FileText className="w-[18px] h-[18px]" strokeWidth={2} />
          Balance
        </Link>
        <Link href="/dashboard/sales" className="flex items-center gap-3 px-3 py-2.5 font-medium rounded-lg hover:bg-surface/50 text-text-muted hover:text-text-primary transition-colors">
          <DollarSign className="w-[18px] h-[18px]" strokeWidth={2} />
          Payments
        </Link>
        <Link href="/dashboard/customers" className="flex items-center gap-3 px-3 py-2.5 font-medium rounded-lg hover:bg-surface/50 text-text-muted hover:text-text-primary transition-colors">
          <Users className="w-[18px] h-[18px]" strokeWidth={2} />
          Customers
        </Link>
        <Link href="/dashboard/products" className="flex items-center gap-3 px-3 py-2.5 font-medium rounded-lg hover:bg-surface/50 text-text-muted hover:text-text-primary transition-colors">
          <Package className="w-[18px] h-[18px]" strokeWidth={2} />
          Products
        </Link>
        <Link href="/dashboard/reports" className="flex items-center gap-3 px-3 py-2.5 font-medium rounded-lg hover:bg-surface/50 text-text-muted hover:text-text-primary transition-colors">
          <BarChart2 className="w-[18px] h-[18px]" strokeWidth={2} />
          Billing
        </Link>
      </nav>

      <div className="p-3 mt-auto space-y-1">
        <Link href="/dashboard/settings" className="flex items-center gap-3 px-3 py-2.5 font-medium rounded-lg hover:bg-surface/50 text-text-muted hover:text-text-primary transition-colors">
          <Settings className="w-[18px] h-[18px]" strokeWidth={2} />
          All Settings
        </Link>
      </div>
    </aside>
  );
}
