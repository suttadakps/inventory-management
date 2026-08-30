"use client";

import { useTranslation } from "@/lib/marketing/translations";
import { Reveal } from "@/components/marketing/Reveal";

export function ReferHero() {
  const t = useTranslation();

  return (
    <Reveal animation="fade-up">
      <p className="text-body-sm font-medium uppercase tracking-[0.2em] text-accent-600">
        {t.refer.eyebrow}
      </p>
      <h1 className="mt-3 text-h1 font-bold text-text-primary sm:text-[32px]">
        {t.refer.title}
      </h1>
      <p className="mt-5 max-w-xl text-body text-text-secondary">
        {t.refer.body}
      </p>
    </Reveal>
  );
}
