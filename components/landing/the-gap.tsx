export function TheGap() {
  return (
    <section className="bg-background">
      <div className="mx-auto max-w-6xl px-6 py-24 sm:px-10 sm:py-32">
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-5 text-[12px] font-semibold uppercase tracking-widest text-text-muted">
            The gap
          </p>
          <h2 className="font-heading text-3xl leading-tight tracking-tight text-text-primary sm:text-5xl">
            Paper is fast. Spreadsheets are flexible.{" "}
            <span className="text-text-muted">Neither closes the day.</span>
          </h2>
          <p className="mt-8 text-lg leading-relaxed text-text-muted">
            The tools small shops reach for  a paper stock sheet, a
            calculator for the cash drawer, a bolted-on generic spreadsheet,
            or a POS system that doesn&apos;t quite fit  each solves a slice of
            the problem. None of them surface the variance at the end of the
            day, because none of them were built for it.
          </p>
          <p className="mt-5 text-lg leading-relaxed text-text-muted">
            You end up doing the reconciliation in your head, at 8 pm, after
            a full shift trying to remember whether the shortfall was real
            or a counting mistake.{" "}
            <strong className="font-semibold text-text-primary">
              Ledgr is built for the gap between those paper-fast, but with
              the numbers that matter surfaced at the end of the day.
            </strong>
          </p>
        </div>
      </div>
    </section>
  );
}
