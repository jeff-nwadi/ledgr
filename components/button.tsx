import * as React from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "md" | "lg";

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-xl font-semibold " +
  "transition-[transform,opacity,box-shadow] duration-150 ease-out " +
  "active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 " +
  "focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background " +
  "disabled:opacity-50 disabled:pointer-events-none select-none";

const SIZES: Record<ButtonSize, string> = {
  md: "h-11 px-5 text-[15px]",
  // Phone-first CTA — 52px hit area, above the 44px minimum, for the landing sign-up.
  lg: "h-[52px] px-7 text-base",
};

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "text-white [background:var(--brand-gradient)] " +
    // Brand-tinted elevation shadow, fully token-driven (no hex literal).
    "shadow-[0_1px_2px_rgba(0,0,0,0.12),0_4px_12px_rgb(var(--brand-rgb)/0.18)] " +
    "hover:shadow-[0_1px_2px_rgba(0,0,0,0.14),0_6px_16px_rgb(var(--brand-rgb)/0.24)]",
  secondary:
    "bg-surface text-text-primary border border-border " +
    "hover:bg-[color-mix(in_srgb,var(--surface)_85%,var(--text-primary)_15%)]",
  ghost: "bg-transparent text-text-primary hover:bg-surface",
};

/** Compose the className for a button/button-link of a given variant + size. */
export function buttonStyles(
  variant: ButtonVariant = "primary",
  size: ButtonSize = "md",
  className = "",
): string {
  return `${BASE} ${SIZES[size]} ${VARIANTS[variant]} ${className}`.trim();
}

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

/**
 * Ledgr primary button. Use this for real <button> actions (form submits,
 * dialog confirmations, etc.). For navigation, use ButtonLink below.
 *
 * variant="primary"  → --brand-gradient. Reserved for the single action that
 *                      matters on the screen (per AGENTS.md). Never decoration.
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    { variant = "primary", size = "md", className = "", children, ...rest },
    ref,
  ) {
    return (
      <button
        ref={ref}
        className={buttonStyles(variant, size, className)}
        {...rest}
      >
        {children}
      </button>
    );
  },
);

type ButtonLinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  href: string;
};

/**
 * Same look as Button, but renders an <a> for navigation. Pairs with next/link
 * via the standard pattern: import Link from "next/link" and pass it through
 * the child slot of an inner wrapper, or compose directly with the href prop.
 */
export const ButtonLink = React.forwardRef<HTMLAnchorElement, ButtonLinkProps>(
  function ButtonLink(
    { variant = "primary", size = "md", className = "", children, ...rest },
    ref,
  ) {
    return (
      <a
        ref={ref}
        className={buttonStyles(variant, size, className)}
        {...rest}
      >
        {children}
      </a>
    );
  },
);
