import { Card, SampleDataTag } from "@/components/card";
import { ScrollReveal } from "@/components/landing/scroll-reveal";

const CUSTOMERS = [
  { name: "Adaeze Okafor", balance: 0, status: "Paid in full" },
  { name: "Chinedu Motors", balance: 12_400, status: "Owing" },
  { name: "Mama Tobi Bakery", balance: 3_750, status: "Owing" },
];

export function DebtSection() {
  return (
    <section className="bg-background overflow-hidden">
      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-10 sm:py-28">
        <div className="grid gap-8 md:grid-cols-2 md:items-center md:gap-16">
          {/* Text — Always First on Mobile */}
          <ScrollReveal className="order-1">
            <p className="text-[11px] sm:text-[12px] font-semibold uppercase tracking-wider text-brand">
              Customer debt
            </p>
            <h2 className="mt-2 font-heading text-2xl font-bold leading-tight tracking-tight text-text-primary sm:text-4xl">
              Credit sales, tracked without a paper notebook.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-text-muted sm:text-lg sm:mt-5 font-normal">
              Mark a sale as credit, attach a customer, watch the running
              balance. Repayments reduce the balance. The history is the
              audit trail — no separate notebook, no lost records.
            </p>
          </ScrollReveal>

          {/* Card — Always Second on Mobile */}
          <ScrollReveal delay={120} className="order-2 w-full">
            <Card
              ariaLabel="Customer balances — sample data"
              className="p-4 sm:p-6"
            >
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-heading text-sm sm:text-base font-semibold leading-snug text-text-primary">
                  Customer balances
                </h3>
                <span className="text-[11px] text-text-muted font-normal">3 active</span>
              </div>
              <ul className="divide-y divide-border">
                {CUSTOMERS.map((c) => {
                  const owing = c.balance > 0;
                  return (
                    <li
                      key={c.name}
                      className="flex items-center justify-between gap-4 py-3 sm:py-3.5"
                    >
                      <div>
                        <p className="text-xs sm:text-sm font-medium text-text-primary">{c.name}</p>
                        <p className="text-[11px] text-text-muted font-normal">{c.status}</p>
                      </div>
                      <p
                        className={
                          "font-heading text-base sm:text-lg font-bold tabular-nums " +
                          (owing ? "text-danger" : "text-text-muted")
                        }
                      >
                        {owing ? `₦${c.balance.toLocaleString()}` : "₦0"}
                      </p>
                    </li>
                  );
                })}
              </ul>
              <SampleDataTag className="mt-3" />
            </Card>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
