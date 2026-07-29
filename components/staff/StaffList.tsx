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
    <div className="space-y-6">
      
      {/* Toolbar */}
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

      {/* Staff Grid */}
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
            const formatDate = (iso?: string) => {
              if (!iso) return "";
              try {
                return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
              } catch {
                return "";
              }
            };
            const formatTime = (iso?: string) => {
              if (!iso) return "";
              try {
                return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
              } catch {
                return "";
              }
            };

            const isMenuOpen = activeMenuId === s.id;

            return (
              <div 
                key={s.id} 
                className={`bg-background border rounded-2xl p-5 transition-all shadow-sm flex flex-col justify-between relative ${
                  isDeactivated ? "border-border/30 opacity-70" : "border-border/50 hover:border-brand/30"
                }`}
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-text-primary text-base sm:text-[17px]">{s.name}</h3>
                      <p className="text-xs text-text-muted mt-0.5">
                        Added {formatDate(s.createdAt)}
                      </p>
                    </div>

                    {/* Overflow "..." Action Menu Button */}
                    {!isDeactivated && (
                      <div className="relative">
                        <button
                          onClick={() => setActiveMenuId(isMenuOpen ? null : s.id)}
                          className="p-2 text-text-muted hover:text-text-primary rounded-full hover:bg-surface transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                          aria-label="Staff member options"
                        >
                          <MoreHorizontal className="w-5 h-5" />
                        </button>

                        {/* Dropdown Menu */}
                        {isMenuOpen && (
                          <div className="absolute right-0 top-12 z-30 w-48 bg-background border border-border rounded-xl shadow-xl p-1.5 space-y-1 animate-in fade-in zoom-in-95">
                            {s.locked && (
                              <button
                                onClick={() => { setActiveMenuId(null); handleUnlock(s.id); }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-text-primary hover:bg-surface rounded-lg text-left transition-colors min-h-[40px]"
                              >
                                <LockOpen className="w-4 h-4 text-success" />
                                Unlock Account
                              </button>
                            )}
                            <button
                              onClick={() => { setActiveMenuId(null); handleRegeneratePin(s); }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-brand hover:bg-brand/10 rounded-lg text-left transition-colors min-h-[40px]"
                            >
                              <KeyRound className="w-4 h-4" />
                              Regenerate PIN
                            </button>
                            <button
                              onClick={() => { setActiveMenuId(null); setDeactivateConfirmId(s.id); }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-danger hover:bg-danger/10 rounded-lg text-left transition-colors min-h-[40px]"
                            >
                              <UserX className="w-4 h-4" />
                              Deactivate Staff
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Account Access & Shift Status Badges */}
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

                    {/* Shift Status Indicator */}
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
              </div>
            );
          })}
        </div>
      )}

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

      {/* 2. PIN Reveal Modal (Full-Screen Takeover on Mobile for Handing Phone to Staff) */}
      {pinRevealData && (
        <div className="fixed inset-0 z-50 flex flex-col justify-between md:justify-center items-center bg-background md:bg-black/60 backdrop-blur-md p-6 sm:p-4 overflow-y-auto">
          <div className="bg-background w-full max-w-md rounded-3xl md:rounded-[1.5rem] shadow-2xl overflow-hidden border border-border/60 my-auto animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-brand/10 border-b border-brand/20 p-6 text-center">
              <div className="w-16 h-16 bg-brand text-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-md">
                <KeyRound className="w-8 h-8" />
              </div>
              <h2 className="font-heading font-extrabold text-text-primary text-2xl">
                Staff Credentials
              </h2>
              <p className="text-sm text-text-muted mt-1">
                Hand phone to <strong className="text-brand font-bold">{pinRevealData.staffName}</strong>
              </p>
            </div>

            <div className="p-6 space-y-6">
              {/* Massive Credentials Display */}
              <div className="bg-surface border-2 border-brand/30 rounded-2xl p-6 space-y-5 shadow-inner">
                {/* Business ID Code */}
                <div className="text-center pb-4 border-b border-border/50">
                  <span className="text-xs font-extrabold text-text-muted uppercase tracking-widest block mb-1">
                    Business ID Code
                  </span>
                  <span className="font-mono text-3xl font-black text-text-primary tracking-widest block">
                    {pinRevealData.businessCode}
                  </span>
                </div>

                {/* Massive 4-Digit PIN */}
                <div className="text-center">
                  <span className="text-xs font-extrabold text-text-muted uppercase tracking-widest block mb-2">
                    Staff Login PIN
                  </span>
                  <div className="bg-background border-2 border-brand rounded-2xl p-4 shadow-sm">
                    <span className="font-mono text-5xl font-black tracking-[0.3em] text-brand block">
                      {pinRevealData.pin}
                    </span>
                  </div>
                </div>
              </div>

              {/* Copy Notice */}
              <div className="text-xs text-text-muted leading-relaxed bg-surface/50 border border-border/40 rounded-xl p-3.5 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                <span>
                  Provide both the Business ID and PIN to <strong>{pinRevealData.staffName}</strong> for shift login.
                </span>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-1">
                <button 
                  onClick={copyCredentials}
                  className="w-full py-3.5 bg-surface border border-border/60 text-text-primary text-xs font-bold rounded-xl hover:bg-surface/80 transition-colors flex items-center justify-center gap-2 min-h-[44px]"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-success" />
                      <span className="text-success">Copied to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-text-muted" />
                      <span>Copy Credentials</span>
                    </>
                  )}
                </button>

                <button 
                  onClick={() => setPinRevealData(null)}
                  className="w-full py-3.5 [background:var(--brand-gradient)] text-white text-sm font-bold rounded-xl hover:opacity-90 transition-opacity shadow-md min-h-[48px]"
                >
                  Done / Handed to Staff
                </button>
              </div>
            </div>
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

    </div>
  );
}
