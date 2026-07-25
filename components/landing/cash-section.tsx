import { Card, SampleDataTag } from "@/components/card";

export function CashSection() {
  return (
    <section className="border-t border-border bg-surface">
      <div className="mx-auto max-w-6xl px-6 py-20 sm:px-10 sm:py-28">
        <div className="grid gap-12 md:grid-cols-2 md:items-center md:gap-16">
          {/* Card — left */}
          <Card
            ariaLabel="Cash reconciliation — sample data"
            className="overflow-hidden"
          >
            <div className="grid grid-cols-2">
              <div className="border-r border-border p-5">
                <p className="text-[12px] font-semibold uppercase tracking-wider text-text-muted">
                  Expected
                </p>
                <p className="mt-2 font-heading text-3xl leading-none tabular-nums text-text-primary">
                  ₦48,200
                </p>
                <p className="mt-2 text-[12px] text-text-muted">
                  Float ₦10,000 + cash sales ₦38,200
                </p>
              </div>
              <div className="p-5">
                <p className="text-[12px] font-semibold uppercase tracking-wider text-text-muted">
                  Counted
                </p>
                <p className="mt-2 font-heading text-3xl leading-none tabular-nums text-text-primary">
                  ₦47,000
                </p>
                <p className="mt-2 text-[12px] text-text-muted">
                  Entered by Adaeze at close
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between gap-3 border-t border-border bg-[color-mix(in_srgb,var(--danger)_10%,transparent)] px-5 py-3">
              <p className="inline-flex items-center gap-2 text-sm font-semibold text-danger">
                <span aria-hidden="true">⚠</span>
                Variance −₦1,200
              </p>
              <span className="text-[12px] text-text-muted">Short</span>
            </div>
            <SampleDataTag className="px-5 pb-4 pt-2" />
          </Card>

          {/* Text — right */}
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-wider text-brand">
              Cash reconciliation
            </p>
            <h2 className="mt-3 font-heading text-3xl leading-tight tracking-tight text-text-primary sm:text-4xl">
              Cash that closes without an argument.
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-text-muted">
              Open the shift with a float. Ledgr auto-calculates expected
              cash from every cash sale logged during the day. At close, type
              the counted cash. The variance tells you what really
              happened — you don&apos;t have to remember.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
