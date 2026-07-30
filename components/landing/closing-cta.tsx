import { ButtonLink } from "@/components/button";
import { ScrollReveal } from "@/components/landing/scroll-reveal";

export function ClosingCTA() {
  return (
    <section style={{ background: "#000000" }} className="overflow-hidden border-t border-white/10">
      <div className="mx-auto flex max-w-3xl flex-col items-center px-5 py-16 text-center sm:px-10 sm:py-32">
        <ScrollReveal>
          <h2 className="font-heading text-2xl leading-tight font-bold tracking-tight text-white sm:text-5xl">
            Close your business day with confidence.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-white/70 sm:mt-6 sm:text-xl">
            Set up your shop in five minutes. Give PINs to your staff. Know your exact stock and cash numbers today.
          </p>
          <div className="mt-8 w-full sm:w-auto">
            <ButtonLink
              href="/signup"
              size="md"
              style={{ background: "white", color: "#000000" }}
              className="w-full sm:w-auto justify-center text-sm font-bold shadow-lg hover:opacity-90 active:scale-[0.96] transition-[transform,opacity] duration-150 ease-out inline-flex items-center motion-reduce:transition-none"
            >
              Start free
            </ButtonLink>
          </div>
          <p className="mt-4 text-xs text-white/50 sm:text-sm sm:mt-5">
            No credit card needed. Works on any smartphone. Free to use.
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}
