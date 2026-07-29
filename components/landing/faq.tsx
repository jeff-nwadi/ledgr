const FAQ_ITEMS = [
  {
    q: "What happens if the internet drops mid-shift?",
    a: "Sales and waste go into a local queue on the device. When the connection comes back, the queue syncs to your account. You can close the day offline and reconcile when you're back online — the variance math works the same either way.",
  },
  {
    q: "Do my staff need an email account to log in?",
    a: "No. Staff use a 4–6 digit PIN scoped to your business. The owner has the email/password login; everyone else gets a PIN you set for them.",
  },
  {
    q: "Where is my data stored, and who can see it?",
    a: "All data is stored on your account, scoped to your business, in Postgres on Neon. Other businesses on Ledgr cannot see your data. Owner accounts see everything; staff accounts see only what they need to log a sale and close their shift.",
  },
  {
    q: "What about the paper records I already have?",
    a: "Onboarding starts with your current stock. Type the product names, the selling and cost prices, and your opening count for the day. The paper goes in a drawer. From the next entry on, Ledgr carries the running count forward.",
  },
  {
    q: "How much does it cost?",
    a: "Free for the first shop during the MVP. After that, a flat per-business monthly fee, no per-transaction charges, no surprise tiers. We'll publish pricing before the MVP ends and give you 30 days' notice.",
  },
  {
    q: "Does it integrate with my accountant or Xero?",
    a: "Not directly. Ledgr exports a plain CSV you can hand to whoever does your books. Generic format — date, product, quantity sold, revenue, cost, profit. No Xero-specific import, no API connection.",
  },
];

export function FAQ() {
  return (
    <section id="faq" className="bg-background overflow-hidden">
      <div className="mx-auto max-w-6xl px-5 py-14 sm:px-10 sm:py-28">
        <div className="grid gap-8 md:grid-cols-[5fr_8fr] md:gap-20">
          <div>
            <h2 className="font-heading text-3xl font-bold leading-none tracking-tight text-text-primary sm:text-6xl">
              FAQs
            </h2>
            <p className="mt-2.5 text-xs sm:text-base text-text-muted">Six answers, no fine print.</p>
          </div>

          <div className="divide-y divide-border border-y border-border">
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
                    className="size-4 shrink-0 text-text-muted transition-transform duration-200 ease-out group-open:rotate-180 group-hover:text-brand"
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
                <div className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-300 ease-out group-open:grid-rows-[1fr]">
                  <div className="overflow-hidden">
                    <p className="pb-4 sm:pb-5 pr-4 text-xs sm:text-[15px] leading-relaxed text-text-muted opacity-0 translate-y-1 transition-[opacity,transform] duration-200 ease-out group-open:opacity-100 group-open:translate-y-0">
                      {item.a}
                    </p>
                  </div>
                </div>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
