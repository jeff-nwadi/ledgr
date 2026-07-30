import { ScrollReveal } from "@/components/landing/scroll-reveal";

export function TheGap() {
  return (
    <section className="bg-background overflow-hidden">
      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-10 sm:py-28">
        <ScrollReveal className="mx-auto max-w-xl text-center">
          <p className="mb-4 text-[11px] sm:text-[12px] font-semibold uppercase tracking-wider text-text-muted">
            The problem
          </p>
          <h2 className="font-heading text-2xl leading-tight font-bold tracking-tight text-text-primary sm:text-4xl">
            Paper is fast. Spreadsheets are flexible.{" "}
            <span className="text-text-muted block sm:inline">Neither helps you close your day.</span>
          </h2>
          <p className="mt-6 text-base leading-relaxed text-text-muted sm:mt-8 font-normal">
            Many shop owners use paper, calculators, or spreadsheets. None of these tools show you where missing stock or cash went. At the end of the day, you still guess if money was lost or miscounted. Ledgr works as fast as paper, but it shows you right away when your numbers do not match.
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}
