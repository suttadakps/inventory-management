"use client";

import Image from "next/image";

import { useTranslation } from "@/lib/marketing/translations";
import { Reveal } from "@/components/marketing/Reveal";

export function About() {
  const t = useTranslation();

  return (
    <section id="about" className="mx-auto max-w-6xl px-6 py-24 lg:px-8">
      <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
        <Reveal
          animation="scale-up"
          className="relative aspect-[4/5] overflow-hidden rounded-md lg:order-2"
        >
          <Image
            src="/marketing/about.jpg"
            alt="Craftsmanship on an Artiverges Next project site"
            fill
            sizes="(min-width: 1024px) 40vw, 90vw"
            className="object-cover"
          />
        </Reveal>

        <Reveal animation="slide-right" className="lg:order-1">
          <p className="text-body-sm font-medium uppercase tracking-[0.2em] text-accent-600">
            {t.about.eyebrow}
          </p>
          <h2 className="mt-3 text-h1 font-bold text-text-primary sm:text-[32px]">
            {t.about.title}
          </h2>
          <div className="mt-6 space-y-4 text-body text-text-secondary">
            {t.about.paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
