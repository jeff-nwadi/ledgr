"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/button";
import { Input, Select } from "@/components/input";
import { ThemeToggle } from "@/components/theme-toggle";
import { registerOwnerAction } from "@/app/actions/auth";

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

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!businessName.trim()) {
      newErrors.businessName = "Business name is required.";
    }

    if (!ownerName.trim()) {
      newErrors.ownerName = "Your full name is required.";
    }

    if (!email.trim()) {
      newErrors.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!password) {
      newErrors.password = "Password is required.";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters.";
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);

    try {
      const res = await registerOwnerAction({ businessName, currency, ownerName, email, password });
      if (res?.error) {
        setErrors({ email: res.error }); // General error shown on email or we can add a general error field
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
              href="/signin"
              className="text-sm font-medium text-text-muted hover:text-text-primary transition-colors"
            >
              Sign in
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md space-y-6">
          {/* Title */}
          <div className="text-center space-y-2">
            <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl text-text-primary">
              Set up your business
            </h1>
            <p className="text-sm text-text-muted">
              Start your free MVP account in less than 2 minutes. No card required.
            </p>
          </div>

          {/* Form Card or Success State */}
          <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8 shadow-sm">
            {isSuccess ? (
              <div className="text-center space-y-4 py-8">
                <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-success/20 text-success">
                  <svg className="size-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="font-heading text-2xl text-text-primary font-bold">
                  Account Created Successfully!
                </h2>
                <p className="text-text-muted text-sm">
                  Your business account has been set up. Please login to continue.
                </p>
                <div className="pt-4">
                  <Link href="/signin">
                    <Button size="lg" className="w-full">
                      Go to Login →
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Business / Shop Name"
                  placeholder="e.g. Heritage Bakehouse"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  error={errors.businessName}
                />

                <Select
                  label="Store Currency"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  options={CURRENCY_OPTIONS}
                  helperText="Used for daily sales totals and debt tracking."
                />

                <Input
                  label="Owner Full Name"
                  placeholder="e.g. Adaeze Okafor"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  error={errors.ownerName}
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

                {/* Notice */}
                <div className="p-3 rounded-xl border border-border bg-background/50 text-xs text-text-muted space-y-1">
                  <p className="font-semibold text-text-primary flex items-center gap-1">
                    <span>ℹ</span> Staff PIN Setup
                  </p>
                  <p>
                    Staff members log in with a 4–6 digit PIN (no email needed).
                    You can generate PINs inside your owner settings after sign up.
                  </p>
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? "Creating Business..." : "Create Business Account →"}
                  </Button>
                </div>
              </form>
            )}
          </div>

          {/* Footer Link */}
          {!isSuccess && (
            <p className="text-center text-sm text-text-muted">
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
