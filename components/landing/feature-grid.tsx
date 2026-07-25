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
    <section id="features" className="border-y border-border bg-surface">
      <div className="mx-auto max-w-6xl px-6 py-20 sm:px-10 sm:py-28">
        <h2 className="font-heading text-3xl leading-tight tracking-tight text-text-primary sm:text-4xl">
          Everything in one platform.
        </h2>
        <p className="mt-3 max-w-xl text-text-muted">
          Eight features. No middleware. No bolt-ons. No per-transaction fees.
        </p>
        <ul className="mt-10 grid grid-cols-1 border-l border-t border-border sm:grid-cols-2 lg:grid-cols-3">
          {FEATURE_GRID_ITEMS.map((item) => (
            <li
              key={item.title}
              className="border-b border-r border-border p-6 sm:p-7"
            >
              <span
                aria-hidden="true"
                className="inline-flex size-9 items-center justify-center rounded-lg border border-border bg-background text-base leading-none text-text-muted"
              >
                {item.icon}
              </span>
              <h3 className="mt-4 font-heading text-lg text-text-primary">
                {item.title}
              </h3>
              <p className="mt-1.5 text-[15px] leading-relaxed text-text-muted">
                {item.body}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
