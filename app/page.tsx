import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { BusinessTypeRow } from "@/components/landing/business-type-row";
import { DashboardMockup } from "@/components/landing/dashboard-mockup";
import { TheGap } from "@/components/landing/the-gap";
import { WhyItWorks } from "@/components/landing/why-it-works";
import { LedgerSection } from "@/components/landing/ledger-section";
import { CashSection } from "@/components/landing/cash-section";
import { DebtSection } from "@/components/landing/debt-section";
import { FeatureGrid } from "@/components/landing/feature-grid";
import { FAQ } from "@/components/landing/faq";
import { ClosingCTA } from "@/components/landing/closing-cta";
import { Footer } from "@/components/landing/footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <Hero />
        <BusinessTypeRow />
        <DashboardMockup />
        <TheGap />
        <WhyItWorks />
        <LedgerSection />
        <CashSection />
        <DebtSection />
        <FeatureGrid />
        <FAQ />
        <ClosingCTA />
      </main>
      <Footer />
    </>
  );
}
