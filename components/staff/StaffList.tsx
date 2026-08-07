"use client";

import { useState } from "react";
import { Plus, Search, UserSquare2, ShieldAlert, KeyRound, Loader2, LockOpen, UserX, Copy, Check, Info, MoreHorizontal } from "lucide-react";
import { addStaffAction, unlockStaffAction, regeneratePinAction, deactivateOrDeleteStaffAction } from "@/app/actions/staff";

interface Staff {
  id: string;
  name: string;
  locked: boolean;
  failedAttempts: number;
  status: string;
  createdAt: string;
  shiftStatus?: "active" | "ended" | "none";
  shiftStartedAt?: string;
  shiftEndedAt?: string;
}

interface StaffListProps {
  staffList: Staff[];
  businessCode: string;
}

interface PinRevealData {
  pin: string;
  businessCode: string;
  staffName: string;
}

export function StaffList({ staffList, businessCode }: StaffListProps) {
  const [search, setSearch] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [pinRevealData, setPinRevealData] = useState<PinRevealData | null>(null);
  const [deactivateConfirmId, setDeactivateConfirmId] = useState<string | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const [newName, setNewName] = useState("");

  const filtered = staffList.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));

  const formatTime = (iso?: string) => {
    if (!iso) return "";
    try {
      return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      setError("Staff name is required.");
      return;
    }

    setLoading(true);
    setError("");

    const res = await addStaffAction(newName.trim());

    if (res.error) {
      setError(res.error);
    } else if (res.success && res.pin) {
      setIsAddModalOpen(false);
      setNewName("");
      setPinRevealData({
        pin: res.pin,
        businessCode: res.businessCode || businessCode,
        staffName: res.staffName || newName,
      });
    }
    setLoading(false);
  };

  const handleUnlock = async (staffId: string) => {
    setActionLoadingId(staffId);
    await unlockStaffAction(staffId);
    setActionLoadingId(null);
  };

  const handleRegeneratePin = async (staff: Staff) => {
    setActionLoadingId(staff.id);
    const res = await regeneratePinAction(staff.id);
    setActionLoadingId(null);

    if (res.error) {
      alert(res.error);
    } else if (res.success && res.pin) {
      setPinRevealData({
        pin: res.pin,
        businessCode: res.businessCode || businessCode,
        staffName: res.staffName || staff.name,
      });
    }
  };

  const handleDeactivate = async (staffId: string) => {
    setActionLoadingId(staffId);
    const res = await deactivateOrDeleteStaffAction(staffId);
    setActionLoadingId(null);
    setDeactivateConfirmId(null);

    if (res.error) {
      alert(res.error);
    }
  };

  const copyCredentials = () => {
    if (!pinRevealData) return;
    const textToCopy = `Ledgr Staff Login Credentials\nBusiness ID: ${pinRevealData.businessCode}\nStaff PIN: ${pinRevealData.pin}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      {/* DESKTOP VIEW (Condition a: hidden md:block — 100% untouched) */}
      <div className="hidden md:block space-y-6">
        <div className="flex flex-col sm:flex-row items-center gap-4 justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input 
              type="text" 
              placeholder="Search staff..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-background border border-border/50 rounded-xl text-sm text-text-primary focus:ring-1 focus:ring-brand/50 outline-none transition-all min-h-[44px]"
            />
          </div>
          <button 
            onClick={() => { setIsAddModalOpen(true); setError(""); setNewName(""); }}
            className="w-full sm:w-auto px-5 py-2.5 [background:var(--brand-gradient)] text-white text-sm font-medium rounded-full hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-sm min-h-[44px]"
          >
            <Plus className="w-4 h-4" />
            Add Staff Member
          </button>
        </div>

        {filtered.length === 0 ? (
          <div className="py-16 text-center border border-dashed border-border/50 rounded-[1.25rem] bg-surface/30">
            <div className="w-12 h-12 bg-background rounded-full flex items-center justify-center text-text-muted/50 mx-auto mb-3">
              <UserSquare2 className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-text-primary">No staff members found</h3>
            <p className="text-xs text-text-muted mt-1">Add staff to allow them to log in using a 4-digit PIN.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(s => {
              const isDeactivated = s.status === "deactivated";
              const isMenuOpen = activeMenuId === s.id;
              return (
                <div key={s.id} className={`bg-background border rounded-2xl p-5 shadow-sm ${isDeactivated ? "border-border/30 opacity-70" : "border-border/50 hover:border-brand/30"}`}>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-text-primary text-base">{s.name}</h3>
                      <p className="text-xs text-text-muted mt-0.5">Staff Member</p>
                    </div>
                    {!isDeactivated && (
                      <div className="relative">
                        <button 
                          onClick={() => setActiveMenuId(isMenuOpen ? null : s.id)} 
                          className="p-2 text-text-muted hover:text-text-primary rounded-full hover:bg-surface transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                        >
                          <MoreHorizontal className="w-5 h-5" />
                        </button>
                        {isMenuOpen && (
                          <div className="absolute right-0 top-12 z-30 w-48 bg-background border border-border rounded-xl shadow-xl p-1.5 space-y-1">
                            {s.locked && (
                              <button onClick={() => { setActiveMenuId(null); handleUnlock(s.id); }} className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-text-primary hover:bg-surface rounded-lg">
                                <LockOpen className="w-4 h-4 text-success" />
                                Unlock Account
                              </button>
                            )}
                            <button onClick={() => { setActiveMenuId(null); handleRegeneratePin(s); }} className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-brand hover:bg-brand/10 rounded-lg">
                              <KeyRound className="w-4 h-4" />
                              Regenerate PIN
                            </button>
                            <button onClick={() => { setActiveMenuId(null); setDeactivateConfirmId(s.id); }} className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-danger hover:bg-danger/10 rounded-lg">
                              <UserX className="w-4 h-4" />
                              Deactivate Staff
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2">
                      {isDeactivated ? (
                        <span className="flex items-center gap-1 text-xs font-semibold text-text-muted bg-surface px-2.5 py-0.5 rounded-full border border-border/40">
                          Deactivated
                        </span>
                      ) : s.locked ? (
                        <span className="flex items-center gap-1 text-xs font-semibold text-danger bg-danger/10 px-2.5 py-0.5 rounded-full border border-danger/20">
                          <ShieldAlert className="w-3.5 h-3.5" /> Account Locked
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs font-semibold text-success bg-success/10 px-2.5 py-0.5 rounded-full border border-success/20">
                          Active Account
                        </span>
                      )}
                    </div>

                    {!isDeactivated && (
                      <div className="pt-1">
                        {s.shiftStatus === "active" ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            Shift Active (Started {formatTime(s.shiftStartedAt)})
                          </span>
                        ) : s.shiftStatus === "ended" ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                            <span className="w-2 h-2 rounded-full bg-amber-500" />
                            Shift Ended ({formatTime(s.shiftEndedAt)})
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-text-muted bg-surface px-2.5 py-1 rounded-full border border-border/40">
                            No Active Shift
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MOBILE VIEW (Condition a: block md:hidden — Matches Reference Image 6 & Staff Spec EXACTLY) */}
      <div className="block md:hidden space-y-4 pb-28 px-1">
        {/* Header Title + Member Count */}
        <div>
          <h1 className="text-[24px] font-bold font-heading text-text-primary tracking-tight">Staff</h1>
          <p className="text-xs text-text-muted font-normal mt-0.5">{staffList.length} active member{staffList.length === 1 ? "" : "s"}</p>
        </div>

        {/* Staff Member Cards */}
        <div className="space-y-3 pt-1">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-xs text-text-muted font-normal bg-surface border border-border/60 rounded-2xl">
              No staff members found. Click Add Staff below to invite your staff.
            </div>
          ) : (
            filtered.map((s) => {
              const initials = s.name.split(" ").map(n => n.charAt(0)).join("").toUpperCase().slice(0, 2);
              const isLocked = s.locked;
              const isMenuOpen = activeMenuId === s.id;

              return (
                <div key={s.id} className="rounded-2xl border border-border/60 bg-surface p-4 flex items-center justify-between relative">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center text-brand font-semibold text-sm overflow-hidden shrink-0">
                      {initials}
                    </div>
                    <div>
                      <p className="text-sm font-normal text-text-primary">{s.name}</p>
                      <p className="text-xs text-text-muted font-normal mt-0.5">Staff Member</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-normal px-2.5 py-0.5 rounded-full ${
                      isLocked ? "text-[#E0665D] bg-[#FDF0EE] dark:bg-[#E0665D]/15" : "text-[#2E9C82] bg-[#E6F4F1] dark:bg-[#2E9C82]/15"
                    }`}>
                      {isLocked ? "Locked" : "Active"}
                    </span>
                    <div className="relative">
                      <button 
                        onClick={() => setActiveMenuId(isMenuOpen ? null : s.id)}
                        className="text-text-muted p-1 text-base font-normal min-h-[44px] min-w-[44px] flex items-center justify-center"
                      >
                        ⋮
                      </button>

                      {isMenuOpen && (
                        <div className="absolute right-0 top-10 z-40 w-44 bg-background border border-border rounded-xl shadow-xl p-1.5 space-y-1 animate-in fade-in zoom-in-95">
                          {s.locked && (
                            <button
                              onClick={() => { setActiveMenuId(null); handleUnlock(s.id); }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-normal text-text-primary hover:bg-surface rounded-lg text-left"
                            >
                              <LockOpen className="w-3.5 h-3.5 text-emerald-600" />
                              Unlock Account
                            </button>
                          )}
                          <button
                            onClick={() => { setActiveMenuId(null); handleRegeneratePin(s); }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-normal text-brand hover:bg-brand/10 rounded-lg text-left"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                            Regenerate PIN
                          </button>
                          <button
                            onClick={() => { setActiveMenuId(null); setDeactivateConfirmId(s.id); }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-normal text-danger hover:bg-danger/10 rounded-lg text-left"
                          >
                            <UserX className="w-3.5 h-3.5" />
                            Deactivate
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Floating Pill Add Staff Button -> Triggers Add Staff Modal */}
        <button 
          onClick={() => { setIsAddModalOpen(true); setError(""); setNewName(""); }}
          className="fixed bottom-20 right-5 z-30 px-5 py-3 rounded-full text-white flex items-center gap-2 shadow-xl text-xs font-semibold hover:scale-105 active:scale-95 transition-transform min-h-[44px]"
          style={{ backgroundImage: 'var(--brand-gradient)' }}
        >
          <span>👤+</span>
          <span>Add Staff</span>
        </button>
      </div>

      {/* 1. Add Staff Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-background w-full max-w-md rounded-[1.25rem] shadow-xl overflow-hidden border border-border/50">
            <div className="px-6 py-4 border-b border-border/40 flex items-center justify-between">
              <h2 className="font-semibold text-text-primary text-[16px]">Add New Staff Member</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-text-muted hover:text-text-primary p-2 min-h-[44px] min-w-[44px] flex items-center justify-center">
                <Plus className="w-5 h-5 rotate-45" />
              </button>
            </div>
            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              {error && (
                <div className="text-[13px] text-danger bg-danger/10 p-3 rounded-xl border border-danger/20">
                  {error}
                </div>
              )}
              
              <div>
                <label className="text-[13px] font-medium text-text-primary block mb-1.5">
                  Staff Name
                </label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. Chidimma Okoro"
                  value={newName} 
                  onChange={e => setNewName(e.target.value)}
                  className="w-full px-3.5 py-3 bg-surface border border-border/50 rounded-xl text-sm text-text-primary focus:ring-2 focus:ring-brand/30 outline-none min-h-[44px]"
                  autoFocus
                />
                <p className="text-xs text-text-muted mt-1.5 flex items-center gap-1">
                  <Info className="w-3.5 h-3.5 shrink-0 text-brand" />
                  A random 4-digit PIN will be generated automatically.
                </p>
              </div>

              <div className="pt-3 flex items-center gap-3">
                <button 
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="w-1/2 py-3 bg-surface border border-border/50 text-text-primary text-xs font-semibold rounded-full hover:bg-surface/80 transition-colors min-h-[44px]"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={loading} 
                  className="w-1/2 py-3 [background:var(--brand-gradient)] text-white text-xs font-semibold rounded-full hover:opacity-90 transition-opacity flex justify-center items-center min-h-[44px]"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Generate Staff PIN"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. One-Time PIN Reveal Modal (Matches Reference Image 7 EXACTLY) */}
      {pinRevealData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl relative animate-in zoom-in-95 duration-200">
            {/* Top Amber Tag Pill */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF8E7] text-[#D97706] text-xs font-normal mx-auto">
              <span>👁</span>
              <span>One-time reveal</span>
            </div>

            {/* Heading & Subtext */}
            <div className="space-y-1">
              <h2 className="font-heading font-bold text-gray-900 text-xl">
                Staff PIN
              </h2>
              <p className="text-xs text-gray-500 font-normal max-w-xs mx-auto leading-relaxed">
                Share this PIN with the staff member. It will not be shown again.
              </p>
            </div>

            {/* Large Centered 4-Digit PIN Box */}
            <div className="bg-[#F8FAFC] rounded-2xl py-4 px-6 my-2 flex items-center justify-center">
              <span className="text-3xl font-bold tracking-[0.4em] text-gray-900 tabular-nums">
                {pinRevealData.pin.split("").join(" ")}
              </span>
            </div>

            {/* Business ID Box with Copy Button */}
            <div className="bg-[#F8FAFC] rounded-2xl p-3.5 flex items-center justify-between">
              <div className="text-left">
                <span className="text-[11px] text-gray-500 font-normal block">
                  Business ID
                </span>
                <span className="text-sm font-bold text-gray-900 block mt-0.5">
                  {pinRevealData.businessCode || "SCB-2025"}
                </span>
              </div>
              <button 
                onClick={copyCredentials}
                className="p-2 text-gray-500 hover:text-gray-700 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Copy Business ID"
              >
                {copied ? <Check className="w-5 h-5 text-emerald-600" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>

            {/* Staff Member Name */}
            <p className="text-xs text-gray-500 font-normal pt-1">
              Staff member: <span className="text-gray-700 font-medium">{pinRevealData.staffName}</span>
            </p>

            {/* Done Button */}
            <button 
              onClick={() => setPinRevealData(null)}
              className="w-full py-3.5 text-white font-semibold text-sm rounded-2xl hover:opacity-95 transition-opacity shadow-md min-h-[44px] mt-2"
              style={{ backgroundImage: 'var(--brand-gradient)' }}
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* 3. Deactivate Confirmation Dialog */}
      {deactivateConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-background w-full max-w-sm rounded-[1.25rem] shadow-xl p-6 border border-border/50 text-center space-y-4">
            <div className="w-12 h-12 bg-danger/10 rounded-full flex items-center justify-center text-danger mx-auto">
              <UserX className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-text-primary text-[16px]">Deactivate Staff Member?</h3>
              <p className="text-[13px] text-text-muted mt-1 leading-snug">
                This staff member will no longer be able to log in. Their sales & audit history will be preserved.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button 
                onClick={() => setDeactivateConfirmId(null)}
                className="w-1/2 py-2 bg-surface text-text-primary text-[13px] font-medium rounded-full hover:bg-surface/80 transition-colors border border-border/50"
              >
                Cancel
              </button>
              <button 
                onClick={() => handleDeactivate(deactivateConfirmId)}
                className="w-1/2 py-2 bg-danger text-white text-[13px] font-medium rounded-full hover:bg-danger/90 transition-colors"
              >
                Deactivate
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
