"use client";

import * as React from "react";

type Theme = "light" | "dark";

/**
 * Read the current theme synchronously on first render. On the server this
 * returns null (no document); on the client it reads what the inline script
 * in layout.tsx already applied to <html>. This avoids the cascading-render
 * anti-pattern of reading in an effect and then setState'ing.
 */
function readInitialTheme(): Theme | null {
  if (typeof document === "undefined") return null;
  const attr = document.documentElement.getAttribute("data-theme");
  return attr === "dark" ? "dark" : "light";
}

/**
 * Light/dark toggle. Sets data-theme on <html>, persists to localStorage.
 * Source of truth for theme: AGENTS.md §Design System.
 *
 * The inline script in layout.tsx already applied the right data-theme
 * before first paint to avoid a flash — this component only handles the
 * user interaction and stays in sync if data-theme was changed elsewhere.
 */
export function ThemeToggle() {
  const [theme, setTheme] = React.useState<Theme | null>(readInitialTheme);

  const toggle = React.useCallback(() => {
    setTheme((prev) => {
      const next: Theme = prev === "dark" ? "light" : "dark";
      if (next === "dark") {
        document.documentElement.setAttribute("data-theme", "dark");
      } else {
        document.documentElement.removeAttribute("data-theme");
      }
      try {
        localStorage.setItem("ledgr-theme", next);
      } catch {
        // localStorage may be unavailable (private mode) — non-fatal.
      }
      return next;
    });
  }, []);

  // Render a stable button on the server; fill in the label after mount so
  // SSR HTML doesn't claim a theme the user's OS doesn't actually use.
  const isDark = theme === "dark";
  const label = isDark ? "Switch to light mode" : "Switch to dark mode";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme ? label : "Toggle color theme"}
      className={
        // Inline, not fixed — lives inside the navbar now.
        "size-10 inline-flex items-center justify-center " +
        "rounded-xl border border-border bg-surface text-text-primary " +
        "transition-[transform,opacity,box-shadow] duration-150 ease-out " +
        "active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 " +
        "focus-visible:ring-brand focus-visible:ring-offset-2 " +
        "focus-visible:ring-offset-background hover:bg-[color-mix(in_srgb,var(--surface)_85%,var(--text-primary)_15%)]"
      }
    >
      {/* Sun = currently light, click to go dark. Moon = currently dark, click to go light. */}
      {isDark ? <MoonIcon /> : <SunIcon />}
    </button>
  );
}

function SunIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}
