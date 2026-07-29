const FEATURE_GRID_ITEMS = [
  {
    icon: "⊡",
    title: "Product catalog",
    body: "Selling price, cost price, starting stock. Cost drives profit; selling drives revenue.",
  },
  {
    icon: "⊞",
    title: "Sale logging",
    body: "Product + quantity, payment type, customer optional. Three taps on a phone.",
  },
  {
    icon: "⊗",
    title: "Waste & spoilage",
    body: "Same form as a sale, with a reason. Routed through the audit trail, not a side channel.",
  },
  {
    icon: "◎",
    title: "Shift & cash sessions",
    body: "Opening float in, expected cash auto-calculated, counted cash in, variance at close.",
  },
  {
    icon: "◉",
    title: "Customer balances",
    body: "Mark a sale as credit, attach to a customer, watch the running balance. Repayments too.",
  },
  {
    icon: "▤",
    title: "End-of-day summary",
    body: "Revenue, COGS, gross profit, stock value, waste, cash variance — one screen.",
  },
  {
    icon: "⊞",
    title: "CSV export",
    body: "A plain, generic date-range export. No Xero, no special format, no lock-in.",
  },
  {
    icon: "↯",
    title: "Offline queue",
    body: "Sales and waste go into a local queue. They sync to your account when the connection is back.",
  },
];

export function FeatureGrid() {
  return (
    <section id="features" className="border-y border-border bg-surface overflow-hidden">
      <div className="mx-auto max-w-6xl px-5 py-14 sm:px-10 sm:py-28">
        <h2 className="font-heading text-2xl font-bold leading-tight tracking-tight text-text-primary sm:text-4xl">
          Everything in one platform.
        </h2>
        <p className="mt-2 max-w-xl text-xs sm:text-base text-text-muted">
          Eight features. No middleware. No bolt-ons. No per-transaction fees.
        </p>
        <ul className="mt-8 grid grid-cols-1 border-l border-t border-border sm:grid-cols-2 lg:grid-cols-3 sm:mt-10">
          {FEATURE_GRID_ITEMS.map((item) => (
            <li
              key={item.title}
              className="border-b border-r border-border p-4 sm:p-7"
            >
              <div className="flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-sm leading-none text-brand shadow-xs"
                >
                  {item.icon}
                </span>
                <h3 className="font-heading text-base sm:text-lg font-bold text-text-primary">
                  {item.title}
                </h3>
              </div>
              <p className="mt-2 text-xs sm:text-[15px] leading-relaxed text-text-muted">
                {item.body}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
