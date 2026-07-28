"use client";

import { useState } from "react";
import { Plus, Search, UserSquare2, ShieldAlert, KeyRound, Loader2, LockOpen, UserX, Copy, Check, Info } from "lucide-react";
import { addStaffAction, unlockStaffAction, regeneratePinAction, deactivateOrDeleteStaffAction } from "@/app/actions/staff";

interface Staff {
  id: string;
  name: string;
  locked: boolean;
  failedAttempts: number;
  status: string;
  createdAt: string;
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
            className="w-full pl-9 pr-4 py-2.5 bg-background border border-border/50 rounded-full text-[13px] text-text-primary focus:ring-1 focus:ring-brand/50 outline-none transition-all"
          />
        </div>
        
        <button 
          onClick={() => { setIsAddModalOpen(true); setError(""); setNewName(""); }}
          className="w-full sm:w-auto px-5 py-2.5 [background:var(--brand-gradient)] text-white text-[13px] font-medium rounded-full hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-sm"
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
          <h3 className="text-[14px] font-medium text-text-primary">No staff members found</h3>
          <p className="text-[13px] text-text-muted mt-1">Add staff to allow them to log in using a 4-digit PIN.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(s => {
            const isDeactivated = s.status === "deactivated";
            const formatDate = (iso: string) => {
              try {
                return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
              } catch {
                return "";
              }
            };

            return (
              <div 
                key={s.id} 
                className={`bg-background border rounded-2xl p-5 transition-all shadow-sm flex flex-col justify-between ${
                  isDeactivated ? "border-border/30 opacity-70" : "border-border/50 hover:border-brand/30"
                }`}
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-text-primary text-[15px]">{s.name}</h3>
                      <p className="text-[11px] text-text-muted mt-0.5">
                        Added {formatDate(s.createdAt)}
                      </p>
                    </div>
                    <div className="w-10 h-10 bg-surface rounded-full flex items-center justify-center text-brand">
                      <UserSquare2 className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    {isDeactivated ? (
                      <span className="flex items-center gap-1 text-[11px] font-medium text-text-muted bg-surface px-2.5 py-0.5 rounded-full border border-border/40">
                        Deactivated
                      </span>
                    ) : s.locked ? (
                      <span className="flex items-center gap-1 text-[11px] font-medium text-danger bg-danger/10 px-2.5 py-0.5 rounded-full border border-danger/20">
                        <ShieldAlert className="w-3 h-3" /> Account Locked
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[11px] font-medium text-success bg-success/10 px-2.5 py-0.5 rounded-full border border-success/20">
                        Active
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="pt-4 border-t border-border/40 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {s.locked && !isDeactivated && (
                      <button 
                        onClick={() => handleUnlock(s.id)}
                        disabled={actionLoadingId === s.id}
                        className="flex items-center gap-1 px-3 py-1.5 bg-surface text-text-primary text-[12px] font-medium rounded-full hover:bg-surface/80 transition-colors border border-border/50 disabled:opacity-50"
                        title="Unlock account after failed PIN attempts"
                      >
                        {actionLoadingId === s.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <>
                            <LockOpen className="w-3.5 h-3.5 text-success" />
                            Unlock
                          </>
                        )}
                      </button>
                    )}

                    {!isDeactivated && (
                      <button 
                        onClick={() => handleRegeneratePin(s)}
                        disabled={actionLoadingId === s.id}
                        className="flex items-center gap-1 px-3 py-1.5 bg-brand/10 text-brand text-[12px] font-medium rounded-full hover:bg-brand/20 transition-colors disabled:opacity-50"
                        title="Generate a new 4-digit login PIN"
                      >
                        {actionLoadingId === s.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <>
                            <KeyRound className="w-3.5 h-3.5" />
                            Regenerate PIN
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {!isDeactivated && (
                    <button 
                      onClick={() => setDeactivateConfirmId(s.id)}
                      disabled={actionLoadingId === s.id}
                      className="p-1.5 text-text-muted hover:text-danger hover:bg-danger/10 rounded-full transition-colors"
                      title="Deactivate staff member"
                    >
                      <UserX className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 1. Add Staff Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-background w-full max-w-md rounded-[1.25rem] shadow-xl overflow-hidden border border-border/50">
            <div className="px-6 py-4 border-b border-border/40 flex items-center justify-between">
              <h2 className="font-semibold text-text-primary text-[16px]">Add New Staff Member</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-text-muted hover:text-text-primary p-1">
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
                  className="w-full px-3.5 py-2.5 bg-surface border border-border/50 rounded-xl text-sm text-text-primary focus:ring-2 focus:ring-brand/30 outline-none"
                  autoFocus
                />
                <p className="text-[12px] text-text-muted mt-1.5 flex items-center gap-1">
                  <Info className="w-3.5 h-3.5 shrink-0 text-brand" />
                  A random 4-digit PIN will be generated automatically.
                </p>
              </div>

              <div className="pt-3 flex items-center gap-3">
                <button 
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="w-1/2 py-2.5 bg-surface border border-border/50 text-text-primary text-[13px] font-medium rounded-full hover:bg-surface/80 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={loading} 
                  className="w-1/2 py-2.5 [background:var(--brand-gradient)] text-white text-[13px] font-medium rounded-full hover:opacity-90 transition-opacity flex justify-center items-center"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Generate Staff PIN"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. PIN Reveal Screen / Modal */}
      {pinRevealData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md p-4">
          <div className="bg-background w-full max-w-md rounded-[1.5rem] shadow-2xl overflow-hidden border border-border/60 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-brand/5 border-b border-brand/10 p-6 text-center">
              <div className="w-12 h-12 bg-brand/10 rounded-full flex items-center justify-center text-brand mx-auto mb-3">
                <KeyRound className="w-6 h-6" />
              </div>
              <h2 className="font-heading font-bold text-text-primary text-xl">
                Staff Credentials
              </h2>
              <p className="text-sm text-text-muted mt-1">
                Login setup for <span className="font-semibold text-text-primary">{pinRevealData.staffName}</span>
              </p>
            </div>

            <div className="p-6 space-y-5">
              {/* Credentials Box */}
              <div className="bg-surface border border-border/60 rounded-2xl p-5 space-y-4">
                {/* Business ID Code */}
                <div className="flex items-center justify-between border-b border-border/40 pb-3">
                  <div>
                    <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block">
                      Business ID Code
                    </span>
                    <span className="font-mono text-lg font-bold text-text-primary tracking-wider">
                      {pinRevealData.businessCode}
                    </span>
                  </div>
                  <span className="text-[11px] bg-background px-2.5 py-1 rounded-full border border-border/50 text-text-muted">
                    Shop ID
                  </span>
                </div>

                {/* Plaintext PIN */}
                <div>
                  <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block mb-1">
                    4-Digit Staff PIN
                  </span>
                  <div className="bg-background border border-brand/30 rounded-xl p-3 text-center">
                    <span className="font-mono text-3xl font-extrabold tracking-[0.35em] text-brand">
                      {pinRevealData.pin}
                    </span>
                  </div>
                </div>
              </div>

              {/* Explicit Copy Notice */}
              <div className="text-[12.5px] text-text-muted leading-relaxed bg-surface/50 border border-border/40 rounded-xl p-3.5 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                <span>
                  Give <strong>{pinRevealData.staffName}</strong> both of these — they&apos;ll need the Business ID and this PIN to log in. You won&apos;t see this PIN again after this screen, but you can find the Business ID anytime in Settings.
                </span>
              </div>

              {/* Modal Buttons */}
              <div className="space-y-2 pt-1">
                <button 
                  onClick={copyCredentials}
                  className="w-full py-2.5 bg-surface border border-border/60 text-text-primary text-[13px] font-medium rounded-full hover:bg-surface/80 transition-colors flex items-center justify-center gap-2"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-success" />
                      <span className="text-success">Copied to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-text-muted" />
                      <span>Copy Business ID & PIN</span>
                    </>
                  )}
                </button>

                <button 
                  onClick={() => setPinRevealData(null)}
                  className="w-full py-3 [background:var(--brand-gradient)] text-white text-[13px] font-semibold rounded-full hover:opacity-90 transition-opacity shadow-sm"
                >
                  I&apos;ve Noted This Down
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
