"use client";

import { Workflow, TrendingUp, Sparkles, Headphones } from "lucide-react";

import { useTranslation } from "@/lib/marketing/translations";
import { Reveal } from "@/components/marketing/Reveal";

const ICONS = [Workflow, TrendingUp, Sparkles, Headphones];

export function WhyChooseUs() {
  const t = useTranslation();

  return (
    <section className="bg-bg py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:gap-16">
          <Reveal animation="slide-right">
            <p className="text-body-sm font-medium uppercase tracking-[0.2em] text-accent-600">
              {t.why.eyebrow}
            </p>
            <h2 className="mt-3 text-h1 font-bold text-text-primary sm:text-[32px]">
              {t.why.title}
            </h2>
            <p className="mt-5 text-body text-text-secondary">{t.why.intro}</p>
          </Reveal>

          <Reveal animation="stagger-up" stagger className="grid gap-6 sm:grid-cols-2">
            {t.why.points.map((point, i) => {
              const Icon = ICONS[i]!;
              return (
                <div
                  key={point.title}
                  className="group rounded-md border border-border bg-surface p-6 shadow-1 transition-all duration-300 hover:-translate-y-1 hover:border-primary-600/40 hover:shadow-3"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-md bg-primary-100 text-primary-600 transition-colors duration-300 group-hover:bg-primary-600 group-hover:text-white">
                    <Icon className="h-5 w-5" strokeWidth={1.75} />
                  </div>
                  <h3 className="mt-4 text-h3 font-bold text-text-primary">
                    {point.title}
                  </h3>
                  <p className="mt-2 text-body-sm text-text-secondary">
                    {point.description}
                  </p>
                </div>
              );
            })}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
