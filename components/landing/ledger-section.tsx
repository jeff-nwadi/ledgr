import { Card, SampleDataTag } from "@/components/card";
import { ScrollReveal } from "@/components/landing/scroll-reveal";

type StockRow = {
  name: string;
  monClosing: number;
  tueOpening: number;
  tueAdded: number;
  tueSold: number;
  tueWaste: number;
  tueCalc: number;
  tueCounted: number;
};

const LEDGER_ROWS: StockRow[] = [
  {
    name: "Sourdough loaves",
    monClosing: 18,
    tueOpening: 18,
    tueAdded: 6,
    tueSold: 18,
    tueWaste: 0,
    tueCalc: 6,
    tueCounted: 6,
  },
  {
    name: "Baguettes",
    monClosing: 40,
    tueOpening: 40,
    tueAdded: 0,
    tueSold: 32,
    tueWaste: 1,
    tueCalc: 7,
    tueCounted: 7,
  },
  {
    name: "Chocolate croissant",
    monClosing: 18,
    tueOpening: 18,
    tueAdded: 12,
    tueSold: 22,
    tueWaste: 0,
    tueCalc: 8,
    tueCounted: 8,
  },
  {
    name: "Coffee beans (kg)",
    monClosing: 6.0,
    tueOpening: 6.0,
    tueAdded: 0.5,
    tueSold: 2.5,
    tueWaste: 0,
    tueCalc: 4.0,
    tueCounted: 3.7,
  },
];

function formatQty(n: number): string {
  return Number.isInteger(n) ? n.toString() : n.toFixed(1);
}

export function LedgerSection() {
  return (
    <section className="bg-background overflow-hidden">
      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-10 sm:py-28">
        <div className="grid gap-8 md:grid-cols-2 md:items-start md:gap-16">
          {/* Text — Always First on Mobile */}
          <ScrollReveal className="order-1 md:pt-2">
            <p className="text-[11px] sm:text-[12px] font-semibold uppercase tracking-wider text-brand">
              Daily stock ledger
            </p>
            <h2 className="mt-2 font-heading text-2xl font-bold leading-tight tracking-tight text-text-primary sm:text-4xl">
              A daily ledger that actually closes.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-text-muted sm:text-lg sm:mt-5 font-normal">
              Every product gets a row: opening, added, sold, waste,
              calculated closing. The counted number sits next to it. The
              variance is the headline, not the footnote.
            </p>
            <p className="mt-3 text-xs leading-relaxed text-text-muted sm:text-[15px] font-normal">
              Mon closing becomes Tue opening automatically filled from the
              previous day&apos;s counted closing, not the calculated one. No
              manual carry-forward.
            </p>
          </ScrollReveal>

          {/* Table Card — Always Second on Mobile */}
          <ScrollReveal delay={120} className="order-2 w-full overflow-hidden">
            <Card
              ariaLabel="Two-day stock ledger with carry-forward — sample data"
              className="p-4 sm:p-6"
            >
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-heading text-sm sm:text-base font-semibold leading-snug text-text-primary">
                  Stock — Mon 23 → Tue 24 Jun
                </h3>
                <span className="text-[11px] text-text-muted font-normal">4 products</span>
              </div>
              <div className="overflow-x-auto rounded-xl border border-border no-scrollbar">
                <table className="w-full min-w-[540px] text-xs sm:text-sm tabular-nums">
                  <thead>
                    <tr className="bg-[color-mix(in_srgb,var(--surface)_50%,var(--text-primary)_5%)] text-left text-[10px] sm:text-[11px] uppercase tracking-wider text-text-muted">
                      <th className="px-2.5 py-2 font-medium">Product</th>
                      <th className="px-2 py-2 text-right font-medium">
                        Mon ↓
                      </th>
                      <th className="border-l-2 border-brand bg-[color-mix(in_srgb,var(--brand)_8%,transparent)] px-2 py-2 text-right font-semibold text-brand">
                        Tue open
                      </th>
                      <th className="px-2 py-2 text-right font-medium">
                        Added
                      </th>
                      <th className="px-2 py-2 text-right font-medium">
                        Sold
                      </th>
                      <th className="px-2 py-2 text-right font-medium">
                        Waste
                      </th>
                      <th className="px-2 py-2 text-right font-medium">
                        Calc
                      </th>
                      <th className="px-2.5 py-2 text-right font-medium">
                        Counted
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {LEDGER_ROWS.map((r) => {
                      const isVar = r.tueCounted !== r.tueCalc;
                      return (
                        <tr
                          key={r.name}
                          className={
                            "border-t border-border " +
                            (isVar
                              ? "bg-[color-mix(in_srgb,var(--danger)_8%,transparent)]"
                              : "")
                          }
                        >
                          <td className="px-2.5 py-2 font-medium text-text-primary truncate max-w-[120px]">
                            {r.name}
                          </td>
                          <td className="px-2 py-2 text-right text-text-muted font-normal">
                            {formatQty(r.monClosing)}
                          </td>
                          <td className="border-l-2 border-brand bg-[color-mix(in_srgb,var(--brand)_8%,transparent)] px-2 py-2 text-right font-semibold text-brand">
                            {formatQty(r.tueOpening)}
                          </td>
                          <td className="px-2 py-2 text-right text-text-muted font-normal">
                            {formatQty(r.tueAdded)}
                          </td>
                          <td className="px-2 py-2 text-right text-text-muted font-normal">
                            {formatQty(r.tueSold)}
                          </td>
                          <td className="px-2 py-2 text-right text-text-muted font-normal">
                            {formatQty(r.tueWaste)}
                          </td>
                          <td className="px-2 py-2 text-right font-semibold text-text-primary">
                            {formatQty(r.tueCalc)}
                          </td>
                          <td
                            className={
                              "px-2.5 py-2 text-right font-semibold " +
                              (isVar ? "text-danger" : "text-text-primary")
                            }
                          >
                            {formatQty(r.tueCounted)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <SampleDataTag className="mt-3" />
            </Card>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
