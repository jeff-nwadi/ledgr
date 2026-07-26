import { Search, Bell, HelpCircle, Menu } from "lucide-react";
import { UserProfileDropdown } from "./UserProfileDropdown";
import { GlobalSearch } from "./GlobalSearch";

export function TopBar({ user }: { user?: any }) {
  return (
    <header className="h-16 flex items-center justify-between px-4 md:px-8 flex-shrink-0 bg-background border-b border-border/40">
      <div className="flex items-center gap-4 flex-1">
        <button className="p-2 -ml-2 text-text-muted hover:text-text-primary md:hidden rounded-lg hover:bg-surface">
          <Menu className="w-5 h-5" />
        </button>
        
        {/* Global Search Command Palette */}
        <GlobalSearch />
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
        
        {/* Avatar Dropdown */}
        <UserProfileDropdown user={user} />
      </div>
    </header>
  );
}
