import type { Metadata } from "next";
import { LenisProvider } from "@/components/marketing/LenisProvider";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { Hero } from "@/components/marketing/Hero";
import { About } from "@/components/marketing/About";
import { WhyChooseUs } from "@/components/marketing/WhyChooseUs";
import { Services } from "@/components/marketing/Services";
import { Process } from "@/components/marketing/Process";
import { Turnkey } from "@/components/marketing/Turnkey";
import { Portfolio } from "@/components/marketing/Portfolio";
import { ContactFooter } from "@/components/marketing/ContactFooter";

export const metadata: Metadata = {
  title: "Artiverges Next — Building the Next Verge",
  description:
    "Construction, renovation, interior fit-out, and design & build services for residential, commercial, hospitality, and retail projects.",
};

export default function Home() {
  return (
    <LenisProvider>
      <div className="marketing-dark min-h-screen bg-bg text-text-primary">
        <MarketingHeader />
        <main>
          <Hero />
          <About />
          <WhyChooseUs />
          <Services />
          <Process />
          <Turnkey />
          <Portfolio />
        </main>
        <ContactFooter />
      </div>
    </LenisProvider>
  );
}
