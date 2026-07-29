import { ButtonLink } from "@/components/button";

export function ClosingCTA() {
  return (
    <section style={{ background: "#000000" }} className="overflow-hidden border-t border-white/10">
      <div className="mx-auto flex max-w-3xl flex-col items-center px-5 py-16 text-center sm:px-10 sm:py-32">
        <h2 className="font-heading text-2xl leading-tight font-bold tracking-tight text-white sm:text-5xl">
          Close out the day the way you should have years ago.
        </h2>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-white/70 sm:mt-6 sm:text-xl">
          Set up your business in five minutes. Hand a PIN to your staff. The
          next closing is the first one that doesn&apos;t leave you guessing.
        </p>
        <div className="mt-8 w-full sm:w-auto">
          <ButtonLink
            href="/signup"
            size="md"
            style={{ background: "white", color: "#000000" }}
            className="w-full sm:w-auto justify-center text-sm font-bold shadow-lg hover:opacity-90 active:scale-98 transition-all inline-flex items-center"
          >
            Start free →
          </ButtonLink>
        </div>
        <p className="mt-4 text-xs text-white/50 sm:text-sm sm:mt-5">
          No card required. Works on any modern phone. Free during the MVP.
        </p>
      </div>
    </section>
  );
}
