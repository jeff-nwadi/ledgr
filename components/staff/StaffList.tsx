"use client";

import { useState } from "react";
import { Plus, Search, UserSquare2, ShieldAlert, KeyRound, Loader2, LockOpen } from "lucide-react";
import { addStaffAction, unlockStaffAction, resetPinAction } from "@/app/actions/staff";

interface Staff {
  id: string;
  name: string;
  locked: boolean;
  failedAttempts: number;
}

interface StaffListProps {
  staffList: Staff[];
}

export function StaffList({ staffList }: StaffListProps) {
  const [search, setSearch] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [resetModalData, setResetModalData] = useState<Staff | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [newName, setNewName] = useState("");
  const [newPin, setNewPin] = useState("");

  const filtered = staffList.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin.length < 4 || newPin.length > 6) {
      setError("PIN must be 4 to 6 digits.");
      return;
    }
    setLoading(true);
    setError("");
    const res = await addStaffAction(newName, newPin);
    if (res.error) setError(res.error);
    else {
      setIsAddModalOpen(false);
      setNewName("");
      setNewPin("");
    }
    setLoading(false);
  };

  const handleUnlock = async (staffId: string) => {
    setLoading(true);
    await unlockStaffAction(staffId);
    setLoading(false);
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetModalData) return;
    if (newPin.length < 4 || newPin.length > 6) {
      setError("PIN must be 4 to 6 digits.");
      return;
    }
    setLoading(true);
    setError("");
    const res = await resetPinAction(resetModalData.id, newPin);
    if (res.error) setError(res.error);
    else {
      setResetModalData(null);
      setNewPin("");
    }
    setLoading(false);
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
            className="w-full pl-9 pr-4 py-2.5 bg-background border border-border/50 rounded-full text-[13px] focus:ring-1 focus:ring-brand/50 outline-none transition-all"
          />
        </div>
        
        <button 
          onClick={() => { setIsAddModalOpen(true); setError(""); }}
          className="w-full sm:w-auto px-5 py-2.5 [background:var(--brand-gradient)] text-white text-[13px] font-medium rounded-full hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Staff
        </button>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-border/50 rounded-[1.25rem] bg-surface/30">
          <div className="w-12 h-12 bg-background rounded-full flex items-center justify-center text-text-muted/50 mx-auto mb-3">
            <UserSquare2 className="w-6 h-6" />
          </div>
          <h3 className="text-[14px] font-medium text-text-primary">No staff found</h3>
          <p className="text-[13px] text-text-muted mt-1">Add staff to allow them to log in via PIN.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(s => (
            <div key={s.id} className="bg-background border border-border/50 rounded-2xl p-5 hover:border-brand/30 transition-colors shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-text-primary text-[15px]">{s.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    {s.locked ? (
                      <span className="flex items-center gap-1 text-[11px] font-medium text-danger bg-danger/10 px-2 py-0.5 rounded-full">
                        <ShieldAlert className="w-3 h-3" /> Account Locked
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[11px] font-medium text-success bg-success/10 px-2 py-0.5 rounded-full">
                        Active
                      </span>
                    )}
                  </div>
                </div>
                <div className="w-10 h-10 bg-surface rounded-full flex items-center justify-center text-brand">
                  <UserSquare2 className="w-5 h-5" />
                </div>
              </div>
              
              <div className="pt-4 border-t border-border/40 flex items-center justify-end gap-2">
                {s.locked && (
                  <button 
                    onClick={() => handleUnlock(s.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-surface text-text-primary text-[12px] font-medium rounded-full hover:bg-surface/80 transition-colors border border-border/50"
                  >
                    <LockOpen className="w-3.5 h-3.5" />
                    Unlock
                  </button>
                )}
                <button 
                  onClick={() => { setResetModalData(s); setError(""); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-brand/10 text-brand text-[12px] font-medium rounded-full hover:bg-brand/20 transition-colors"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  Reset PIN
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-background w-full max-w-md rounded-[1.25rem] shadow-xl overflow-hidden border border-border/50">
            <div className="px-6 py-4 border-b border-border/40 flex items-center justify-between">
              <h2 className="font-semibold text-text-primary text-[16px]">Add Staff</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-text-muted hover:text-text-primary">
                <Plus className="w-5 h-5 rotate-45" />
              </button>
            </div>
            <form onSubmit={handleAdd} className="p-6 space-y-4">
              {error && <div className="text-[13px] text-danger bg-danger/10 p-2 rounded">{error}</div>}
              <div>
                <label className="text-[13px] font-medium text-text-primary block mb-1">Staff Name</label>
                <input 
                  type="text" required value={newName} onChange={e => setNewName(e.target.value)}
                  className="w-full px-3 py-2 bg-surface border border-border/50 rounded-lg text-sm text-text-primary focus:ring-1 focus:ring-brand/50 outline-none"
                />
              </div>
              <div>
                <label className="text-[13px] font-medium text-text-primary block mb-1">Login PIN (4-6 digits)</label>
                <input 
                  type="text" required pattern="\d{4,6}" maxLength={6}
                  value={newPin} onChange={e => setNewPin(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-3 py-2 bg-surface border border-border/50 rounded-lg text-sm text-text-primary focus:ring-1 focus:ring-brand/50 outline-none font-mono"
                  placeholder="e.g. 1234"
                />
                <p className="text-[11px] text-text-muted mt-1">Staff will use this PIN to log in.</p>
              </div>
              <div className="pt-2">
                <button type="submit" disabled={loading} className="w-full py-2.5 [background:var(--brand-gradient)] text-white text-[13px] font-medium rounded-full hover:opacity-90 flex justify-center">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Staff"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Modal */}
      {resetModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-background w-full max-w-md rounded-[1.25rem] shadow-xl overflow-hidden border border-border/50">
            <div className="px-6 py-4 border-b border-border/40 flex items-center justify-between">
              <h2 className="font-semibold text-text-primary text-[16px]">Reset PIN</h2>
              <button onClick={() => setResetModalData(null)} className="text-text-muted hover:text-text-primary">
                <Plus className="w-5 h-5 rotate-45" />
              </button>
            </div>
            <form onSubmit={handleReset} className="p-6 space-y-4">
              {error && <div className="text-[13px] text-danger bg-danger/10 p-2 rounded">{error}</div>}
              <div className="mb-4">
                <p className="text-[13px] text-text-muted">Setting new PIN for</p>
                <p className="font-semibold text-text-primary text-[15px]">{resetModalData.name}</p>
              </div>
              <div>
                <label className="text-[13px] font-medium text-text-primary block mb-1">New PIN (4-6 digits)</label>
                <input 
                  type="text" required pattern="\d{4,6}" maxLength={6}
                  value={newPin} onChange={e => setNewPin(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-3 py-2 bg-surface border border-border/50 rounded-lg text-sm text-text-primary focus:ring-1 focus:ring-brand/50 outline-none font-mono"
                  placeholder="e.g. 1234"
                />
              </div>
              <div className="pt-2">
                <button type="submit" disabled={loading} className="w-full py-2.5 [background:var(--brand-gradient)] text-white text-[13px] font-medium rounded-full hover:opacity-90 flex justify-center">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Update PIN"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
