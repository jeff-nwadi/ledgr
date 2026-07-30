"use client";

import { useState } from "react";
import { Copy, Check, Building2, ShieldCheck, Hash, Coins } from "lucide-react";

interface BusinessSettingsProps {
  business: {
    id: string;
    code: string;
    name: string;
    currency: string;
    createdAt: string;
  };
  ownerName: string;
  ownerEmail: string;
}

export function BusinessSettings({ business, ownerName, ownerEmail }: BusinessSettingsProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(business.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* 1. Business ID Card */}
      <div className="rounded-2xl border border-brand/20 bg-brand/5 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Hash className="w-5 h-5 text-brand" />
              <h2 className="font-heading text-lg font-bold text-text-primary">
                Business ID Code
              </h2>
            </div>
            <p className="text-xs text-text-muted max-w-md font-normal">
              Staff members use this 6-character code alongside their 4-digit PIN to log in to shift mode.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-background border border-border/60 rounded-xl px-4 py-2.5 shadow-sm">
            <span className="font-mono text-2xl font-extrabold tracking-wider text-brand">
              {business.code}
            </span>
            <button
              onClick={handleCopy}
              className="p-2 text-text-muted hover:text-brand hover:bg-surface rounded-lg transition-colors flex items-center gap-1.5 text-xs font-medium"
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

      {/* 2. Business Profile Overview */}
      <div className="rounded-2xl border border-border/50 bg-background p-6 space-y-6 shadow-sm">
        <div className="flex items-center gap-3 border-b border-border/40 pb-4">
          <div className="w-10 h-10 bg-surface rounded-full flex items-center justify-center text-brand">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-text-primary text-[15px]">Business Details</h3>
            <p className="text-xs text-text-muted font-normal">General store information and owner profile.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="text-xs font-medium text-text-muted uppercase tracking-wider block mb-1">
              Business Name
            </label>
            <p className="text-sm font-medium text-text-primary">{business.name}</p>
          </div>

          <div>
            <label className="text-xs font-medium text-text-muted uppercase tracking-wider block mb-1 flex items-center gap-1">
              <Coins className="w-3.5 h-3.5 text-brand" /> Default Currency
            </label>
            <p className="text-sm font-medium text-text-primary">{business.currency}</p>
          </div>

          <div>
            <label className="text-xs font-medium text-text-muted uppercase tracking-wider block mb-1 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-brand" /> Account Owner
            </label>
            <p className="text-sm font-medium text-text-primary">{ownerName}</p>
            <p className="text-xs text-text-muted font-normal">{ownerEmail}</p>
          </div>

          <div>
            <label className="text-xs font-medium text-text-muted uppercase tracking-wider block mb-1">
              Created Date
            </label>
            <p className="text-sm font-medium text-text-primary">
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
  );
}
