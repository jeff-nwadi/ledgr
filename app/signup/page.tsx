"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/button";
import { Input, Select } from "@/components/input";
import { ThemeToggle } from "@/components/theme-toggle";
import { registerOwnerAction } from "@/app/actions/auth";
import { authClient } from "@/lib/auth/auth-client";
import { Info } from "lucide-react";

const CURRENCY_OPTIONS = [
  { value: "NGN", label: "₦ NGN — Nigerian Naira" },
  { value: "USD", label: "$ USD — US Dollar" },
  { value: "GBP", label: "£ GBP — British Pound" },
  { value: "EUR", label: "€ EUR — Euro" },
  { value: "GHS", label: "₵ GHS — Ghanaian Cedi" },
  { value: "KES", label: "KSh KES — Kenyan Shilling" },
];

export default function SignUpPage() {
  const router = useRouter();
  const { data: sessionData } = authClient.useSession();

  // If already logged in, redirect immediately
  React.useEffect(() => {
    if (sessionData?.user) {
      const userRole = (sessionData.user as any).role || "owner";
      window.location.replace(userRole === "staff" ? "/staff" : "/owner");
    }
  }, [sessionData]);

  // Step state: 1 (Business Info) | 2 (Owner Details)
  const [step, setStep] = React.useState<1 | 2>(1);

  // Form fields
  const [businessName, setBusinessName] = React.useState("");
  const [currency, setCurrency] = React.useState("NGN");
  const [ownerName, setOwnerName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");

  // Validation & state
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    if (!businessName.trim()) {
      newErrors.businessName = "Enter your business or shop name.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};

    if (!businessName.trim()) {
      newErrors.businessName = "Enter your business or shop name.";
    }

    if (!ownerName.trim()) {
      newErrors.ownerName = "Enter your full name.";
    }

    if (!email.trim()) {
      newErrors.email = "Enter your email address.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = "Enter a valid email address.";
    }

    if (!password) {
      newErrors.password = "Enter a password.";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters long.";
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match. Try again.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep2()) return;

    setIsLoading(true);

    try {
      const res = await registerOwnerAction({ businessName, currency, ownerName, email, password });
      if (res?.error) {
        setErrors({ email: res.error });
      } else {
        setIsSuccess(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-dvh flex flex-col bg-background text-text-primary">
      {/* Auth Header */}
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
              href="/signin"
              className="text-sm font-medium text-text-muted hover:text-text-primary transition-colors"
            >
              Sign in
            </Link>
          </div>
        </div>
      </header>

      {/* Main Form Area — Sitting Directly on --background */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-[400px] space-y-8">
          {/* Header text */}
          {!isSuccess && (
            <div className="text-center space-y-2">
              <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl text-text-primary">
                Set up your business
              </h1>
              <p className="text-sm text-text-muted font-normal">
                Set up your free account in 2 short steps. No credit card needed.
              </p>
            </div>
          )}

          {/* Form Content directly on page */}
          {isSuccess ? (
            <div className="text-center space-y-4 py-8 animate-in fade-in duration-200">
              <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-success/20 text-success">
                <svg className="size-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="font-heading text-2xl text-text-primary font-bold">
                Account Created!
              </h2>
              <p className="text-text-muted text-sm font-normal">
                Your shop account is ready. Sign in to start using Ledgr.
              </p>
              <div className="pt-4">
                <Link href="/signin">
                  <Button size="lg" className="w-full">
                    Go to Login
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Sleek 2-Step Progress Indicator */}
              <div className="flex items-center justify-between text-xs font-semibold text-text-muted pb-2 border-b border-border/40">
                <span className="text-text-primary">
                  {step === 1 ? "Step 1 of 2: Shop Details" : "Step 2 of 2: Owner Details"}
                </span>
                <div className="flex items-center gap-1.5">
                  <span className={`w-7 h-1.5 rounded-full transition-all duration-200 ${step === 1 ? "bg-brand" : "bg-brand/40"}`} />
                  <span className={`w-7 h-1.5 rounded-full transition-all duration-200 ${step === 2 ? "bg-brand" : "bg-border"}`} />
                </div>
              </div>

              {step === 1 ? (
                /* STEP 1: BUSINESS / SHOP DETAILS */
                <form onSubmit={handleNext} className="space-y-5 animate-in fade-in slide-in-from-left-2 duration-200">
                  <Input
                    label="Business / Shop Name"
                    placeholder="e.g. Heritage Bakehouse"
                    value={businessName}
                    onChange={(e) => {
                      setBusinessName(e.target.value);
                      if (errors.businessName) setErrors((prev) => ({ ...prev, businessName: "" }));
                    }}
                    error={errors.businessName}
                    autoFocus
                  />

                  <Select
                    label="Store Currency"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    options={CURRENCY_OPTIONS}
                    helperText="Currency for your daily sales and customer debt."
                  />

                  <div className="pt-2">
                    <Button
                      type="submit"
                      size="lg"
                      className="w-full"
                    >
                      Next: Owner Account
                    </Button>
                  </div>
                </form>
              ) : (
                /* STEP 2: OWNER ACCOUNT CREDENTIALS */
                <form onSubmit={handleSubmit} className="space-y-5 animate-in fade-in slide-in-from-right-2 duration-200">
                  <Input
                    label="Owner Full Name"
                    placeholder="e.g. Adaeze Okafor"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    error={errors.ownerName}
                    autoFocus
                  />

                  <Input
                    label="Owner Email Address"
                    type="email"
                    placeholder="owner@shop.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    error={errors.email}
                  />

                  <Input
                    label="Password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    error={errors.password}
                    helperText="Minimum 8 characters"
                  />

                  <Input
                    label="Confirm Password"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    error={errors.confirmPassword}
                  />

                  {/* Simple Inline Staff PIN Setup Note */}
                  <div className="flex items-start gap-2.5 text-xs text-text-muted pt-1">
                    <Info className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                    <p className="leading-relaxed">
                      <strong className="font-semibold text-text-primary">Staff Login:</strong> Staff members log in using a 4–6 digit PIN without an email address. You can create PINs in your owner settings after signing up.
                    </p>
                  </div>

                  {/* Dual Action Buttons (Back + Submit) */}
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="w-1/3 h-11 border border-border bg-surface text-text-primary text-xs font-semibold rounded-xl hover:bg-surface/80 active:scale-[0.96] transition-all"
                    >
                      Back
                    </button>
                    <Button
                      type="submit"
                      size="lg"
                      className="w-2/3"
                      disabled={isLoading}
                    >
                      {isLoading ? "Creating..." : "Create Account"}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Footer Link */}
          {!isSuccess && (
            <p className="text-center text-xs text-text-muted pt-2 font-normal">
              Already have a shop account?{" "}
              <Link
                href="/signin"
                className="font-medium text-brand hover:underline"
              >
                Sign in
              </Link>
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
