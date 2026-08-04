import { ScrollReveal } from "@/components/landing/scroll-reveal";

const FEATURE_GRID_ITEMS = [
  {
    icon: "⊡",
    title: "Product catalog",
    body: "Set selling price, cost price, and starting stock. Ledgr calculates your revenue and profit.",
  },
  {
    icon: "⊞",
    title: "Record sales",
    body: "Pick a product, quantity, and payment type. Record a sale in seconds.",
  },
  {
    icon: "⊗",
    title: "Waste & spoilage",
    body: "Log damaged or spoiled items with a reason to keep your stock counts accurate.",
  },
  {
    icon: "◎",
    title: "Cash shift tracking",
    body: "Type your starting cash float. Ledgr tracks your expected cash and shows if money is missing at close.",
  },
  {
    icon: "◉",
    title: "Customer balances",
    body: "Record credit sales for customers and track their payments over time.",
  },
  {
    icon: "▤",
    title: "End-of-day summary",
    body: "View your daily revenue, costs, profit, waste, and cash count on one screen.",
  },
  {
    icon: "⊞",
    title: "Spreadsheet export",
    body: "Download a simple file of your sales and stock for any date range.",
  },
  {
    icon: "↯",
    title: "Offline queue",
    body: "Record sales offline without internet. Ledgr saves your data and uploads it when connected.",
  },
];

export function FeatureGrid() {
  return (
    <section id="features" className="border-y border-border bg-surface overflow-hidden">
      <div className="mx-auto max-w-6xl px-5 py-14 sm:px-10 sm:py-28">
        <ScrollReveal>
          <h2 className="font-heading text-2xl font-bold leading-tight tracking-tight text-text-primary sm:text-4xl">
            Everything you need in one place.
          </h2>
          <p className="mt-2 max-w-xl text-xs sm:text-base text-text-muted font-normal">
            Simple tools to run your shop. No extra fees per sale.
          </p>
        </ScrollReveal>
        <ul className="mt-8 grid grid-cols-1 border-l border-t border-border sm:grid-cols-2 lg:grid-cols-3 sm:mt-10">
          {FEATURE_GRID_ITEMS.map((item, idx) => (
            <li
              key={item.title}
              className="border-b border-r border-border p-4 sm:p-7"
            >
              <ScrollReveal delay={idx * 40}>
                <div className="flex items-center gap-3">
                  <span
                    aria-hidden="true"
                    className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-sm leading-none text-brand shadow-xs"
                  >
                    {item.icon}
                  </span>
                  <h3 className="font-heading text-base sm:text-lg font-semibold text-text-primary">
                    {item.title}
                  </h3>
                </div>
                <p className="mt-2 text-xs sm:text-[15px] leading-relaxed text-text-muted font-normal">
                  {item.body}
                </p>
              </ScrollReveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
