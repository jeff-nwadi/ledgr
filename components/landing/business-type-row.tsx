const BUSINESS_TYPES = [
  { glyph: "🥐", label: "Bakeries" },
  { glyph: "🍽", label: "Restaurants" },
  { glyph: "🛒", label: "Small shops" },
  { glyph: "🏪", label: "Kiosks" },
  { glyph: "🚐", label: "Food trucks" },
];

export function BusinessTypeRow() {
  return (
    <section className="border-y border-border bg-surface overflow-hidden">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-10 sm:py-12">
        <p className="text-center text-[11px] sm:text-[12px] font-semibold uppercase tracking-wider text-text-muted">
          Built for businesses like these
        </p>
        <div className="mt-5 overflow-x-auto pb-2 pt-1 no-scrollbar sm:overflow-visible">
          <ul className="flex items-center gap-2.5 px-2 min-w-max sm:min-w-0 sm:flex-wrap sm:justify-center sm:px-0">
            {BUSINESS_TYPES.map((bt) => (
              <li
                key={bt.label}
                className="flex shrink-0 items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-xs sm:text-sm font-medium text-text-muted transition-colors hover:text-text-primary hover:border-brand/40 select-none min-h-[40px]"
              >
                <span aria-hidden="true" className="text-base leading-none">
                  {bt.glyph}
                </span>
                {bt.label}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
