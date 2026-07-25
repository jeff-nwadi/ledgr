import * as React from "react";

export function SampleDataTag({ className = "" }: { className?: string }) {
  return (
    <p
      className={
        "text-[11px] uppercase tracking-wider text-text-muted " + className
      }
    >
      Sample data
    </p>
  );
}

/** Standard card: rounded-2xl, border, bg-surface, soft shadow. */
export function Card({
  children,
  className = "",
  ariaLabel,
}: {
  children: React.ReactNode;
  className?: string;
  ariaLabel?: string;
}) {
  return (
    <div
      aria-label={ariaLabel}
      className={
        "rounded-2xl border border-border bg-surface " +
        "shadow-[0_0_0_1px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)] " +
        "dark:shadow-[0_0_0_1px_rgba(255,255,255,0.06)] " +
        className
      }
    >
      {children}
    </div>
  );
}
