"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { 
  Copy, 
  Check, 
  Building2, 
  ShieldCheck, 
  Hash, 
  Coins, 
  Lock, 
  Smartphone, 
  ShieldAlert, 
  User, 
  Mail, 
  Phone, 
  Globe, 
  CreditCard, 
  Users, 
  Palette, 
  Sparkles,
  X,
  KeyRound,
  CheckCircle2
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

interface BusinessSettingsProps {
  business: {
    id: string;
    code: string;
    name: string;
    currency: string;
    createdAt: string;
  };
  owner: {
    name: string;
    email: string;
    phone?: string;
    country?: string;
  };
}

type TabType = 
  | "personal" 
  | "account" 
  | "preferences"
  | "status" 
  | "security" 
  | "checkouts" 
  | "customer_portal";

export function BusinessSettings({ business, owner }: BusinessSettingsProps) {
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
  const [copied, setCopied] = useState(false);

  // Editable Profile State
  const [ownerData, setOwnerData] = useState({
    name: owner.name,
    email: owner.email,
    phone: owner.phone || "Not added",
    country: owner.country || "Nigeria",
  });

  // Modal States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [is2FAModalOpen, setIs2FAModalOpen] = useState(false);

  // Form States inside Modals
  const [editForm, setEditForm] = useState({ ...ownerData });
  const [passwordForm, setPasswordForm] = useState({ current: "", newPass: "", confirm: "" });
  const [twoFactorStep, setTwoFactorStep] = useState<"qr" | "code" | "success">("qr");
  const [verificationCode, setVerificationCode] = useState("");
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);

  // Copy Business Code
  const handleCopy = () => {
    navigator.clipboard.writeText(business.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setOwnerData({ ...editForm });
    setIsEditModalOpen(false);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setIsPasswordModalOpen(false);
    setPasswordForm({ current: "", newPass: "", confirm: "" });
  };

  const handleVerify2FA = (e: React.FormEvent) => {
    e.preventDefault();
    if (verificationCode.length >= 6) {
      setTwoFactorStep("success");
      setIs2FAEnabled(true);
    }
  };

  const tabs: { id: TabType; label: string }[] = [
    { id: "personal", label: "Personal Details" },
    { id: "account", label: "Account Details" },
    { id: "preferences", label: "App Preferences" },
    { id: "status", label: "Account Status" },
    { id: "security", label: "Team & Security" },
    { id: "checkouts", label: "Checkouts" },
    { id: "customer_portal", label: "Customer Portal" },
  ];

  return (
    <div className="space-y-8">
      {/* 1. Top Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold font-heading text-text-primary">
          Settings
        </h1>
        <p className="text-sm text-text-muted mt-1 font-normal">
          Manage your account and preferences here.
        </p>
      </div>

      {/* 2. Horizontal Scrollable Navigation Tabs */}
      <div className="border-b border-border/60 overflow-x-auto no-scrollbar scroll-smooth">
        <nav className="flex items-center gap-6 sm:gap-8 pt-1 pb-[1px] min-w-max">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`pb-3 text-sm transition-all relative whitespace-nowrap ${
                  isActive
                    ? "text-brand border-b-2 border-brand -mb-[1px]"
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
        <div className="space-y-8 max-w-4xl animate-in fade-in-50 duration-200">
          {/* Section: Personal Details List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base text-text-primary font-heading">
                Personal details
              </h2>
              <button
                onClick={() => {
                  setEditForm({ ...ownerData });
                  setIsEditModalOpen(true);
                }}
                className="border border-border/80 rounded-full px-4 py-1 text-xs text-text-primary hover:bg-surface hover:border-border transition-colors"
              >
                Edit
              </button>
            </div>

            <div className="divide-y divide-border/40 text-sm">
              <div className="flex flex-col sm:flex-row sm:items-center py-3.5 gap-1 sm:gap-0">
                <span className="w-48 text-text-muted font-normal">Name</span>
                <span className="text-text-primary">{ownerData.name}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center py-3.5 gap-1 sm:gap-0">
                <span className="w-48 text-text-muted font-normal">Email</span>
                <span className="text-text-primary">{ownerData.email}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center py-3.5 gap-1 sm:gap-0">
                <span className="w-48 text-text-muted font-normal">Phone number</span>
                <span className="font-normal text-text-muted">{ownerData.phone}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center py-3.5 gap-1 sm:gap-0">
                <span className="w-48 text-text-muted font-normal">Country</span>
                <span className="text-text-primary">{ownerData.country}</span>
              </div>
            </div>
          </div>

          {/* Section: Password Card */}
          <div className="rounded-2xl border border-border/60 bg-surface/30 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-text-primary text-base font-heading">
                Password
              </h3>
              <p className="text-xs text-text-muted mt-1 font-normal">
                Change your account password.
              </p>
            </div>
            <button
              onClick={() => setIsPasswordModalOpen(true)}
              className="border border-border/80 rounded-xl px-4 py-2 text-xs text-text-primary hover:bg-surface transition-colors whitespace-nowrap"
            >
              Change password
            </button>
          </div>

          {/* Section: Two-Factor Authentication Card */}
          <div className="rounded-2xl border border-border/60 bg-surface/30 p-6 space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-text-primary text-base font-heading">
                  Two-factor authentication
                </h3>
                <p className="text-xs text-text-muted mt-1 font-normal">
                  Add an extra verification step to strengthen your account security.
                </p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs whitespace-nowrap ${
                  is2FAEnabled
                    ? "bg-success/10 text-success"
                    : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                }`}
              >
                {is2FAEnabled ? "Enabled" : "Not enabled"}
              </span>
            </div>

            <div className="border-t border-border/40 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-sm text-text-primary">
                  Authenticator app
                </h4>
                <p className="text-xs text-text-muted mt-0.5 font-normal">
                  Set up an authenticator app to protect your account.
                </p>
              </div>
              <button
                onClick={() => {
                  setTwoFactorStep("qr");
                  setVerificationCode("");
                  setIs2FAModalOpen(true);
                }}
                className="[background:var(--brand-gradient)] text-white px-4 py-2 rounded-xl text-xs hover:opacity-90 transition-all whitespace-nowrap"
              >
                {is2FAEnabled ? "Manage 2FA" : "Set up 2FA"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Account Details */}
      {activeTab === "account" && (
        <div className="space-y-6 max-w-4xl animate-in fade-in-50 duration-200">
          {/* Business ID Code Box */}
          <div className="rounded-2xl border border-border/60 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="font-heading text-lg text-text-primary">
                    Business ID Code
                  </h2> 
                </div>
                <p className="text-xs text-text-muted max-w-md font-normal">
                  Staff members use this 6-character code alongside their 4-digit PIN to log in to shift mode.
                </p>
              </div>

              <div className="flex items-center gap-3 bg-background border border-border/60 rounded-xl px-4 py-2.5">
                <span className="font-mono text-xl text-brand">
                  {business.code}
                </span>
                <button
                  onClick={handleCopy}
                  className="p-2 text-text-muted hover:text-brand hover:bg-surface rounded-lg transition-colors flex items-center gap-1.5 text-xs"
                  title="Copy Business ID Code"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-success" />
                      <span className="text-success">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Business Metadata */}
          <div className="rounded-2xl border border-border/60 bg-surface/30 p-6 space-y-6">
            <div className="flex items-center gap-3 border-b border-border/40 pb-4">
              <div className="w-10 h-10 bg-surface rounded-full flex items-center justify-center text-brand">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-text-primary text-base font-heading">
                  Store Details
                </h3>
                <p className="text-xs text-text-muted font-normal">General store information and owner profile.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="text-xs text-text-muted uppercase tracking-wider block mb-1">
                  Business Name
                </label>
                <p className="text-sm text-text-primary">{business.name}</p>
              </div>

              <div>
                <label className="text-xs text-text-muted uppercase tracking-wider block mb-1 flex items-center gap-1">
                  <Coins className="w-3.5 h-3.5 text-brand" /> Default Currency
                </label>
                <p className="text-sm text-text-primary">{business.currency}</p>
              </div>

              <div>
                <label className="text-xs text-text-muted uppercase block mb-1 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-brand" /> Account Owner
                </label>
                <p className="text-sm text-text-primary">{ownerData.name}</p>
                <p className="text-xs text-text-muted font-normal">{ownerData.email}</p>
              </div>

              <div>
                <label className="text-xs text-text-muted uppercase block mb-1">
                  Created Date
                </label>
                <p className="text-sm text-text-primary">
                  {new Date(business.createdAt).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: App Preferences */}
      {activeTab === "preferences" && (
        <div className="space-y-6 max-w-4xl animate-in fade-in-50 duration-200">
          <div className="rounded-2xl border border-border/60 bg-surface/30 p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-border/40 pb-4">
              <div>
                <h3 className="text-text-primary text-base font-heading">
                  App Preferences & Appearance
                </h3>
                <p className="text-xs text-text-muted font-normal">
                  Customize theme, audio alerts, and interface layout preferences for your owner dashboard.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Theme Preference */}
              <div className="flex items-center justify-between p-4 rounded-xl border border-border/40 bg-background">
                <div>
                  <p className="text-sm text-text-primary">Color Theme</p>
                  <p className="text-xs text-text-muted">Switch between dark mode and light mode across the application.</p>
                </div>
                <ThemeToggle />
              </div>

              {/* Sound Effects */}
              <div className="flex items-center justify-between p-4 rounded-xl border border-border/40 bg-background">
                <div>
                  <p className="text-sm text-text-primary">Audio Feedback</p>
                  <p className="text-xs text-text-muted">Play a sound prompt when sales or waste events are successfully logged.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-surface peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand"></div>
                </label>
              </div>

              {/* Default View */}
              <div className="flex items-center justify-between p-4 rounded-xl border border-border/40 bg-background">
                <div>
                  <p className="text-sm text-text-primary">Default Homepage View</p>
                  <p className="text-xs text-text-muted">Set default screen when opening the owner portal.</p>
                </div>
                <select className="bg-surface border border-border text-text-primary text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-brand">
                  <option value="dashboard">Owner Dashboard</option>
                  <option value="pos">Point of Sale (POS)</option>
                  <option value="daily">Daily Ledger</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Account Status */}
      {activeTab === "status" && (
        <div className="space-y-6 max-w-4xl animate-in fade-in-50 duration-200">
          <div className="rounded-2xl border border-border/60 bg-surface/30 p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-border/40 pb-4">
              <div>
                <h3 className="text-base font-heading text-text-primary">Account Status & Infrastructure</h3>
                <p className="text-xs text-text-muted mt-0.5">Real-time status of your store instance and database.</p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs bg-success/10 text-success">
                Active Tenant
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border border-border/40 bg-background space-y-1">
                <span className="text-xs text-text-muted">Subscription Plan</span>
                <p className="text-sm text-text-primary">Ledgr Pro</p>
              </div>
              <div className="p-4 rounded-xl border border-border/40 bg-background space-y-1">
                <span className="text-xs text-text-muted">Database Engine</span>
                <p className="text-sm text-brand">Neon Serverless</p>
              </div>
              <div className="p-4 rounded-xl border border-border/40 bg-background space-y-1">
                <span className="text-xs text-text-muted">Offline Queue Status</span>
                <p className="text-sm text-success">Synced (IndexedDB)</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Team & Security */}
      {activeTab === "security" && (
        <div className="space-y-6 max-w-4xl animate-in fade-in-50 duration-200">
          <div className="rounded-2xl border border-border/60 bg-surface/30 p-6 space-y-6">
            <div>
              <h3 className="text-base font-heading text-text-primary">Staff PIN Security</h3>
              <p className="text-xs text-text-muted mt-0.5">Control staff access rules and PIN verification policy.</p>
            </div>

            <div className="divide-y divide-border/40 text-sm">
              <div className="py-3.5 flex items-center justify-between">
                <div>
                  <p className="text-text-primary">PIN Lockout Threshold</p>
                  <p className="text-xs text-text-muted">Locks staff account after consecutive failed attempts.</p>
                </div>
                <span className="text-sm text-brand bg-brand/10 px-3 py-1 rounded-lg">5 Failed Attempts</span>
              </div>
              <div className="py-3.5 flex items-center justify-between">
                <div>
                  <p className="text-text-primary">Business Access Code</p>
                  <p className="text-xs text-text-muted">Required by staff to scope PIN login to this store.</p>
                </div>
                <span className="font-mono text-sm text-text-primary">{business.code}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: Checkouts */}
      {activeTab === "checkouts" && (
        <div className="space-y-6 max-w-4xl animate-in fade-in-50 duration-200">
          <div className="rounded-2xl border border-border/60 bg-surface/30 p-6 space-y-4">
            <h3 className="text-base font-heading text-text-primary">Checkout Preferences</h3>
            <p className="text-xs text-text-muted">Configure default payment methods and sale logging behaviors.</p>
            
            <div className="space-y-3 pt-2">
              <label className="flex items-center gap-3 p-3 rounded-xl border border-border/40 bg-background cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded border-border text-brand focus:ring-brand" />
                <div>
                  <p className="text-sm text-text-primary">Allow Customer Debt (Credit Sales)</p>
                  <p className="text-xs text-text-muted">Staff can attribute unpaid sales to customer debt ledger.</p>
                </div>
              </label>
              <label className="flex items-center gap-3 p-3 rounded-xl border border-border/40 bg-background cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded border-border text-brand focus:ring-brand" />
                <div>
                  <p className="text-sm text-text-primary">Require Stock Audit at Shift Close</p>
                  <p className="text-xs text-text-muted">Forces physical stock count entry before closing cash shift.</p>
                </div>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: Customer Portal */}
      {activeTab === "customer_portal" && (
        <div className="space-y-6 max-w-4xl animate-in fade-in-50 duration-200">
          <div className="rounded-2xl border border-border/60 bg-surface/30 p-6 space-y-4">
            <h3 className="text-base font-heading text-text-primary">Customer Ledger Portal</h3>
            <p className="text-xs text-text-muted">Manage debt balances, ledger history, and statement policies.</p>
            <div className="p-4 rounded-xl border border-border/40 bg-background">
              <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Debt Ledger Policy</p>
              <p className="text-sm text-text-primary">Customer debts are calculated using strict incremental charging and repayment events.</p>
            </div>
          </div>
        </div>
      )}

      {/* --- MODALS --- */}

      {/* MODAL 1: Edit Profile */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-background border border-border/80 rounded-2xl p-6 w-full max-w-md space-y-5">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <h3 className="font-heading text-lg text-text-primary">Edit Personal Details</h3>
              <button 
                onClick={() => setIsEditModalOpen(false)} 
                className="p-1 rounded-lg hover:bg-surface text-text-muted hover:text-text-primary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="text-xs text-text-muted block mb-1">Full Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-border bg-surface text-text-primary text-sm focus:outline-none focus:border-brand"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-text-muted block mb-1">Email Address</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-border bg-surface text-text-primary text-sm focus:outline-none focus:border-brand"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-text-muted block mb-1">Phone Number</label>
                <input
                  type="text"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-border bg-surface text-text-primary text-sm focus:outline-none focus:border-brand"
                />
              </div>

              <div>
                <label className="text-xs text-text-muted block mb-1">Country</label>
                <input
                  type="text"
                  value={editForm.country}
                  onChange={(e) => setEditForm({ ...editForm, country: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-border bg-surface text-text-primary text-sm focus:outline-none focus:border-brand"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-border/80 text-xs text-text-muted hover:bg-surface"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="[background:var(--brand-gradient)] text-white px-5 py-2 rounded-xl text-xs hover:opacity-90"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Change Password */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-background border border-border/80 rounded-2xl p-6 w-full max-w-md space-y-5">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <h3 className="font-heading text-lg text-text-primary">Change Password</h3>
              <button 
                onClick={() => setIsPasswordModalOpen(false)} 
                className="p-1 rounded-lg hover:bg-surface text-text-muted hover:text-text-primary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="text-xs text-text-muted block mb-1">Current Password</label>
                <input
                  type="password"
                  value={passwordForm.current}
                  onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-border bg-surface text-text-primary text-sm focus:outline-none focus:border-brand"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-text-muted block mb-1">New Password</label>
                <input
                  type="password"
                  value={passwordForm.newPass}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPass: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-border bg-surface text-text-primary text-sm focus:outline-none focus:border-brand"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-text-muted block mb-1">Confirm New Password</label>
                <input
                  type="password"
                  value={passwordForm.confirm}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-border bg-surface text-text-primary text-sm focus:outline-none focus:border-brand"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-border/80 text-xs text-text-muted hover:bg-surface"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="[background:var(--brand-gradient)] text-white px-5 py-2 rounded-xl text-xs hover:opacity-90"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: 2FA Setup */}
      {is2FAModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-background border border-border/80 rounded-2xl p-6 w-full max-w-md space-y-5">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <h3 className="font-heading text-lg text-text-primary">Set Up Authenticator App</h3>
              <button 
                onClick={() => setIs2FAModalOpen(false)} 
                className="p-1 rounded-lg hover:bg-surface text-text-muted hover:text-text-primary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {twoFactorStep === "qr" && (
              <div className="space-y-4 text-center">
                <p className="text-xs text-text-muted">
                  Scan this QR code with Google Authenticator or 1Password to connect your account.
                </p>
                <div className="w-48 h-48 mx-auto bg-surface border border-border rounded-xl flex items-center justify-center p-4">
                  <div className="w-full h-full border-2 border-dashed border-brand/40 rounded-lg flex flex-col items-center justify-center gap-2">
                    <Smartphone className="w-8 h-8 text-brand" />
                    <span className="text-[10px] font-mono text-text-muted">LEDGR-2FA-QR-CODE</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setTwoFactorStep("code")}
                  className="w-full [background:var(--brand-gradient)] text-white py-2.5 rounded-xl text-xs hover:opacity-90"
                >
                  Next Step: Enter Code
                </button>
              </div>
            )}

            {twoFactorStep === "code" && (
              <form onSubmit={handleVerify2FA} className="space-y-4">
                <p className="text-xs text-text-muted">
                  Enter the 6-digit code generated by your authenticator app to complete setup.
                </p>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="123456"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  className="w-full px-3.5 py-3 rounded-xl border border-border bg-surface text-center font-mono text-xl text-text-primary focus:outline-none focus:border-brand"
                  required
                />
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setTwoFactorStep("qr")}
                    className="px-4 py-2 rounded-xl border border-border/80 text-xs text-text-muted hover:bg-surface"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="[background:var(--brand-gradient)] text-white px-5 py-2 rounded-xl text-xs hover:opacity-90"
                  >
                    Enable 2FA
                  </button>
                </div>
              </form>
            )}

            {twoFactorStep === "success" && (
              <div className="space-y-4 text-center py-4">
                <CheckCircle2 className="w-12 h-12 text-success mx-auto" />
                <h4 className="font-heading text-base text-text-primary">2FA Enabled Successfully!</h4>
                <p className="text-xs text-text-muted">
                  Your account is now secured with authenticator app verification.
                </p>
                <button
                  type="button"
                  onClick={() => setIs2FAModalOpen(false)}
                  className="w-full [background:var(--brand-gradient)] text-white py-2.5 rounded-xl text-xs hover:opacity-90"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
