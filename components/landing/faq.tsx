import { ScrollReveal } from "@/components/landing/scroll-reveal";

const FAQ_ITEMS = [
  {
    q: "What happens if the internet drops mid-shift?",
    a: "Ledgr saves your sales and waste on your phone. When internet connects again, Ledgr uploads your records automatically. You can close your shift offline anytime.",
  },
  {
    q: "Do my staff need an email account to log in?",
    a: "No. Staff log in with a simple 4 to 6 digit PIN for your shop. Only the owner uses an email and password.",
  },
  {
    q: "Where is my data stored, and who can see it?",
    a: "Your data is kept safe in your private business account. Other shops cannot view your information. Owners can view all reports, while staff only see screens needed for their shift.",
  },
  {
    q: "What about the paper records I already have?",
    a: "Enter your current products, prices, and starting stock counts. After that, Ledgr updates your stock automatically every day.",
  },
  {
    q: "How much does it cost?",
    a: "Ledgr is free to use right now. In the future, we will charge a simple monthly fee per business with no hidden costs.",
  },
  {
    q: "Can I share my numbers with my accountant?",
    a: "Yes. You can download a simple spreadsheet file anytime and share it with your accountant.",
  },
];

export function FAQ() {
  return (
    <section id="faq" className="bg-background overflow-hidden">
      <div className="mx-auto max-w-6xl px-5 py-14 sm:px-10 sm:py-28">
        <div className="grid gap-8 md:grid-cols-[5fr_8fr] md:gap-20">
          <ScrollReveal>
            <h2 className="font-heading text-3xl font-bold leading-none tracking-tight text-text-primary sm:text-6xl">
              FAQs
            </h2>
            <p className="mt-2.5 text-xs sm:text-base text-text-muted">Six answers, no fine print.</p>
          </ScrollReveal>

          <ScrollReveal delay={100} className="divide-y divide-border border-y border-border">
            {FAQ_ITEMS.map((item) => (
              <details key={item.q} name="ledgr-faq" className="group">
                <summary
                  className={
                    "flex cursor-pointer list-none items-center justify-between gap-4 " +
                    "py-4 sm:py-5 min-h-[48px] font-semibold text-xs sm:text-base text-text-primary " +
                    "marker:hidden [&::-webkit-details-marker]:hidden " +
                    "transition-colors hover:text-brand " +
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand " +
                    "focus-visible:ring-offset-2 focus-visible:ring-offset-background active:bg-surface/50"
                  }
                >
                  <span className="leading-snug pr-2">{item.q}</span>
                  <svg
                    aria-hidden="true"
                    className="size-4 shrink-0 text-text-muted transition-transform duration-200 ease-out group-open:rotate-180 group-hover:text-brand motion-reduce:transition-none"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </summary>
                <div className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-250 ease-out group-open:grid-rows-[1fr] motion-reduce:transition-none">
                  <div className="overflow-hidden">
                    <p className="pb-4 sm:pb-5 pr-4 text-xs sm:text-[15px] leading-relaxed text-text-muted opacity-0 translate-y-1 transition-[opacity,transform] duration-200 ease-out group-open:opacity-100 group-open:translate-y-0 motion-reduce:transition-none">
                      {item.a}
                    </p>
                  </div>
                </div>
              </details>
            ))}
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
