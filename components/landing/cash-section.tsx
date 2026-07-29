import { Card, SampleDataTag } from "@/components/card";

export function CashSection() {
  return (
    <section className="border-t border-border bg-surface overflow-hidden">
      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-10 sm:py-28">
        <div className="grid gap-8 md:grid-cols-2 md:items-center md:gap-16">
          {/* Text — Always First on Mobile */}
          <div className="order-1">
            <p className="text-[11px] sm:text-[12px] font-bold uppercase tracking-wider text-brand">
              Cash reconciliation
            </p>
            <h2 className="mt-2 font-heading text-2xl font-bold leading-tight tracking-tight text-text-primary sm:text-4xl">
              Cash that closes without an argument.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-text-muted sm:text-lg sm:mt-5">
              Open the shift with a float. Ledgr auto-calculates expected
              cash from every cash sale logged during the day. At close, type
              the counted cash. The variance tells you what really
              happened — you don&apos;t have to remember.
            </p>
          </div>

          {/* Card — Always Second on Mobile */}
          <div className="order-2 w-full">
            <Card
              ariaLabel="Cash reconciliation sample data"
              className="overflow-hidden"
            >
              <div className="grid grid-cols-2">
                <div className="border-r border-border p-4 sm:p-5">
                  <p className="text-[10px] sm:text-[12px] font-bold uppercase tracking-wider text-text-muted">
                    Expected
                  </p>
                  <p className="mt-1.5 font-heading text-xl sm:text-3xl font-bold leading-none tabular-nums text-text-primary">
                    ₦48,200
                  </p>
                  <p className="mt-1.5 text-[10px] sm:text-[12px] text-text-muted">
                    Float ₦10k + sales ₦38.2k
                  </p>
                </div>
                <div className="p-4 sm:p-5">
                  <p className="text-[10px] sm:text-[12px] font-bold uppercase tracking-wider text-text-muted">
                    Counted
                  </p>
                  <p className="mt-1.5 font-heading text-xl sm:text-3xl font-bold leading-none tabular-nums text-text-primary">
                    ₦47,000
                  </p>
                  <p className="mt-1.5 text-[10px] sm:text-[12px] text-text-muted">
                    Entered at close
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between gap-3 border-t border-border bg-[color-mix(in_srgb,var(--danger)_10%,transparent)] px-4 py-2.5 sm:px-5 sm:py-3">
                <p className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-danger">
                  <span aria-hidden="true">⚠</span>
                  Variance −₦1,200
                </p>
                <span className="text-[11px] sm:text-[12px] font-semibold text-text-muted">Short</span>
              </div>
              <SampleDataTag className="px-4 pb-3 pt-2 sm:px-5 sm:pb-4" />
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
