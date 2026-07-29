export function Footer() {
  const cols: Array<{
    heading: string;
    links: Array<{ label: string; href: string }>;
  }> = [
    {
      heading: "Product",
      links: [
        { label: "Features", href: "#features" },
        { label: "Pricing", href: "#" },
        { label: "Changelog", href: "#" },
        { label: "Roadmap", href: "#" },
      ],
    },
    {
      heading: "Resources",
      links: [
        { label: "Get started", href: "/signup" },
        { label: "CSV export format", href: "#" },
        { label: "Help center", href: "#" },
        { label: "Status", href: "#" },
      ],
    },
    {
      heading: "Company",
      links: [
        { label: "About", href: "#" },
        { label: "Contact", href: "#" },
        { label: "Privacy", href: "#" },
        { label: "Terms", href: "#" },
      ],
    },
  ];

  return (
    <footer style={{ background: "#000000" }} className="overflow-hidden border-t border-white/10">
      <div className="mx-auto max-w-6xl px-5 py-12 sm:px-10 sm:py-16">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-4 sm:gap-10">
          {/* Brand Block */}
          <div className="col-span-1">
            <p className="font-heading text-xl font-bold tracking-tight text-white">
              Ledgr
            </p>
            <p className="mt-2 max-w-[24ch] text-xs sm:text-sm leading-relaxed text-white/50">
              Built for the counter, not the back office.
            </p>
          </div>

          {/* Link Columns */}
          {cols.map((col) => (
            <div key={col.heading} className="space-y-3">
              <p className="text-[11px] sm:text-[12px] font-bold uppercase tracking-wider text-white/40">
                {col.heading}
              </p>
              <ul className="space-y-1">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      className="inline-flex items-center min-h-[36px] py-1 text-xs sm:text-sm text-white/60 transition-colors hover:text-white"
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-white/10 pt-6 text-xs sm:text-sm text-white/30 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Ledgr</p>
          <p>Built for the counter.</p>
        </div>
      </div>
    </footer>
  );
}
