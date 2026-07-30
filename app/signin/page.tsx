"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { ThemeToggle } from "@/components/theme-toggle";
import { authClient } from "@/lib/auth/auth-client";
import { toast } from "@/lib/store/toast-store";

export default function SignInPage() {
  return (
    <React.Suspense fallback={<div className="min-h-dvh bg-background" />}>
      <SignInContent />
    </React.Suspense>
  );
}

function SignInContent() {
  const searchParams = useSearchParams();
  const { data: sessionData } = authClient.useSession();

  const initialType = searchParams.get("type") === "pin" ? "pin" : "owner";
  const [loginType, setLoginType] = React.useState<"owner" | "pin">(initialType);

  // If already logged in client-side, redirect immediately
  React.useEffect(() => {
    if (sessionData?.user) {
      const userRole = (sessionData.user as any).role || "owner";
      window.location.replace(userRole === "staff" ? "/staff" : "/owner");
    }
  }, [sessionData]);

  // Owner Form State
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [ownerErrors, setOwnerErrors] = React.useState<Record<string, string>>({});
  const [isOwnerLoading, setIsOwnerLoading] = React.useState(false);

  // Staff PIN Form State (2 fields: Business ID + PIN)
  const [businessCode, setBusinessCode] = React.useState("");
  const [pin, setPin] = React.useState("");
  const [pinErrors, setPinErrors] = React.useState<Record<string, string>>({});
  const [isPinLoading, setIsPinLoading] = React.useState(false);

  const handleOwnerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!email.trim()) errs.email = "Email is required.";
    if (!password) errs.password = "Password is required.";

    setOwnerErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setIsOwnerLoading(true);
    const res = await authClient.signIn.email({ email, password });
    setIsOwnerLoading(false);

    if (res.error) {
      setOwnerErrors({ email: res.error.message || "Invalid credentials." });
      toast.error("Sign in failed", res.error.message || "Invalid credentials.");
    } else {
      toast.success("Welcome back!", "Redirecting to owner dashboard...");
      window.location.replace("/owner");
    }
  };

  // Handle Staff PIN Submit (Business ID + 4-digit PIN)
  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!businessCode.trim()) {
      errs.businessCode = "Business ID code is required.";
    }
    if (!pin) {
      errs.pin = "PIN is required.";
    } else if (pin.length !== 4) {
      errs.pin = "PIN must be 4 digits.";
    }

    setPinErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setIsPinLoading(true);
    try {
      const res = await fetch("/api/auth/staff-pin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessCode: businessCode.trim(), pin: pin.trim() }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.error || data.status === "error") {
        const errMsg = data.message || data.error || "Invalid Business ID code or PIN.";
        setPinErrors({ form: errMsg });
        toast.error("Access Denied", errMsg);
      } else {
        toast.success("Shift Authorized!", "Loading staff dashboard...");
        window.location.replace("/staff");
      }
    } catch (err: any) {
      setPinErrors({ form: "Failed to connect to authentication server." });
      toast.error("Connection Error", "Failed to connect to authentication server.");
    } finally {
      setIsPinLoading(false);
    }
  };

  return (
    <div className="min-h-dvh flex flex-col bg-background text-text-primary">
      {/* Header */}
      <header className="px-6 py-5">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link
            href="/"
            className="font-heading text-xl font-bold tracking-tight text-text-primary hover:text-brand transition-colors"
          >
            Ledgr
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/signup"
              className="text-sm font-medium text-text-muted hover:text-text-primary transition-colors"
            >
              Sign up
            </Link>
          </div>
        </div>
      </header>

      {/* Main Form Area — Sitting Directly on --background */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-[400px] space-y-8">
          
          {/* Header & Segmented Pill Switcher */}
          <div className="space-y-6 text-center">
            <div className="space-y-2">
              <h1 className="font-heading text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
                Welcome back
              </h1>
              <p className="text-sm text-text-muted font-normal">
                Choose your login method to access your business ledger.
              </p>
            </div>

            {/* Lighter Segmented Pill Control */}
            <div className="inline-flex p-1 bg-surface border border-border/50 rounded-full text-xs font-semibold select-none">
              <button
                type="button"
                onClick={() => setLoginType("owner")}
                className={`px-5 py-2 rounded-full transition-all ${
                  loginType === "owner"
                    ? "bg-background text-text-primary shadow-xs"
                    : "text-text-muted hover:text-text-primary"
                }`}
              >
                Owner Login
              </button>
              <button
                type="button"
                onClick={() => setLoginType("pin")}
                className={`px-5 py-2 rounded-full transition-all flex items-center gap-1.5 ${
                  loginType === "pin"
                    ? "bg-background text-text-primary shadow-xs"
                    : "text-text-muted hover:text-text-primary"
                }`}
              >
                <span>Staff Login</span>
                <span className="size-1.5 rounded-full bg-brand" />
              </button>
            </div>
          </div>

          {/* Form Content directly on page */}
          {loginType === "owner" ? (
            /* Owner Login Form */
            <form onSubmit={handleOwnerSubmit} className="space-y-5">
              <Input
                label="Email Address"
                type="email"
                placeholder="owner@bakery.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={ownerErrors.email}
              />

              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={ownerErrors.password}
              />

              <div className="pt-2">
                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={isOwnerLoading}
                >
                  {isOwnerLoading ? "Signing in..." : "Sign In as Owner"}
                </Button>
              </div>
            </form>
          ) : (
            /* Staff PIN Login Form (2 Fields: Business ID + PIN) */
            <form onSubmit={handlePinSubmit} className="space-y-5">
              {pinErrors.form && (
                <div className="text-xs font-medium text-danger bg-danger/10 p-3.5 rounded-xl border border-danger/20">
                  ⚠ {pinErrors.form}
                </div>
              )}

              <Input
                label="Business ID Code"
                placeholder="e.g. X9K3M7 or ZARI'S-CAK-972"
                value={businessCode}
                maxLength={50}
                onChange={(e) => {
                  setBusinessCode(e.target.value.toUpperCase());
                  if (pinErrors.businessCode) setPinErrors(prev => ({ ...prev, businessCode: "" }));
                }}
                error={pinErrors.businessCode}
                helperText="Provided in Business Settings."
              />

              {/* PIN Display */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider">
                  4-Digit Staff PIN
                </label>
                <div className="relative">
                  <input
                    type="password"
                    maxLength={4}
                    pattern="[0-9]*"
                    inputMode="numeric"
                    placeholder="••••"
                    value={pin}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      setPin(val);
                      if (pinErrors.pin) setPinErrors((prev) => ({ ...prev, pin: "" }));
                      if (pinErrors.form) setPinErrors((prev) => ({ ...prev, form: "" }));
                    }}
                    className={
                      "w-full h-14 px-4 rounded-xl border bg-surface text-text-primary text-center text-2xl font-mono tracking-[0.4em] " +
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand transition-all " +
                      (pinErrors.pin ? "border-danger" : "border-border")
                    }
                  />
                </div>
                {pinErrors.pin && (
                  <p className="text-xs font-medium text-danger flex items-center gap-1">
                    <span aria-hidden="true">⚠</span> {pinErrors.pin}
                  </p>
                )}
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={isPinLoading}
                >
                  {isPinLoading ? "Verifying PIN..." : "Log In to Shift"}
                </Button>
              </div>
            </form>
          )}

          {/* Footer message */}
          <p className="text-center text-xs text-text-muted pt-2 font-normal">
            Need to register a new shop?{" "}
            <Link
              href="/signup"
              className="font-medium text-brand hover:underline"
            >
              Create Business Account
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
