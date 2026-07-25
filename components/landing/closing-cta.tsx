import { ButtonLink } from "@/components/button";

export function ClosingCTA() {
  return (
    <section style={{ background: "#0d1f18" }}>
      <div className="mx-auto flex max-w-3xl flex-col items-center px-6 py-24 text-center sm:px-10 sm:py-32">
        <h2 className="font-heading text-3xl leading-tight tracking-tight text-white sm:text-5xl">
          Close out the day the way you should have years ago.
        </h2>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/70 sm:text-xl">
          Set up your business in five minutes. Hand a PIN to your staff. The
          next closing is the first one that doesn&apos;t leave you guessing.
        </p>
        <div className="mt-10">
          <ButtonLink
            href="/signup"
            size="lg"
            style={{ background: "white", color: "#0d1f18" }}
            className="hover:opacity-90"
          >
            Start free →
          </ButtonLink>
        </div>
        <p className="mt-5 text-sm text-white/50">
          No card required. Works on any modern phone. Free during the MVP.
        </p>
      </div>
    </section>
  );
}
