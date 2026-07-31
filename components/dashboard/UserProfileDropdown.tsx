"use client";

import { useState, useRef, useEffect } from "react";
import { User, Settings, Users, LogOut, Sparkles } from "lucide-react";
import { authClient } from "@/lib/auth/auth-client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTourStore } from "@/lib/store/tour-store";

export function UserProfileDropdown({ user }: { user: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const userInitial = user?.name ? user.name[0].toUpperCase() : "U";

  const userRole = user?.role || (typeof window !== "undefined" && window.location.pathname.startsWith("/staff") ? "staff" : "owner");
  const profileHref = userRole === "staff" ? "/staff/settings?tab=personal" : "/owner/settings?tab=personal";
  const settingsHref = userRole === "staff" ? "/staff/settings" : "/owner/settings";

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push("/signin");
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-9 h-9 rounded-full bg-[#5252f2] text-white flex items-center shadow-xs justify-center text-sm ml-2 ring-2 ring-transparent hover:ring-[#5252f2]/30 transition-all focus:outline-none"
      >
        {userInitial}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-background border border-border/50 rounded-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
          
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-2 mb-2">
            <div className="w-10 h-10 rounded-full bg-[#5252f2] text-white flex items-center justify-center text-base shrink-0">
              {userInitial}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm text-text-primary truncate">
                {user?.name || "Profile"}
              </span>
              <span className="text-xs text-text-muted truncate">
                {user?.email || (userRole === "staff" ? "Staff Member" : "No email")}
              </span>
            </div>
          </div>

          <div className="h-px bg-border/40 my-1" />

          {/* Links */}
          <div className="px-2 py-1 space-y-1">
            <Link 
              href={profileHref}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2 text-sm text-text-primary hover:bg-surface rounded-md transition-colors"
            >
              <User className="w-4 h-4 text-text-muted" />
              Profile
            </Link>
            
            <Link 
              href={settingsHref}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2 text-sm text-text-primary hover:bg-surface rounded-md transition-colors"
            >
              <Settings className="w-4 h-4 text-text-muted" />
              All Settings
            </Link>

            <div className="flex items-center justify-between px-3 py-2 text-sm text-text-primary hover:bg-surface rounded-md transition-colors cursor-not-allowed opacity-80">
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4 text-text-muted" />
                Referrals
              </div>
              <span className="text-[11px] bg-surface border border-border px-2 py-0.5 rounded-full text-text-muted">
                Soon
              </span>
            </div>
          </div>

          <div className="h-px bg-border/40 my-1" />

          {/* Logout */}
          <div className="px-2 py-1">
            <button 
              onClick={handleSignOut}
              className="flex items-center gap-3 w-full px-3 py-2 text-sm text-danger hover:bg-danger/10 rounded-md transition-colors text-left"
            >
              <LogOut className="w-4 h-4" />
              Log out
            </button>
          </div>
          
        </div>
      )}
    </div>
  );
}
