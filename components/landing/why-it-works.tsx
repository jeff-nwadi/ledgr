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
    <section className="border-y border-border bg-surface overflow-hidden">
      <div className="mx-auto max-w-6xl px-5 py-14 sm:px-10 sm:py-24">
        <h2 className="max-w-xl font-heading text-2xl font-bold leading-tight tracking-tight text-text-primary sm:text-4xl">
          Built for how small businesses actually work.
        </h2>
        <p className="mt-2.5 max-w-xl text-sm sm:text-base text-text-muted">
          Four things that separate Ledgr from paper, a spreadsheet, or a
          full POS system.
        </p>
        <ul className="mt-8 grid grid-cols-1 divide-y divide-border border-y border-border sm:grid-cols-2 sm:mt-12 md:grid-cols-4 md:divide-x md:divide-y-0">
          {WHY_ITEMS.map((item) => (
            <li key={item.title} className="px-1 py-6 sm:px-6 md:px-8 md:py-10">
              <span
                aria-hidden="true"
                className="inline-flex size-9 items-center justify-center rounded-xl border border-border bg-background text-base leading-none text-brand shadow-xs"
              >
                {item.icon}
              </span>
              <h3 className="mt-3.5 font-heading text-lg sm:text-xl font-bold text-text-primary">
                {item.title}
              </h3>
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
