"use client";

import { useState } from "react";
import { SampleDataTag } from "@/components/card";
import { ShieldCheck, Zap, WifiOff, CheckCircle2 } from "lucide-react";
import { ScrollReveal } from "@/components/landing/scroll-reveal";

export function DashboardMockup() {
  const [activeTab, setActiveTab] = useState<"sale" | "waste" | "pin">("sale");

  return (
    <section className="bg-surface overflow-hidden border-y border-border">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-10 sm:py-24">
        {/* Section Header */}
        <ScrollReveal className="mx-auto max-w-2xl text-center">
          <h2 className="mt-4 font-heading text-2xl leading-tight font-bold tracking-tight text-text-primary sm:text-4xl md:text-5xl">
            Built for the counter. Fast for staff.
          </h2>
          <p className="mt-3 text-base leading-relaxed text-text-muted sm:mt-4">
            No complex email logins or passwords. Staff log sales, waste, and shift counts in seconds on any smartphone.
          </p>
        </ScrollReveal>

        {/* Feature Grid & Phone Showcase */}
        <div className="mt-12 sm:mt-16 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left / Phone Mockup (5 cols) */}
          <ScrollReveal delay={100} className="lg:col-span-6 flex justify-center">
            <div className="w-full max-w-[340px] sm:max-w-[360px] rounded-[40px] border-[6px] border-text-primary/90 bg-background p-3 shadow-2xl relative overflow-hidden">
              {/* Phone Notch */}
              <div className="w-32 h-4 bg-text-primary/90 rounded-b-xl mx-auto mb-3 flex justify-center items-center">
                <div className="w-12 h-1 bg-surface/30 rounded-full" />
              </div>

              {/* Phone Content Area */}
              <div className="rounded-[28px] border border-border bg-background p-4 min-h-[460px] flex flex-col justify-between">
                {/* Header inside phone */}
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-border">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-brand/10 flex items-center justify-center font-bold text-xs text-brand">
                        A
                      </div>
                      <div>
                        <p className="text-xs font-bold text-text-primary leading-tight">Adaeze</p>
                        <p className="text-[10px] text-text-muted">Bakery Counter</p>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Active
                    </span>
                  </div>

                  {/* Mode Tabs on Phone */}
                  <div className="grid grid-cols-3 gap-1 my-3 bg-surface p-1 rounded-xl border border-border">
                    <button
                      type="button"
                      onClick={() => setActiveTab("sale")}
                      className={`py-1.5 text-[11px] font-bold rounded-lg transition-colors ${
                        activeTab === "sale"
                          ? "bg-background text-text-primary shadow-xs"
                          : "text-text-muted hover:text-text-primary"
                      }`}
                    >
                      + Sale
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab("waste")}
                      className={`py-1.5 text-[11px] font-bold rounded-lg transition-colors ${
                        activeTab === "waste"
                          ? "bg-background text-text-primary shadow-xs"
                          : "text-text-muted hover:text-text-primary"
                      }`}
                    >
                      + Waste
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab("pin")}
                      className={`py-1.5 text-[11px] font-bold rounded-lg transition-colors ${
                        activeTab === "pin"
                          ? "bg-background text-text-primary shadow-xs"
                          : "text-text-muted hover:text-text-primary"
                      }`}
                    >
                      PIN Screen
                    </button>
                  </div>

                  {/* Dynamic Mockup View */}
                  {activeTab === "sale" && (
                    <div className="space-y-3 animate-in fade-in zoom-in-95 duration-200 motion-reduce:animate-none">
                      <div className="space-y-2">
                        {[
                          { name: "Sourdough Loaf", price: "₦2,400", qty: 2 },
                          { name: "Baguette", price: "₦1,200", qty: 1 },
                        ].map((p) => (
                          <div key={p.name} className="flex items-center justify-between p-2.5 rounded-xl border border-border bg-surface">
                            <div>
                              <p className="text-xs font-bold text-text-primary">{p.name}</p>
                              <p className="text-[10px] text-text-muted">{p.price}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-text-muted">×{p.qty}</span>
                              <span className="text-xs font-bold text-text-primary tabular-nums">
                                ₦{(parseInt(p.price.replace(/[^0-9]/g, "")) * p.qty).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="pt-2 border-t border-border flex items-center justify-between">
                        <span className="text-xs text-text-muted">Total Sale</span>
                        <span className="font-heading text-lg font-bold text-text-primary tabular-nums">₦6,000</span>
                      </div>

                      <button
                        type="button"
                        className="w-full py-3 rounded-xl text-xs font-bold text-white shadow-md active:scale-[0.96] transition-[transform,opacity] duration-150 ease-out bg-[background:var(--brand-gradient)] motion-reduce:transition-none"
                      >
                        ✓ Confirm & Log Sale
                      </button>
                    </div>
                  )}

                  {activeTab === "waste" && (
                    <div className="space-y-3 animate-in fade-in zoom-in-95 duration-200 motion-reduce:animate-none">
                      <div className="p-3 rounded-xl border border-amber-500/20 bg-amber-500/10">
                        <p className="text-xs font-bold text-amber-700 dark:text-amber-300">Log Spoilage / Waste</p>
                        <p className="text-[10px] text-text-muted mt-0.5">Reduces calculated closing stock automatically</p>
                      </div>

                      <div className="space-y-2">
                        <div className="p-2.5 rounded-xl border border-border bg-surface">
                          <p className="text-[10px] text-text-muted uppercase font-bold">Item</p>
                          <p className="text-xs font-bold text-text-primary">Croissant (Stale / Damaged)</p>
                        </div>
                        <div className="p-2.5 rounded-xl border border-border bg-surface flex justify-between items-center">
                          <p className="text-xs font-bold text-text-primary">Quantity: 4 units</p>
                          <span className="text-xs font-bold text-danger">−₦3,200</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        className="w-full py-3 rounded-xl text-xs font-bold text-white bg-danger shadow-md active:scale-[0.96] transition-[transform,opacity] duration-150 ease-out motion-reduce:transition-none"
                      >
                        Record Waste Item
                      </button>
                    </div>
                  )}

                  {activeTab === "pin" && (
                    <div className="space-y-3 text-center py-2 animate-in fade-in zoom-in-95 duration-200 motion-reduce:animate-none">
                      <div className="w-10 h-10 rounded-full bg-brand/10 text-brand flex items-center justify-center mx-auto">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-bold text-text-primary">Enter Staff PIN (4–6 Digits)</p>
                      <div className="flex justify-center gap-1.5 my-1">
                        {[1, 2, 3, 4].map((dot) => (
                          <div key={dot} className="w-2.5 h-2.5 rounded-full bg-brand" />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer status inside phone */}
                <div className="pt-3 border-t border-border flex items-center justify-between text-[10px] text-text-muted">
                  <span className="flex items-center gap-1">
                    <WifiOff className="w-3 h-3 text-brand" /> Offline queue ready
                  </span>
                  <SampleDataTag />
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Right / Benefits List (6 cols) */}
          <div className="lg:col-span-6 space-y-6">
            <ScrollReveal delay={150}>
              <div className="flex items-start gap-4 p-4 rounded-2xl border border-border bg-background transition-all hover:border-brand/30 hover:shadow-sm">
                <div className="w-10 h-10 shrink-0 rounded-xl bg-brand/10 text-brand flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading text-lg font-bold text-text-primary">
                    Fast 4–6 Digit Staff PIN Access
                  </h3>
                  <p className="mt-1 text-sm text-text-muted leading-relaxed">
                    No passwords, emails, or personal accounts required for shop staff. Simply assign a 4–6 digit PIN to each staff member scoped directly to your business.
                  </p>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={200}>
              <div className="flex items-start gap-4 p-4 rounded-2xl border border-border bg-background transition-all hover:border-brand/30 hover:shadow-sm">
                <div className="w-10 h-10 shrink-0 rounded-xl bg-brand/10 text-brand flex items-center justify-center font-bold">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading text-lg font-bold text-text-primary">
                    3 Taps to Record Sales & Waste
                  </h3>
                  <p className="mt-1 text-sm text-text-muted leading-relaxed">
                    Designed for mobile phones used with one hand during busy rush hours. Staff tap product tiles to instantly record sales or log spoilage.
                  </p>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={250}>
              <div className="flex items-start gap-4 p-4 rounded-2xl border border-border bg-background transition-all hover:border-brand/30 hover:shadow-sm">
                <div className="w-10 h-10 shrink-0 rounded-xl bg-brand/10 text-brand flex items-center justify-center font-bold">
                  <WifiOff className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading text-lg font-bold text-text-primary">
                    Offline-First Queue & Sync
                  </h3>
                  <p className="mt-1 text-sm text-text-muted leading-relaxed">
                    Internet connection dropped in the shop? Sales and waste entries are saved locally on the device and sync automatically to Neon as soon as connection restores.
                  </p>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={300}>
              <div className="pt-2 flex items-center gap-2 text-xs font-semibold text-text-muted">
                <CheckCircle2 className="w-4 h-4 text-success" />
                Works on Android, iPhone, and tablets without installing any app.
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  );
}
