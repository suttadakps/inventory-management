"use client";

import Image from "next/image";

import { useTranslation } from "@/lib/marketing/translations";
import { Reveal } from "@/components/marketing/Reveal";

export function Turnkey() {
  const t = useTranslation();

  return (
    <section className="relative overflow-hidden bg-primary-700 py-28">
      <Image
        src="/marketing/turnkey.jpg"
        alt="Full turnkey construction fit-out in progress"
        fill
        sizes="100vw"
        className="object-cover opacity-25"
      />
      <div className="absolute inset-0 bg-primary-700/70" />

      <Reveal animation="fade-up" className="relative mx-auto max-w-3xl px-6 text-center lg:px-8">
        <p className="text-body-sm font-medium uppercase tracking-[0.2em] text-white/70">
          {t.turnkey.eyebrow}
        </p>
        <h2 className="mt-3 text-h1 font-bold text-white sm:text-[32px]">
          {t.turnkey.title}
        </h2>
        <p className="mt-6 text-body text-white/80">{t.turnkey.body}</p>
      </Reveal>
    </section>
  );
}
