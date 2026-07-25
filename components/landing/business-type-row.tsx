const BUSINESS_TYPES = [
  { glyph: "🥐", label: "Bakeries" },
  { glyph: "🍽", label: "Restaurants" },
  { glyph: "🛒", label: "Small shops" },
  { glyph: "🏪", label: "Kiosks" },
  { glyph: "🚐", label: "Food trucks" },
];

export function BusinessTypeRow() {
  return (
    <section className="border-y border-border bg-surface">
      <div className="mx-auto max-w-6xl px-6 py-10 sm:px-10 sm:py-12">
        <p className="text-center text-[12px] font-semibold uppercase tracking-wider text-text-muted">
          Built for businesses like these
        </p>
        <ul className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          {BUSINESS_TYPES.map((bt) => (
            <li
              key={bt.label}
              className="flex items-center gap-2.5 rounded-full border border-border bg-background px-4 py-2 text-[14px] font-medium text-text-muted"
            >
              <span aria-hidden="true" className="text-base leading-none">
                {bt.glyph}
              </span>
              {bt.label}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
