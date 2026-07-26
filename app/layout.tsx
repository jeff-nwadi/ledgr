import type { Metadata } from "next";
import localFont from "next/font/local";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";

// Strichpunkt Sans — self-hosted per AGENTS.md §Design System.
// Single variable file (wght axis, Regular → Black) from the official repo.
const strichpunktSans = localFont({
  src: "../public/fonts/strichpunkt-sans/StrichpunktSans-Variable.ttf",
  variable: "--font-strichpunkt",
  display: "swap",
  weight: "300 900",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ledgr — end-of-day sales & stock, without the paper",
  description:
    "Ledgr replaces the manual opening/added/sold/closing paper ledger for bakeries, restaurants, and small shops — and adds cash and stock reconciliation so the variance is visible, not hidden.",
};

// Inline script that runs before first paint to set data-theme without a flash.
// Source of truth: AGENTS.md §Design System — dark mode via data-theme attribute.
const themeScript = `
(function() {
  try {
    var stored = localStorage.getItem('ledgr-theme');
    var theme = stored || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    if (theme === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${strichpunktSans.variable} ${inter.variable}`}
    >
      <head>
        <script suppressHydrationWarning>{themeScript}</script>
      </head>
      <body className="min-h-dvh flex flex-col bg-background text-text-primary">
        {children}
      </body>
    </html>
  );
}
