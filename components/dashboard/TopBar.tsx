import { Search, Bell, HelpCircle, Menu } from "lucide-react";

export function TopBar({ userInitial = "U" }: { userInitial?: string }) {
  return (
    <header className="h-16 flex items-center justify-between px-4 md:px-8 flex-shrink-0 bg-background border-b border-border/40">
      <div className="flex items-center gap-4 flex-1">
        <button className="p-2 -ml-2 text-text-muted hover:text-text-primary md:hidden rounded-lg hover:bg-surface">
          <Menu className="w-5 h-5" />
        </button>
        
        {/* Sleek pill search bar */}
        <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-surface rounded-full text-sm text-text-muted w-80 focus-within:ring-1 focus-within:ring-brand/30 transition-all">
          <Search className="w-4 h-4 text-text-muted/70" />
          <input 
            type="text" 
            placeholder="Search" 
            className="flex-1 bg-transparent outline-none text-text-primary placeholder:text-text-muted/70"
          />
          <div className="flex items-center gap-1 text-[11px] font-medium text-text-muted">
            <span>Ctrl</span>
            <span>K</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Secondary Actions */}
        <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-surface text-text-primary rounded-full hover:bg-border/50 transition-colors">
          <HelpCircle className="w-3.5 h-3.5" />
          Need help? <span className="text-text-muted ml-1">Ctrl H</span>
        </button>

        <button className="p-2 text-text-muted hover:text-text-primary relative rounded-full hover:bg-surface transition-colors">
          <Bell className="w-[18px] h-[18px]" />
          <span className="absolute top-1.5 right-1.5 w-[6px] h-[6px] bg-danger rounded-full" />
        </button>
        
        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-brand/10 text-brand flex items-center justify-center font-semibold text-sm ml-2 ring-1 ring-brand/20 uppercase">
          {userInitial}
        </div>
      </div>
    </header>
  );
}
