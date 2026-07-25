"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { ThemeToggle } from "@/components/theme-toggle";

export default function SignInPage() {
  return (
    <React.Suspense fallback={<div className="min-h-dvh bg-background" />}>
      <SignInContent />
    </React.Suspense>
  );
}

function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialType = searchParams.get("type") === "pin" ? "pin" : "owner";

  const [loginType, setLoginType] = React.useState<"owner" | "pin">(initialType);

  // Owner Form State
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [ownerErrors, setOwnerErrors] = React.useState<Record<string, string>>({});
  const [isOwnerLoading, setIsOwnerLoading] = React.useState(false);

  // Staff PIN Form State
  const [businessCode, setBusinessCode] = React.useState("");
  const [pin, setPin] = React.useState("");
  const [pinErrors, setPinErrors] = React.useState<Record<string, string>>({});
  const [isPinLoading, setIsPinLoading] = React.useState(false);
  const [failedAttempts, setFailedAttempts] = React.useState(0);

  // Handle Owner Submit
  const handleOwnerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!email.trim()) errs.email = "Email is required.";
    if (!password) errs.password = "Password is required.";

    setOwnerErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setIsOwnerLoading(true);
    setTimeout(() => {
      setIsOwnerLoading(false);
      // Mock redirect to owner dashboard
      router.push("/");
    }, 1000);
  };

  // Handle Staff PIN Submit
  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!businessCode.trim()) {
      errs.businessCode = "Business ID or shop code is required.";
    }
    if (!pin) {
      errs.pin = "PIN is required.";
    } else if (pin.length < 4 || pin.length > 6) {
      errs.pin = "PIN must be 4–6 digits.";
    }

    setPinErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setIsPinLoading(true);
    setTimeout(() => {
      setIsPinLoading(false);
      // Simulate validation check
      if (pin === "1234" || pin === "1111") {
        router.push("/");
      } else {
        const nextAttempts = failedAttempts + 1;
        setFailedAttempts(nextAttempts);
        if (nextAttempts >= 3) {
          setPinErrors({
            pin: "Too many failed attempts. Account temporarily locked for 15 minutes.",
          });
        } else {
          setPinErrors({
            pin: `Incorrect PIN (${3 - nextAttempts} attempt${3 - nextAttempts === 1 ? "" : "s"} remaining).`,
          });
        }
      }
    }, 1000);
  };

  // Numeric pad helper for staff touch devices
  const handleNumpadPress = (num: string) => {
    if (pin.length < 6) {
      setPin((prev) => prev + num);
      if (pinErrors.pin) setPinErrors((prev) => ({ ...prev, pin: "" }));
    }
  };

  const handleNumpadDelete = () => {
    setPin((prev) => prev.slice(0, -1));
  };

  return (
    <div className="min-h-dvh flex flex-col bg-background text-text-primary">
      {/* Header */}
      <header className="border-b border-border bg-surface/50">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link
            href="/"
            className="font-heading text-xl tracking-tight text-text-primary hover:text-brand transition-colors"
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

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md space-y-6">
          {/* Header text */}
          <div className="text-center space-y-2">
            <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl text-text-primary">
              Welcome back
            </h1>
            <p className="text-sm text-text-muted">
              Choose your login method to access your business ledger.
            </p>
          </div>

          {/* Login Type Switcher (Tabs) */}
          <div className="grid grid-cols-2 p-1.5 rounded-2xl border border-border bg-surface">
            <button
              type="button"
              onClick={() => setLoginType("owner")}
              className={
                "py-2.5 px-3 rounded-xl text-sm font-semibold transition-all select-none " +
                (loginType === "owner"
                  ? "bg-background text-text-primary shadow-sm border border-border/50"
                  : "text-text-muted hover:text-text-primary")
              }
            >
              Owner Login
            </button>
            <button
              type="button"
              onClick={() => setLoginType("pin")}
              className={
                "py-2.5 px-3 rounded-xl text-sm font-semibold transition-all select-none flex items-center justify-center gap-1.5 " +
                (loginType === "pin"
                  ? "bg-background text-text-primary shadow-sm border border-border/50"
                  : "text-text-muted hover:text-text-primary")
              }
            >
              <span>Staff PIN Login</span>
              <span className="size-2 rounded-full bg-brand" />
            </button>
          </div>

          {/* Card Body */}
          <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8 shadow-sm">
            {loginType === "owner" ? (
              /* Owner Login Form */
              <form onSubmit={handleOwnerSubmit} className="space-y-4">
                <div className="space-y-1">
                  <h2 className="font-heading text-xl text-text-primary">
                    Owner Sign In
                  </h2>
                  <p className="text-xs text-text-muted">
                    Sign in with your email and password.
                  </p>
                </div>

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

                <div className="flex items-center justify-between text-xs text-text-muted">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="rounded border-border text-brand focus:ring-brand"
                    />
                    <span>Remember this device</span>
                  </label>
                  <a href="#" className="hover:text-brand transition-colors">
                    Forgot password?
                  </a>
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full"
                    disabled={isOwnerLoading}
                  >
                    {isOwnerLoading ? "Signing in..." : "Sign In as Owner →"}
                  </Button>
                </div>
              </form>
            ) : (
              /* Staff PIN Login Form */
              <form onSubmit={handlePinSubmit} className="space-y-5">
                <div className="space-y-1">
                  <h2 className="font-heading text-xl text-text-primary flex items-center justify-between">
                    <span>Staff Shift Login</span>
                    <span className="text-xs font-normal text-text-muted">
                      Counter Mode
                    </span>
                  </h2>
                  <p className="text-xs text-text-muted">
                    Enter your Business ID and your 4–6 digit staff PIN.
                  </p>
                </div>

                <Input
                  label="Business ID / Shop Code"
                  placeholder="e.g. HERITAGE-01"
                  value={businessCode}
                  onChange={(e) => setBusinessCode(e.target.value.toUpperCase())}
                  error={pinErrors.businessCode}
                  helperText="Provided by your store owner."
                />

                {/* PIN Display */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-text-primary">
                    Staff PIN (4–6 Digits)
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      maxLength={6}
                      pattern="[0-9]*"
                      inputMode="numeric"
                      placeholder="••••"
                      value={pin}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "");
                        setPin(val);
                        if (pinErrors.pin) setPinErrors((prev) => ({ ...prev, pin: "" }));
                      }}
                      className={
                        "w-full h-14 px-4 rounded-xl border bg-background text-text-primary text-center text-2xl font-mono tracking-[0.4em] " +
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand " +
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

                {/* Quick Touch Keypad for phone counters */}
                <div className="pt-1">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-text-muted text-center mb-2">
                    Touch Keypad
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => handleNumpadPress(num)}
                        className="h-11 rounded-xl border border-border bg-background hover:bg-surface text-lg font-mono font-semibold text-text-primary active:scale-95 transition-all"
                      >
                        {num}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setPin("")}
                      className="h-11 rounded-xl border border-border bg-background hover:bg-surface text-xs font-medium text-text-muted active:scale-95 transition-all"
                    >
                      Clear
                    </button>
                    <button
                      type="button"
                      onClick={() => handleNumpadPress("0")}
                      className="h-11 rounded-xl border border-border bg-background hover:bg-surface text-lg font-mono font-semibold text-text-primary active:scale-95 transition-all"
                    >
                      0
                    </button>
                    <button
                      type="button"
                      onClick={handleNumpadDelete}
                      className="h-11 rounded-xl border border-border bg-background hover:bg-surface text-sm font-semibold text-text-muted active:scale-95 transition-all"
                    >
                      ⌫
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full"
                    disabled={isPinLoading || failedAttempts >= 3}
                  >
                    {isPinLoading ? "Verifying PIN..." : "Log In to Shift →"}
                  </Button>
                </div>
              </form>
            )}
          </div>

          {/* Footer message */}
          <p className="text-center text-xs text-text-muted">
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
