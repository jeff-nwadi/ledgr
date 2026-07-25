import Link from "next/link";
import { ButtonLink } from "@/components/button";
import { ThemeToggle } from "@/components/theme-toggle";

export function Navbar() {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur supports-backdrop-filter:bg-background/70">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4 sm:px-10">
        <Link
          href="/"
          className="font-heading text-xl tracking-tight text-text-primary"
        >
          Ledgr
        </Link>
        <nav aria-label="Primary" className="hidden items-center gap-7 md:flex">
          <a
            href="#features"
            className="text-sm font-medium text-text-muted transition-colors hover:text-text-primary"
          >
            Features
          </a>
          <a
            href="#faq"
            className="text-sm font-medium text-text-muted transition-colors hover:text-text-primary"
          >
            FAQ
          </a>
        </nav>
        <div className="flex items-center gap-1.5 sm:gap-3">
          <ThemeToggle />
          <ButtonLink
            href="/signin"
            variant="ghost"
            size="md"
            className="hidden sm:inline-flex"
          >
            Sign in
          </ButtonLink>
          <ButtonLink href="/signup" size="md" className="px-4 sm:px-5">
            Get started
          </ButtonLink>
        </div>
      </div>
    </header>
  );
}
