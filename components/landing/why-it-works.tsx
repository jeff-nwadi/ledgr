const WHY_ITEMS = [
  {
    icon: "⊕",
    title: "Automated",
    body: "Opening + added − sold = closing, carried forward automatically every day. No manual entry, no formula to break.",
  },
  {
    icon: "△",
    title: "Transparent",
    body: "Calculated closing sits next to counted closing. The variance is the headline, not a footnote buried in a spreadsheet.",
  },
  {
    icon: "↯",
    title: "Offline-ready",
    body: "Sales and waste log on a phone without a signal. The queue syncs to your account when the connection is back.",
  },
  {
    icon: "⊡",
    title: "Built for the counter",
    body: "Staff log in with a 4–6 digit PIN. Large tap targets. Three taps to record a sale. No email account required.",
  },
];

export function WhyItWorks() {
  return (
    <section className="border-y border-border bg-surface">
      <div className="mx-auto max-w-6xl px-6 py-20 sm:px-10 sm:py-24">
        <h2 className="max-w-xl font-heading text-3xl leading-tight tracking-tight text-text-primary sm:text-4xl">
          Built for how small businesses actually work.
        </h2>
        <p className="mt-3 max-w-xl text-text-muted">
          Four things that separate Ledgr from paper, a spreadsheet, or a
          full POS system.
        </p>
        <ul className="mt-12 grid grid-cols-1 divide-y divide-border border-y border-border sm:grid-cols-2 md:grid-cols-4 md:divide-x md:divide-y-0">
          {WHY_ITEMS.map((item) => (
            <li key={item.title} className="px-0 py-8 sm:px-6 md:px-8 md:py-10">
              <span
                aria-hidden="true"
                className="inline-flex size-9 items-center justify-center rounded-xl border border-border bg-background text-base leading-none text-text-muted"
              >
                {item.icon}
              </span>
              <h3 className="mt-4 font-heading text-xl text-text-primary">
                {item.title}
              </h3>
              <p className="mt-2.5 text-[15px] leading-relaxed text-text-muted">
                {item.body}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
