# CLAUDE.md — Ledgr

This project's full context — product spec, data model, feature scope, and design
system — lives in **`AGENTS.md`** in this same directory. Read it in full before making
changes; this file only adds Claude Code–specific working notes on top of it.

## Before Starting Any Task

1. Read `AGENTS.md` fully.
2. If the task involves any UI, layout, component, or animation work, load the relevant
   installed skill(s) first — see `AGENTS.md` → "Installed Skills" for the full list
   (`baseline-ui`, `emil-design-eng`, `interface-design`, `make-interface-feel-better`,
   `responsive-design`, `review-animation`) and which to use when. Don't freestyle UI
   without checking these first.
3. If the task touches the database schema, check whether it affects tenant scoping
   (`business_id`) or the audit-trail tables (`stock_event`, `cash_session`,
   `customer_debt_event`) — those are treated as append-only/audit-critical, flag any
   change that would let them be mutated or deleted outside their defined flows.
4. If a decision isn't covered in `AGENTS.md` (e.g. exact PIN lockout behavior, whether
   the daily ledger is computed or materialized — see "Open Questions" at the bottom of
   `AGENTS.md`), ask before assuming, rather than picking silently.

## Working Style for This Repo

- Keep changes scoped and incremental — this app is being built in the MVP order listed
  in `AGENTS.md` ("MVP Feature Scope"). Don't build ahead into v2 features
  (multi-location, barcode scanning, recipe/BOM tracking, automated debt reminders)
  unless explicitly asked.
- This is a phone-first tool used by shop staff mid-shift — when building UI, default to
  large tap targets, minimal form fields, and fast paths for the most common action
  (logging a sale), even if that means a slightly less "complete" looking form.
- Favor boring, well-documented patterns over clever ones — a solo developer or small
  team needs to be able to maintain this.

## Commands

_Fill in once the project is scaffolded:_

```bash
# dev server
npm run dev

# typecheck
npm run typecheck

# lint
npm run lint

# tests
npm run test

# db migrations (Neon via Drizzle/Prisma — confirm which ORM before filling this in)
npm run db:migrate
```

## Commit Conventions

- Small, focused commits — one feature-slice at a time, matching the MVP build order.
- Commit message format: `type: short description` (e.g. `feat: add PIN login for staff`,
  `fix: variance calc off-by-one on waste events`).
- Don't bundle schema changes with unrelated UI changes in the same commit.

## Design System Quick Reference

(Full detail in `AGENTS.md` → "Design System" — this is just the fast lookup.)

- Headings: **Strichpunkt Sans** (self-hosted, `next/font/local`)
- Body: **Inter** (`next/font/google`)
- Background: white / `#10201C` dark mode
- Primary button: gradient `#1F6F5F → #2E9C82`, never flat fill
- Variance (cash/stock mismatch) always gets color + icon treatment, never color alone
