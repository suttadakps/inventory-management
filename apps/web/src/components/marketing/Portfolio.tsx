"use client";

import { ExternalLink } from "lucide-react";

import { PortfolioGrid } from "@/components/marketing/PortfolioGrid";
import { Reveal } from "@/components/marketing/Reveal";
import { useTranslation } from "@/lib/marketing/translations";

export function Portfolio() {
  const t = useTranslation();

  return (
    <section id="portfolio" className="mx-auto max-w-6xl px-6 py-24 lg:px-8">
      <Reveal animation="fade-up" className="max-w-2xl">
        <p className="text-body-sm font-medium uppercase tracking-[0.2em] text-accent-600">
          {t.portfolio.eyebrow}
        </p>
        <h2 className="mt-3 text-h1 font-bold text-text-primary sm:text-[32px]">
          {t.portfolio.title}
        </h2>
        <p className="mt-4 text-body-sm text-text-secondary">
          {t.portfolio.subtitle}
        </p>
      </Reveal>

      <PortfolioGrid />

      <Reveal animation="fade-up" className="mt-14 flex justify-center">
        <a
          href="https://le-lusso.com/en/services"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-11 items-center gap-2 rounded-sm border border-border px-6 text-body font-medium text-text-primary transition-all duration-200 hover:-translate-y-0.5 hover:border-primary-600/60 hover:bg-surface"
        >
          {t.portfolio.viewMore}
          <ExternalLink className="h-4 w-4" strokeWidth={2} />
        </a>
      </Reveal>
    </section>
  );
}
