import { ScrollReveal } from "@/components/landing/scroll-reveal";

export function TheGap() {
  return (
    <section className="bg-background overflow-hidden">
      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-10 sm:py-28">
        <ScrollReveal className="mx-auto max-w-xl text-center">
          <p className="mb-4 text-[11px] sm:text-[12px] font-semibold uppercase tracking-wider text-text-muted">
            The gap
          </p>
          <h2 className="font-heading text-2xl leading-tight font-bold tracking-tight text-text-primary sm:text-4xl">
            Paper is fast. Spreadsheets are flexible.{" "}
            <span className="text-text-muted block sm:inline">Neither closes the day.</span>
          </h2>
          <p className="mt-6 text-base leading-relaxed text-text-muted sm:mt-8 font-normal">
            Shop owners use paper sheets, a calculator, a spreadsheet, or a POS system but none of these show you where the money or stock went missing. 
            So at the end of the day, you're left guessing whether it was a real loss or just a counting mistake.
            Ledgr shows you the answer right away as easy as paper, but it tells you exactly what doesn't add up.
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}
