import { Card, SampleDataTag } from "@/components/card";

const CUSTOMERS = [
  { name: "Adaeze Okafor", balance: 0, status: "Paid in full" },
  { name: "Chinedu Motors", balance: 12_400, status: "Owing" },
  { name: "Mama Tobi Bakery", balance: 3_750, status: "Owing" },
];

export function DebtSection() {
  return (
    <section className="bg-background">
      <div className="mx-auto max-w-6xl px-6 py-20 sm:px-10 sm:py-28">
        <div className="grid gap-12 md:grid-cols-2 md:items-center md:gap-16">
          {/* Text — left */}
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-wider text-brand">
              Customer debt
            </p>
            <h2 className="mt-3 font-heading text-3xl leading-tight tracking-tight text-text-primary sm:text-4xl">
              Credit sales, tracked without a paper notebook.
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-text-muted">
              Mark a sale as credit, attach a customer, watch the running
              balance. Repayments reduce the balance. The history is the
              audit trail — no separate notebook, no lost records.
            </p>
          </div>

          {/* Card — right */}
          <Card
            ariaLabel="Customer balances — sample data"
            className="p-5 sm:p-6"
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-heading text-base leading-snug text-text-primary">
                Customer balances
              </h3>
              <span className="text-[12px] text-text-muted">3 active</span>
            </div>
            <ul className="divide-y divide-border">
              {CUSTOMERS.map((c) => {
                const owing = c.balance > 0;
                return (
                  <li
                    key={c.name}
                    className="flex items-center justify-between gap-4 py-3.5"
                  >
                    <div>
                      <p className="font-medium text-text-primary">{c.name}</p>
                      <p className="text-[12px] text-text-muted">{c.status}</p>
                    </div>
                    <p
                      className={
                        "font-heading text-lg tabular-nums " +
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
        </div>
      </div>
    </section>
  );
}
