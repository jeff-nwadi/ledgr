"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { 
  User, 
  Lock, 
  ShieldCheck, 
  Building2, 
  Hash, 
  Coins, 
  KeyRound, 
  CheckCircle2, 
  AlertCircle, 
  Moon, 
  Sun, 
  SlidersHorizontal,
  Clock,
  Sparkles
} from "lucide-react";
import { changeOwnPinAction } from "@/app/actions/staff";
import { ThemeToggle } from "@/components/theme-toggle";

interface StaffSettingsProps {
  staff: {
    id: string;
    name: string;
    role: string;
  };
  business: {
    code: string;
    name: string;
    currency: string;
  };
  activeShift: {
    id: string;
    date: string;
    openingFloat: number;
  } | null;
}

type TabType = "personal" | "security" | "preferences";

export function StaffSettings({ staff, business, activeShift }: StaffSettingsProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const tabParam = searchParams.get("tab") as TabType | null;
  const [activeTab, setActiveTab] = useState<TabType>(tabParam || "personal");

  useEffect(() => {
    if (tabParam && tabParam !== activeTab) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const handleTabChange = (tabId: TabType) => {
    setActiveTab(tabId);
    router.replace(`${pathname}?tab=${tabId}`, { scroll: false });
  };

  // Change PIN Form State
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [pinSuccess, setPinSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChangePin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinError("");
    setPinSuccess("");

    if (!/^\d{4}$/.test(currentPin)) {
      setPinError("Current PIN must be 4 digits.");
      return;
    }
    if (!/^\d{4}$/.test(newPin)) {
      setPinError("New PIN must be 4 digits.");
      return;
    }
    if (newPin !== confirmPin) {
      setPinError("New PIN and Confirm PIN do not match.");
      return;
    }

    setIsSubmitting(true);
    const res = await changeOwnPinAction(currentPin, newPin);
    setIsSubmitting(false);

    if (res.error) {
      setPinError(res.error);
    } else {
      setPinSuccess("Your 4-digit PIN has been updated successfully!");
      setCurrentPin("");
      setNewPin("");
      setConfirmPin("");
    }
  };

  const tabs: { id: TabType; label: string }[] = [
    { id: "personal", label: "Personal Details" },
    { id: "security", label: "Security & PIN" },
    { id: "preferences", label: "App Preferences" },
  ];

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* 1. Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold font-heading text-text-primary tracking-tight">
          Staff Profile & Settings
        </h1>
        <p className="text-sm text-text-muted mt-1 font-normal">
          Manage your shift preferences, security PIN, and staff profile details.
        </p>
      </div>

      {/* 2. Navigation Tabs */}
      <div className="border-b border-border/60 overflow-x-auto no-scrollbar scroll-smooth">
        <nav className="flex items-center gap-6 sm:gap-8 pt-1 pb-[1px] min-w-max">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`pb-3 text-sm font-medium transition-all relative whitespace-nowrap ${
                  isActive
                    ? "text-brand font-semibold border-b-2 border-brand -mb-[1px]"
                    : "text-text-muted hover:text-text-primary"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* 3. Tab Contents */}

      {/* TAB 1: Personal Details */}
      {activeTab === "personal" && (
        <div className="space-y-6 animate-in fade-in-50 duration-200">
          {/* User Profile Overview */}
          <div className="rounded-2xl border border-border/60 bg-surface/30 p-6 space-y-6">
            <div className="flex items-center gap-4 border-b border-border/40 pb-4">
              <div className="w-14 h-14 rounded-2xl bg-brand/10 text-brand flex items-center justify-center font-bold text-xl font-heading">
                {staff.name ? staff.name[0].toUpperCase() : "S"}
              </div>
              <div>
                <h2 className="text-lg font-bold font-heading text-text-primary">
                  {staff.name}
                </h2>
                <p className="text-xs text-text-muted font-normal">
                  Staff Member • {business.name}
                </p>
              </div>
            </div>

            <div className="divide-y divide-border/40 text-sm">
              <div className="flex flex-col sm:flex-row sm:items-center py-3.5 gap-1 sm:gap-0">
                <span className="w-48 text-text-muted font-normal">Staff Name</span>
                <span className="font-medium text-text-primary">{staff.name}</span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center py-3.5 gap-1 sm:gap-0">
                <span className="w-48 text-text-muted font-normal">Account Role</span>
                <span className="font-medium text-text-primary flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-brand" /> Staff Member
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center py-3.5 gap-1 sm:gap-0">
                <span className="w-48 text-text-muted font-normal">Business Access Code</span>
                <span className="font-mono font-bold text-brand bg-brand/10 px-2.5 py-0.5 rounded-md text-xs">
                  {business.code}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center py-3.5 gap-1 sm:gap-0">
                <span className="w-48 text-text-muted font-normal">Store Name</span>
                <span className="font-medium text-text-primary">{business.name}</span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center py-3.5 gap-1 sm:gap-0">
                <span className="w-48 text-text-muted font-normal">Shift Status</span>
                {activeShift ? (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-success/10 text-success flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> Shift Active (Opened Float: {business.currency} {activeShift.openingFloat.toLocaleString()})
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-surface text-text-muted">
                    No Active Shift
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Security & PIN */}
      {activeTab === "security" && (
        <div className="space-y-6 animate-in fade-in-50 duration-200">
          <div className="rounded-2xl border border-border/60 bg-surface/30 p-6 space-y-6">
            <div className="flex items-center gap-3 border-b border-border/40 pb-4">
              <div className="w-10 h-10 bg-brand/10 text-brand rounded-full flex items-center justify-center">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-text-primary text-base font-heading">
                  Change 4-Digit Security PIN
                </h3>
                <p className="text-xs text-text-muted font-normal">
                  Staff log in with a 4-digit PIN. Keep your PIN confidential.
                </p>
              </div>
            </div>

            {pinError && (
              <div className="p-3.5 rounded-xl bg-danger/10 border border-danger/20 text-danger text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{pinError}</span>
              </div>
            )}

            {pinSuccess && (
              <div className="p-3.5 rounded-xl bg-success/10 border border-success/20 text-success text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{pinSuccess}</span>
              </div>
            )}

            <form onSubmit={handleChangePin} className="space-y-4 max-w-md">
              <div>
                <label className="text-xs font-medium text-text-muted block mb-1">
                  Current 4-Digit PIN
                </label>
                <input
                  type="password"
                  maxLength={4}
                  pattern="\d{4}"
                  placeholder="••••"
                  value={currentPin}
                  onChange={(e) => setCurrentPin(e.target.value.replace(/\D/g, ""))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-surface font-mono text-center text-lg tracking-widest text-text-primary focus:outline-none focus:border-brand"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-medium text-text-muted block mb-1">
                  New 4-Digit PIN
                </label>
                <input
                  type="password"
                  maxLength={4}
                  pattern="\d{4}"
                  placeholder="••••"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ""))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-surface font-mono text-center text-lg tracking-widest text-text-primary focus:outline-none focus:border-brand"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-medium text-text-muted block mb-1">
                  Confirm New 4-Digit PIN
                </label>
                <input
                  type="password"
                  maxLength={4}
                  pattern="\d{4}"
                  placeholder="••••"
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ""))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-surface font-mono text-center text-lg tracking-widest text-text-primary focus:outline-none focus:border-brand"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full [background:var(--brand-gradient)] text-white py-2.5 rounded-xl text-xs font-medium hover:opacity-90 shadow-sm transition-all disabled:opacity-50"
              >
                {isSubmitting ? "Updating PIN..." : "Update Security PIN"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 3: App Preferences */}
      {activeTab === "preferences" && (
        <div className="space-y-6 animate-in fade-in-50 duration-200">
          <div className="rounded-2xl border border-border/60 bg-surface/30 p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-border/40 pb-4">
              <div>
                <h3 className="font-semibold text-text-primary text-base font-heading">
                  Appearance & Interface
                </h3>
                <p className="text-xs text-text-muted font-normal">
                  Customize theme and display preferences for your shift terminal.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl border border-border/40 bg-background">
              <div>
                <p className="text-sm font-medium text-text-primary">Color Theme</p>
                <p className="text-xs text-text-muted">Switch between dark mode and light mode.</p>
              </div>
              <ThemeToggle />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
