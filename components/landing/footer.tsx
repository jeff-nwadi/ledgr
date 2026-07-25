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
    <footer style={{ background: "#0d1f18" }}>
      <div className="mx-auto max-w-6xl px-6 py-14 sm:px-10">
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-1">
            <p className="font-heading text-xl tracking-tight text-white">
              Ledgr
            </p>
            <p className="mt-2 max-w-[20ch] text-sm leading-relaxed text-white/50">
              Built for the counter, not the back office.
            </p>
          </div>
          {cols.map((col) => (
            <div key={col.heading}>
              <p className="text-[12px] font-semibold uppercase tracking-wider text-white/40">
                {col.heading}
              </p>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      className="text-sm text-white/60 transition-colors hover:text-white"
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-8 text-sm text-white/30 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Ledgr</p>
          <p>Built for the counter.</p>
        </div>
      </div>
    </footer>
  );
}
