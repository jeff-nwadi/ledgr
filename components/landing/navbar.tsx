"use client";

import { useState } from "react";
import Link from "next/link";
import { ButtonLink } from "@/components/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Menu, X } from "lucide-react";

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-md supports-backdrop-filter:bg-background/80">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-10 sm:py-4">
        {/* Brand Logo */} 
        <Link
          href="/"
          className="font-heading text-xl font-bold tracking-tight text-text-primary min-h-[44px] flex items-center gap-2"
        >
          Ledgr
        </Link>

        {/* Desktop Navigation Links */}
        <nav aria-label="Primary navigation" className="hidden items-center gap-7 md:flex">
          <a
            href="#features"
            className="text-sm font-medium text-text-muted transition-colors hover:text-text-primary min-h-[44px] inline-flex items-center"
          >
            Features
          </a>
          <a
            href="#faq"
            className="text-sm font-medium text-text-muted transition-colors hover:text-text-primary min-h-[44px] inline-flex items-center"
          >
            FAQ
          </a>
        </nav>

        {/* Action Controls & Hamburger Toggle */}
        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />

          {/* Mobile Hamburger Button */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-text-muted hover:text-text-primary hover:bg-surface rounded-xl border border-border transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-expanded={isMobileMenuOpen}
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <ButtonLink 
            href="/signup" 
            size="md" 
            className="hidden md:inline-flex font-bold"
          >
            Create account
          </ButtonLink>
        </div>
      </div>

      {/* Mobile Navigation Dropdown Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-b border-border bg-background px-4 py-4 space-y-3 animate-in slide-in-from-top duration-200 shadow-xl">
          <nav className="flex flex-col space-y-1">
            <a
              href="#features"
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-3 py-2.5 rounded-xl text-sm font-semibold text-text-primary hover:bg-surface transition-colors min-h-[44px] flex items-center"
            >
              Features
            </a>
            <a
              href="#faq"
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-3 py-2.5 rounded-xl text-sm font-semibold text-text-primary hover:bg-surface transition-colors min-h-[44px] flex items-center"
            >
              FAQ
            </a>
            <Link
              href="/signin"
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-3 py-2.5 rounded-xl text-sm font-semibold text-text-primary hover:bg-surface transition-colors min-h-[44px] flex items-center"
            >
              Owner sign in
            </Link>
            <Link
              href="/signin?type=pin"
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-3 py-2.5 rounded-xl text-sm font-semibold text-brand hover:bg-brand/10 transition-colors min-h-[44px] flex items-center"
            >
              Staff PIN sign in
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
