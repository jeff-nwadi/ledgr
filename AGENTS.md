# AGENTS.md — Ledgr

This file gives any AI coding agent (Claude Code, Cursor, Codex, etc.) the full context
needed to work on this codebase correctly. Read this before making changes.

## What Ledgr Is

Ledgr is a mobile-first web app that replaces the paper end-of-day sales/stock ritual
small businesses (bakeries, restaurants, small retail shops) currently do by hand.

**The core insight it's built on:** staff already track `Opening + Added − Sold = Closing`
stock by hand on paper, carried forward day to day. Ledgr automates that ledger, adds a
waste/spoilage category, and — critically — separates the *calculated* closing figure
(what the numbers say should be left) from a *counted* closing figure (what's physically
there), surfacing the variance instead of hiding it. The same reconciliation pattern
applies to the cash drawer (expected cash vs. counted cash).

**Primary users:**
- **Owner** — sets up the business, adds products, invites staff, reviews daily summaries,
  reconciliation variances, and customer debts.
- **Staff** — logs sales and waste during the day, does end-of-day cash/stock counts. Staff
  log in via PIN, not email (most shop staff don't want to manage an email/password).

## Tech Stack (fixed — do not swap without asking)

- **Framework:** Next.js (App Router)
- **Database:** Neon (serverless Postgres)
- **Auth:** Better Auth — owners use standard email/password; staff use a custom
  PIN-based credential scoped to a business (4–6 digit PIN + business ID, not a global
  username). Implement this as a Better Auth custom credential provider, not a bolt-on
  hack outside the auth system.
- **State management:** Zustand — used for local/session state (active cart, offline
  sale queue, current cash session), not as a replacement for server state. Server data
  fetched via Next.js server components / route handlers stays there; Zustand is for
  ephemeral, client-only state.
- **Offline support:** designed offline-first. Sales/waste logged while offline are
  queued (IndexedDB) and synced to Neon on reconnect. Do not assume a persistent
  connection anywhere in the sale-logging flow.
- **No Xero integration.** CSV export is a plain, generic export — do not build
  Xero-specific formatting or API calls.

## Data Model

Every table below is scoped by `business_id`. Enforce this with Postgres row-level
security policies on Neon, not just application-layer filtering — a missing `WHERE
business_id = ?` in app code should not be able to leak cross-tenant data.

| Table | Key fields | Notes |
|---|---|---|
| `business` | id, name, currency, owner_id, created_at | Tenant root |
| `user` | id, business_id, name, role (`owner`\|`staff`), email (nullable), pin_hash (nullable) | Owners have email; staff have pin_hash |
| `product` | id, business_id, name, unit, selling_price, cost_price, current_stock, low_stock_threshold | `cost_price` drives profit calc, `selling_price` drives revenue |
| `sale` | id, business_id, staff_id, customer_id (nullable), payment_type (`cash`\|`credit`\|`other`), total, created_at | Header row |
| `sale_item` | id, sale_id, product_id, quantity, price_at_sale, cost_at_sale | Snapshot prices at time of sale — never recompute from current `product` prices |
| `stock_event` | id, product_id, business_id, type (`sale`\|`waste`\|`restock`\|`adjustment`), quantity, reason (nullable), note, created_by, created_at | Full audit trail; every stock change goes through this table |
| `daily_stock_ledger` | id, product_id, business_id, date, opening_qty, added_qty, sold_qty, waste_qty, calculated_closing_qty, counted_closing_qty, variance_qty, closing_value | One row per product per day. `opening_qty` = prior day's `counted_closing_qty` if present, else `calculated_closing_qty` |
| `cash_session` | id, business_id, staff_id, date, opening_float, expected_cash, counted_cash, variance, closed_at | One per staff shift/day |
| `customer` | id, business_id, name, phone, balance_owed | For credit/debt tracking |
| `customer_debt_event` | id, customer_id, sale_id (nullable), amount, type (`charge`\|`payment`), created_at | Ledger of owed/paid amounts |

**Key derived numbers (compute, don't hardcode):**
- Revenue = Σ(`sale_item.quantity` × `price_at_sale`)
- COGS = Σ(`sale_item.quantity` × `cost_at_sale`)
- Gross profit = Revenue − COGS
- Stock value on hand = `product.current_stock` × `product.cost_price`, summed
- Variance value = `variance_qty` × `product.cost_price` (stock), or raw ₦ amount (cash)

## MVP Feature Scope

Build in this order; don't jump ahead:

1. **Landing page** — public marketing/entry page. Brand name (Ledgr), one-line value
   prop, short explanation of what it does (replaces the manual opening/added/sold/
   closing paper ledger, adds cash + stock reconciliation), sign-up CTA for owners.
   No app data or auth required to view this page. Uses the design system in full
   (headings/body fonts, gradient CTA button, dark mode toggle) since it's the first
   impression of the brand.
2. **Auth pages (UI + flow):** owner sign-up/login screens (email/password via Better
   Auth), staff PIN login screen scoped to a business. Build the visible flow end to
   end — screens, form validation, error states, redirect on success — before deep
   backend hardening (see item 3).
3. Auth backend/schema: Better Auth setup, `user` table extensions (business_id, role,
   pin_hash), PIN lockout logic, RLS policies on tenant-scoped tables. (This is the
   backend counterpart to item 2 — the UI can be built and reviewed first, but this
   must be in place before auth is considered done, not skipped.)
4. Product management: add/edit product with selling price, cost price, starting stock
5. Sale logging: product + quantity form → creates `sale` + `sale_item` + `stock_event`
   (type `sale`) → decrements `product.current_stock`
6. Waste logging: product + quantity + reason → `stock_event` (type `waste`)
7. Daily Stock Ledger view: per product, Opening/Added/Sold/Waste/Calculated Closing,
   with a "confirm count" action for staff to enter Counted Closing → shows variance
8. Cash session: opening float entry at shift start, expected cash auto-calculated from
   cash sales, "close shift" flow where staff enters counted cash → shows variance
9. Customer debt: mark a sale as `credit`, attach to a customer, track running balance
10. Daily summary dashboard (owner view): revenue, COGS, gross profit, stock value, waste
    value, cash variance, stock variance — one screen, no digging required
11. CSV export for a date range (generic format — columns: date, product, qty sold,
    revenue, cost, profit)
12. Offline queue for sale/waste logging + background sync

**Explicitly out of scope for MVP:** multi-location, staff permission tiers beyond
owner/staff, barcode scanning, recipe/ingredient-to-menu-item conversion, automated
SMS/WhatsApp debt reminders, direct accounting-software API sync.

## Design System

**Brand name:** Ledgr

**Fonts:**
- Headings: **Strichpunkt Sans** (self-hosted — pull font files from
  https://github.com/strichpunkt-design/Strichpunkt_Sans and load via `next/font/local`,
  it is not on Google Fonts / a CDN)
- Body: **Inter** (via `next/font/google`)

**Color tokens:**

| Token | Light mode | Dark mode | Use |
|---|---|---|---|
| `--background` | `#FFFFFF` | `#10201C` | Page background |
| `--surface` | `#F7F9F8` | `#16261F` | Cards, panels |
| `--text-primary` | `#12181B` | `#F5F7F6` | Body text |
| `--text-muted` | `#5B6764` | `#9AAAA5` | Secondary text |
| `--border` | `#E4E9E7` | `#25352E` | Dividers, input borders |
| `--brand` | `#1F6F5F` | `#1F6F5F` | Core brand teal |
| `--brand-gradient` | `linear-gradient(135deg, #1F6F5F 0%, #2E9C82 100%)` | same | **Buttons only** — primary actions use this gradient, never a flat fill |
| `--danger` | `#B3423A` | `#E0665D` | Variance/shortfall flags, destructive actions |
| `--success` | `#2E9C82` | `#3FB89A` | Positive variance, confirmations |

Implement dark mode via a `data-theme` attribute or `prefers-color-scheme`, with all
tokens above as CSS variables — never hardcode hex values in components.

**Design principles for this app specifically:**
- This is a **utility tool used quickly, often one-handed, on a phone, in a busy shop.**
  Prioritize large tap targets, minimal steps to log a sale, and legible numbers over
  decorative flourish.
- The gradient is reserved for primary buttons (Log Sale, Confirm Count, Close Shift) —
  it should read as "the action that matters on this screen," not decoration applied
  everywhere.
- Variance (cash or stock) is the most important signal in the product — give it clear,
  consistent visual treatment (color + icon, not color alone, for accessibility) wherever
  it appears.
- Numbers are the content. Use tabular figures for anything numeric so columns of
  quantities/currency align cleanly.

## Installed Skills — Use These for All UI/Design Work

This environment has the following skills installed. Any coding agent working on this
repo should search for and load the relevant skill(s) before writing or reviewing
front-end/UI code — they take priority over generic design instinct, including the
"Design System" section above where they overlap. If a skill's guidance conflicts with
something written above, defer to the skill and flag the conflict rather than silently
picking one.

| Skill | Load it when... |
|---|---|
| `baseline-ui` | Starting any new component or screen — establishes baseline patterns/primitives to build from instead of one-off styling |
| `emil-design-eng` | Doing detailed design-engineering passes on components — spacing, states, structural polish |
| `interface-design` | Making layout/IA decisions — how a screen is composed, what goes where, hierarchy |
| `make-interface-feel-better` | After a feature is functionally done — pass for perceived performance, micro-interactions, transitions that make it feel responsive rather than static |
| `responsive-design` | Any screen that needs to work across phone/tablet/desktop — this app is phone-first (see Design System principles above), so this applies to nearly every screen |
| `review-animation` | Reviewing any animation/transition before merging — loading states, the gradient buttons, variance flag reveals, cash/stock reconciliation confirmations |

Mobile App Design Standards:
- 14px readable body text (use 14px as base for body/labels; headings scale from there)
- 24px safe area padding on all sides of main content (app-level spacing, not per-component)
- 44px minimum tap target size for all interactive elements (buttons, links, list items, form inputs)
- Inputs and touch targets have rounded corners (4–8px) for comfortable tapping
- High contrast: ensure text/background combos meet WCAG AA contrast ratio in both light and dark mode
- Keep interactive controls at the bottom when possible for thumb reach
- Reduce horizontal scrolling—prioritize vertical scrolling and content reflow
- Use larger fonts and bolder weights for key information (numbers, totals, warnings)

**Suggested order for building a new screen:** `interface-design` (structure) →
`baseline-ui` (build with primitives) → `responsive-design` (verify across breakpoints)
→ `make-interface-feel-better` (polish pass) → `review-animation` (if the screen has
motion — e.g. the variance reveal, sale confirmation, offline-sync indicator).

## Coding Conventions

- TypeScript throughout, strict mode on.
- Server components by default; use client components only where interactivity (forms,
  Zustand-driven state) requires it.
- Every database query touching tenant data must be scoped by `business_id` — treat a
  missing scope as a security bug, not a bug.
- Money/quantity math: use integers (smallest currency unit, e.g. kobo) or a decimal
  library — never plain floats for currency.
- Every stock or cash mutation goes through the `stock_event` / `cash_session` tables —
  never mutate `product.current_stock` directly from application code outside those
  paths, so the audit trail stays complete.

## Open Questions to Confirm Before Building Further

- Exact PIN length/format and lockout behavior after failed attempts
- Whether `daily_stock_ledger` rows are computed on-demand or materialized by a nightly
  job (materializing is likely better for offline sync + history performance, but adds
  a job to run)
- Multi-currency: confirm single-currency-per-business is fine for MVP