import type { Metadata } from "next";

import { LenisProvider } from "@/components/marketing/LenisProvider";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { ReferHero } from "@/components/marketing/ReferHero";
import { ReferralForm } from "@/components/marketing/ReferralForm";
import { ContactFooter } from "@/components/marketing/ContactFooter";

export const metadata: Metadata = {
  title: "แนะนำงาน — Artiverges Next",
  description:
    "แนะนำงานก่อสร้าง รีโนเวท หรือตกแต่งภายในให้ Artiverges Next ทีมงานจะติดต่อกลับโดยเร็วที่สุด",
};

export default function ReferPage() {
  return (
    <LenisProvider>
      <div className="marketing-dark min-h-screen bg-bg text-text-primary">
        <MarketingHeader />
        <main>
          <section className="mx-auto max-w-3xl px-6 py-24 lg:px-8">
            <ReferHero />

            <div className="mt-10">
              <ReferralForm />
            </div>
          </section>
        </main>
        <ContactFooter />
      </div>
    </LenisProvider>
  );
}
