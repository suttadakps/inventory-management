"use client";

import Image from "next/image";
import Link from "next/link";
import { Mail, Phone } from "lucide-react";

import { useTranslation } from "@/lib/marketing/translations";
import { Reveal } from "@/components/marketing/Reveal";

export function ContactFooter() {
  const t = useTranslation();
  const copyright = t.contact.copyright.replace(
    "{year}",
    String(new Date().getFullYear())
  );

  return (
    <footer id="contact" className="bg-primary-700">
      <div className="mx-auto max-w-6xl px-6 py-24 lg:px-8">
        <Reveal animation="fade-up" persist className="max-w-xl">
          <p className="text-body-sm font-medium uppercase tracking-[0.2em] text-white/60">
            {t.contact.eyebrow}
          </p>
          <h2 className="mt-3 text-h1 font-bold text-white sm:text-[32px]">
            {t.contact.title}
          </h2>
          <p className="mt-5 text-body text-white/75">{t.contact.body}</p>

          <div className="mt-9 space-y-4">
            <a
              href="mailto:artivergesnext@gmail.com"
              className="group flex items-center gap-3 text-h2 font-semibold text-white transition-colors hover:text-accent-100"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-white/70 transition-colors duration-300 group-hover:bg-accent-600 group-hover:text-white">
                <Mail className="h-5 w-5" strokeWidth={1.75} />
              </span>
              artivergesnext@gmail.com
            </a>
            <a
              href="tel:+66943419222"
              className="group flex items-center gap-3 text-h2 font-semibold text-white transition-colors hover:text-accent-100"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-white/70 transition-colors duration-300 group-hover:bg-accent-600 group-hover:text-white">
                <Phone className="h-5 w-5" strokeWidth={1.75} />
              </span>
              094-341-9222
            </a>
          </div>
        </Reveal>

        <div className="mt-20 flex flex-col items-start justify-between gap-6 border-t border-white/15 pt-8 sm:flex-row sm:items-center">
          <Image
            src="/artiverges-next-logo.png"
            alt="Artiverges Next"
            width={180}
            height={24}
            className="h-5 w-auto brightness-0 invert"
          />
          <div className="flex items-center gap-4">
            <p className="text-body-sm text-white/50">{copyright}</p>
            <Link
              href="/login"
              className="text-caption text-white/30 transition-colors hover:text-white/60"
            >
              {t.contact.staffLogin}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
