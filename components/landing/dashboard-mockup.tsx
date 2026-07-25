import { SampleDataTag } from "@/components/card";

export function DashboardMockup() {
  return (
    <section className="bg-surface">
      <div className="mx-auto max-w-6xl px-6 py-20 sm:px-10 sm:py-28">
        {/* Centered heading */}
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-heading text-3xl leading-tight tracking-tight text-text-primary sm:text-5xl">
            See the whole day. On one screen.
          </h2>
          <p className="mt-4 text-lg text-text-muted">
            Owner dashboard — revenue, profit, variances, and recent activity
            at a glance.
          </p>
        </div>

        {/* Coded UI mockup */}
        <div
          aria-label="Owner dashboard — sample data"
          className={
            "mx-auto mt-12 max-w-5xl overflow-hidden rounded-2xl border border-border bg-background " +
            "shadow-[0_0_0_1px_rgba(0,0,0,0.04),0_4px_8px_rgba(0,0,0,0.04),0_24px_64px_rgba(0,0,0,0.10)] " +
            "dark:shadow-[0_0_0_1px_rgba(255,255,255,0.07),0_24px_64px_rgba(0,0,0,0.5)]"
          }
        >
          {/* Window chrome */}
          <div className="flex items-center gap-2 border-b border-border bg-surface px-4 py-3">
            <span
              aria-hidden="true"
              className="size-2.5 rounded-full bg-danger/50"
            />
            <span
              aria-hidden="true"
              className="size-2.5 rounded-full bg-[color-mix(in_srgb,var(--brand)_40%,#f5a623)] opacity-70"
            />
            <span
              aria-hidden="true"
              className="size-2.5 rounded-full bg-success/50"
            />
            <span className="ml-3 text-[12px] font-medium text-text-muted">
              Ledgr — Owner Dashboard
            </span>
          </div>

          <div className="flex">
            {/* Sidebar */}
            <nav
              aria-label="Dashboard sidebar"
              className="hidden w-44 shrink-0 border-r border-border bg-surface sm:block"
            >
              <div className="p-4 pb-2">
                <p className="font-heading text-sm font-semibold text-text-primary">
                  Ledgr
                </p>
              </div>
              <ul className="space-y-0.5 px-2 pb-4">
                {[
                  { icon: "⌂", label: "Home", active: true },
                  { icon: "⊡", label: "Products", active: false },
                  { icon: "◉", label: "Staff", active: false },
                  { icon: "▤", label: "Reports", active: false },
                ].map((item) => (
                  <li key={item.label}>
                    <div
                      className={
                        "flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium " +
                        (item.active
                          ? "bg-[color-mix(in_srgb,var(--brand)_12%,transparent)] text-brand"
                          : "text-text-muted")
                      }
                    >
                      <span aria-hidden="true" className="text-[15px] leading-none">
                        {item.icon}
                      </span>
                      {item.label}
                    </div>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Main panel */}
            <div className="flex-1 overflow-hidden p-5 sm:p-6">
              {/* Header */}
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h3 className="font-heading text-base text-text-primary">
                    Daily Summary
                  </h3>
                  <p className="text-[12px] text-text-muted">Tue 24 Jun 2026</p>
                </div>
                <span className="rounded-full border border-border bg-surface px-3 py-1 text-[12px] font-medium text-text-muted">
                  Closed ✓
                </span>
              </div>

              {/* Stat cards */}
              <dl className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
                {[
                  {
                    label: "Revenue",
                    value: "₦68,400",
                    sub: "from 47 sales",
                    danger: false,
                  },
                  {
                    label: "Gross Profit",
                    value: "₦19,200",
                    sub: "28% margin",
                    danger: false,
                  },
                  {
                    label: "Cash Variance",
                    value: "−₦1,200",
                    sub: "short · ₦47k counted",
                    danger: true,
                  },
                  {
                    label: "Stock Variance",
                    value: "−₦800",
                    sub: "coffee beans 0.3 kg",
                    danger: true,
                  },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-xl border border-border bg-surface p-3.5"
                  >
                    <dt className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                      {stat.label}
                    </dt>
                    <dd
                      className={
                        "mt-1.5 font-heading text-xl tabular-nums leading-none " +
                        (stat.danger ? "text-danger" : "text-text-primary")
                      }
                    >
                      {stat.value}
                    </dd>
                    <p className="mt-1 text-[11px] text-text-muted">
                      {stat.sub}
                    </p>
                  </div>
                ))}
              </dl>

              {/* Recent activity */}
              <div>
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                  Recent activity
                </p>
                <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border">
                  {[
                    {
                      dot: "bg-success",
                      text: "Adaeze closed shift",
                      detail: "Cash counted: ₦47,000",
                      time: "7:42 pm",
                    },
                    {
                      dot: "bg-brand",
                      text: "3 sales logged",
                      detail: "₦8,200 · cash + card",
                      time: "4:15 pm",
                    },
                    {
                      dot: "bg-danger",
                      text: "Coffee beans: variance flagged",
                      detail: "3.7 kg counted vs 4.0 kg",
                      time: "7:42 pm",
                    },
                  ].map((a) => (
                    <li
                      key={a.text}
                      className="flex items-center gap-3 px-4 py-2.5"
                    >
                      <span
                        aria-hidden="true"
                        className={`size-1.5 shrink-0 rounded-full ${a.dot}`}
                      />
                      <span className="min-w-0 flex-1 text-[13px] text-text-primary">
                        {a.text}
                      </span>
                      <span className="hidden shrink-0 text-[12px] text-text-muted sm:block">
                        {a.detail}
                      </span>
                      <span className="shrink-0 text-[11px] tabular-nums text-text-muted">
                        {a.time}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Footer strip */}
          <div className="border-t border-border bg-surface px-6 py-2.5">
            <SampleDataTag />
          </div>
        </div>
      </div>
    </section>
  );
}
