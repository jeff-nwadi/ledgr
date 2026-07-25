import { ButtonLink } from "@/components/button";
import { SampleDataTag } from "@/components/card";

export function Hero() {
  return (
    <section className="bg-background">
      <div className="mx-auto grid max-w-6xl gap-12 px-6 pt-20 pb-28 sm:px-10 sm:pt-24 sm:pb-36 md:grid-cols-2 md:items-center md:gap-20">
        {/* Left: headline + CTAs */}
        <div>
          <p className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-[13px] font-medium text-text-muted">
            <span
              aria-hidden="true"
              className="inline-block size-1.5 rounded-full bg-brand"
            />
            Built for bakeries, restaurants, small shops
          </p>
          <h1 className="font-heading text-[40px] leading-[1.05] tracking-tight font-bold text-text-primary sm:text-6xl">
            The end-of-day ritual,{" "}
            finally automated.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-text-muted sm:text-xl">
            Ledgr tracks opening + added − sold = closing automatically, adds a
            waste category, and when the counted closing doesn&apos;t match,
            surfaces the variance instead of hiding it. Same pattern for the cash
            drawer.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
            <ButtonLink href="/signup" size="lg" className="w-full sm:w-auto">
              Start free
            </ButtonLink>
            <ButtonLink
              href="/signin?type=pin"
              variant="secondary"
              size="lg"
              className="w-full sm:w-auto"
            >
              Staff PIN login
            </ButtonLink>
          </div>
          <p className="mt-5 text-sm text-text-muted">
            Free during the MVP. No card required.
          </p>
        </div>

        {/* Right: end-of-day teaser card — elevated floating treatment */}
        <div className="flex justify-center md:justify-end">
          <div
            aria-label="End-of-day summary — sample data"
            className={
              "w-full max-w-sm rounded-2xl border border-border bg-surface p-5 " +
              "shadow-[0_0_0_1px_rgba(0,0,0,0.04),0_4px_8px_rgba(0,0,0,0.06),0_20px_48px_rgba(0,0,0,0.14)] " +
              "dark:shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_20px_48px_rgba(0,0,0,0.5)]"
            }
          >
            {/* Card header */}
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                  End of day
                </p>
                <p className="mt-0.5 font-heading text-base text-text-primary">
                  Tue 24 Jun
                </p>
              </div>
              <span className="rounded-full border border-border bg-background px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                Closed
              </span>
            </div>

            {/* Line items */}
            <ul className="space-y-2 border-t border-border pt-4">
              {[
                { name: "Sourdough loaves", qty: "18 sold" },
                { name: "Baguettes", qty: "32 sold" },
                { name: "Chocolate croissant", qty: "22 sold" },
              ].map((item) => (
                <li
                  key={item.name}
                  className="flex items-center justify-between gap-4"
                >
                  <span className="text-[14px] text-text-muted">
                    {item.name}
                  </span>
                  <span className="text-[14px] tabular-nums text-text-primary">
                    {item.qty}
                  </span>
                </li>
              ))}
            </ul>

            {/* Total */}
            <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
              <span className="text-[12px] font-semibold uppercase tracking-wider text-text-muted">
                Total revenue
              </span>
              <span className="font-heading text-2xl tabular-nums text-text-primary">
                ₦68,400
              </span>
            </div>

            {/* Status stamps */}
            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="rounded-xl border border-[color-mix(in_srgb,var(--success)_30%,transparent)] bg-[color-mix(in_srgb,var(--success)_10%,transparent)] p-3">
                <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-success">
                  <span aria-hidden="true">✓</span> Matched
                </p>
                <p className="mt-0.5 text-[11px] text-text-muted">
                  Stock confirmed
                </p>
              </div>
              <div className="rounded-xl border border-[color-mix(in_srgb,var(--danger)_30%,transparent)] bg-[color-mix(in_srgb,var(--danger)_10%,transparent)] p-3">
                <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-danger">
                  <span aria-hidden="true">⚠</span> Variance
                </p>
                <p className="mt-0.5 text-[11px] tabular-nums text-text-muted">
                  −₦1,200 · Cash short
                </p>
              </div>
            </div>
            <SampleDataTag className="mt-3" />
          </div>
        </div>
      </div>
    </section>
  );
}
