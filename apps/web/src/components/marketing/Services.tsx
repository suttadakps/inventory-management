"use client";

import {
  HardHat,
  PaintRoller,
  Sofa,
  PencilRuler,
  ClipboardList,
  Wrench,
} from "lucide-react";

import { useTranslation } from "@/lib/marketing/translations";
import { Reveal } from "@/components/marketing/Reveal";

const ICONS = [HardHat, PaintRoller, Sofa, PencilRuler, ClipboardList, Wrench];

export function Services() {
  const t = useTranslation();

  return (
    <section id="services" className="bg-bg py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <Reveal animation="fade-up" className="max-w-2xl">
          <p className="text-body-sm font-medium uppercase tracking-[0.2em] text-accent-600">
            {t.services.eyebrow}
          </p>
          <h2 className="mt-3 text-h1 font-bold text-text-primary sm:text-[32px]">
            {t.services.title}
          </h2>
        </Reveal>

        <Reveal
          animation="scale-up"
          stagger
          className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
        >
          {t.services.items.map((service, i) => {
            const Icon = ICONS[i]!;
            return (
              <div
                key={service.title}
                className="group rounded-md border border-border bg-surface p-8 shadow-1 transition-all duration-300 hover:-translate-y-1 hover:border-primary-600/40 hover:shadow-3"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary-100 text-primary-600 transition-colors duration-300 group-hover:bg-primary-600 group-hover:text-white">
                  <Icon className="h-6 w-6" strokeWidth={1.75} />
                </div>
                <h3 className="mt-4 text-h2 font-bold text-text-primary">
                  {service.title}
                </h3>
                <p className="mt-3 text-body-sm text-text-secondary">
                  {service.description}
                </p>
              </div>
            );
          })}
        </Reveal>

        <Reveal
          animation="fade-up"
          className="mt-14 rounded-md border border-border bg-surface p-8 shadow-1"
        >
          <h3 className="text-h3 font-bold text-text-primary">
            {t.services.capabilitiesTitle}
          </h3>
          <div className="mt-4 flex flex-wrap gap-3">
            {t.services.capabilities.map((item) => (
              <span
                key={item}
                className="cursor-default rounded-sm bg-primary-100 px-4 py-2 text-body-sm font-medium text-text-primary transition-colors duration-200 hover:bg-primary-600 hover:text-white"
              >
                {item}
              </span>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
