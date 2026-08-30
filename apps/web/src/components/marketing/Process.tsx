"use client";

import { MapPin, Palette, Calculator, HardHat, Sparkles } from "lucide-react";

import { useTranslation } from "@/lib/marketing/translations";
import { Reveal } from "@/components/marketing/Reveal";

const STEP_NUMBERS = ["01", "02", "03", "04", "05"];
const ICONS = [MapPin, Palette, Calculator, HardHat, Sparkles];

export function Process() {
  const t = useTranslation();

  return (
    <section className="mx-auto max-w-6xl px-6 py-24 lg:px-8">
      <Reveal animation="slide-right" className="max-w-2xl">
        <p className="text-body-sm font-medium uppercase tracking-[0.2em] text-accent-600">
          {t.process.eyebrow}
        </p>
        <h2 className="mt-3 text-h1 font-bold text-text-primary sm:text-[32px]">
          {t.process.title}
        </h2>
      </Reveal>

      <Reveal
        animation="slide-left"
        stagger
        className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-5 lg:gap-6"
      >
        {t.process.steps.map((s, i) => {
          const Icon = ICONS[i]!;
          return (
            <div key={s.title} className="group cursor-default">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-primary-100 text-primary-600 transition-all duration-300 group-hover:border-primary-600 group-hover:bg-primary-600 group-hover:text-white">
                  <Icon className="h-5 w-5" strokeWidth={1.75} />
                </div>
                <span className="text-[32px] font-bold leading-none text-primary-100 transition-colors duration-300 group-hover:text-primary-200">
                  {STEP_NUMBERS[i]}
                </span>
              </div>
              <h3 className="mt-4 text-h3 font-bold text-text-primary">
                {s.title}
              </h3>
              <p className="mt-2 text-body-sm text-text-secondary">
                {s.description}
              </p>
            </div>
          );
        })}
      </Reveal>
    </section>
  );
}
