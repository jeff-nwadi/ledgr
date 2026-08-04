import Image from "next/image";
import { ButtonLink } from "@/components/button";
import { SampleDataTag } from "@/components/card";
import { ScrollReveal } from "@/components/landing/scroll-reveal";

export function Hero() {
  return (
    <section className="bg-background overflow-hidden relative">
      <div className="mx-auto flex max-w-6xl flex-col items-center text-center px-4 pt-12 pb-16 sm:px-8 sm:pt-20 sm:pb-24">
        {/* Centered headline + subhead + CTAs */}
        <ScrollReveal className="flex flex-col items-center max-w-3xl">
        <h1 className="font-heading text-[36px] leading-[1.1] tracking-tight font-bold text-text-primary sm:text-5xl md:text-6xl">
            Stop guessing where your stock and money went.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-text-muted sm:mt-6">
            Ledgr keeps track of your shop numbers for you: Opening, Added, Sold, Waste, and Closing.
            When you count your stock or cash at the end of the day, Ledgr shows you if your count matches the math. If anything is missing, you see the exact difference right away.
          </p>
          <div className="mt-8 flex gap-3 sm:items-center sm:justify-center w-full sm:w-auto">
            <ButtonLink 
              href="/signup" 
              size="md" 
              className="w-full sm:w-auto justify-center active:scale-[0.96] transition-[transform,opacity,box-shadow] duration-150 ease-out font-bold px-6 motion-reduce:transition-none"
            >
              Create your shop account
            </ButtonLink>
            <ButtonLink
              href="/signin?type=pin"
              variant="secondary"
              size="md"
              className="w-full sm:w-auto justify-center active:scale-[0.96] transition-[transform,opacity,box-shadow] duration-150 ease-out font-medium px-6 motion-reduce:transition-none"
            >
              Staff sign in
            </ButtonLink>
          </div>
          <p className="mt-4 text-xs text-text-muted sm:text-sm">
            Free to use. No credit card needed.
          </p>
        </ScrollReveal>

        {/* Dashboard Preview Showcase */}
        <ScrollReveal delay={150} duration={350} className="mt-12 sm:mt-16 w-full max-w-5xl relative group">
          {/* Ambient Glow behind mockup */}
          <div 
            className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-brand/30 via-emerald-500/20 to-brand/30 opacity-40 blur-2xl transition duration-500 group-hover:opacity-60" 
            aria-hidden="true" 
          />

          {/* App Window Frame */}
          <div className="relative rounded-2xl sm:rounded-3xl border border-border/80 bg-surface/90 p-2 sm:p-3 shadow-2xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-350 ease-out motion-reduce:animate-none">
            {/* App Header Bar */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-border/50 mb-2">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-danger/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-success/80" />
              </div>
              <span className="text-[11px] sm:text-xs font-semibold text-text-muted tracking-tight">
                Owner Dashboard Overview
              </span>

              {/* Variance / Proof Stamp Reveal */}
              <div className="flex items-center gap-2 animate-in fade-in zoom-in-90 duration-250 ease-out motion-reduce:animate-none" style={{ animationDelay: "200ms" }}>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-success/10 text-success border border-success/20 flex items-center gap-1">
                  ✓ NUMBERS MATCHED
                </span>
                <SampleDataTag />
              </div>
            </div>

            {/* Dashboard Screenshot */}
            <div className="relative overflow-hidden rounded-xl sm:rounded-2xl border border-border/50 bg-background">
              <Image
                src="/images/Dashbaord.png"
                alt="Ledgr Owner Dashboard showing daily stock, sales total, and cash variance"
                width={1280}
                height={800}
                className="w-full h-auto object-cover object-top transition-transform duration-300 group-hover:scale-[1.005]"
                priority
              />
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
