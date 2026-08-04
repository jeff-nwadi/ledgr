import { ScrollReveal } from "@/components/landing/scroll-reveal";

const WHY_ITEMS = [
  {
    icon: "⊕",
    title: "Math done for you",
    body: "Opening stock + Added − Sold = Closing stock. Ledgr calculates everything every day. You do not need paper or calculators.",
  },
  {
    icon: "△",
    title: "Clear differences",
    body: "Calculated closing sits right next to counted closing. Ledgr shows any difference clearly at the top.",
  },
  {
    icon: "↯",
    title: "Offline-ready",
    body: "You can log sales and waste without internet. Ledgr saves your entries and uploads them when you connect again.",
  },
  {
    icon: "⊡",
    title: "Easy for counter staff",
    body: "Staff log in with a simple 4 to 6 digit PIN. Big buttons make it fast to record a sale. Staff do not need an email.",
  },
];

export function WhyItWorks() {
  return (
    <section className="border-y border-border bg-surface overflow-hidden">
      <div className="mx-auto max-w-6xl px-5 py-14 sm:px-10 sm:py-24">
        <ScrollReveal>
          <h2 className="max-w-xl font-heading text-2xl font-bold leading-tight tracking-tight text-text-primary sm:text-4xl">
            Built for how small shops actually work.
          </h2>
          <p className="mt-2.5 max-w-xl text-sm sm:text-base text-text-muted font-normal">
            Four reasons to use Ledgr instead of paper, spreadsheets, or complex systems.
          </p>
        </ScrollReveal>
        <ul className="mt-8 grid grid-cols-1 divide-y divide-border border-y border-border sm:grid-cols-2 sm:mt-12 md:grid-cols-4 md:divide-x md:divide-y-0">
          {WHY_ITEMS.map((item, idx) => (
            <li key={item.title}>
              <ScrollReveal delay={idx * 60} className="px-1 py-6 sm:px-6 md:px-8 md:py-10">
                <span
                  aria-hidden="true"
                  className="inline-flex size-9 items-center justify-center rounded-xl border border-border bg-background text-base leading-none text-brand shadow-xs"
                >
                  {item.icon}
                </span>
                <h3 className="mt-3.5 font-heading text-lg sm:text-xl font-semibold text-text-primary">
                  {item.title}
                </h3>
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
