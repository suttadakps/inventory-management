"use client";

import Image from "next/image";
import Link from "next/link";

import { useTranslation } from "@/lib/marketing/translations";
import { LanguageSwitcher } from "@/components/marketing/LanguageSwitcher";

export function MarketingHeader() {
  const t = useTranslation();

  const navLinks = [
    { href: "/#about", label: t.nav.about },
    { href: "/#services", label: t.nav.services },
    { href: "/#portfolio", label: t.nav.portfolio },
    { href: "/#contact", label: t.nav.contact },
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-surface/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 lg:px-8">
        <Link href="/" className="min-w-0 shrink">
          <Image
            src="/artiverges-next-logo.png"
            alt="Artiverges Next"
            width={220}
            height={28}
            priority
            className="h-4 w-auto brightness-0 invert sm:h-5 lg:h-6"
          />
        </Link>
        <div className="flex shrink-0 items-center gap-3 sm:gap-5 lg:gap-8">
          <nav className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="relative py-1 text-body-sm font-medium text-text-secondary transition-colors after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-primary-600 after:transition-all after:duration-300 hover:text-primary-600 hover:after:w-full"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <LanguageSwitcher />
          <Link
            href="/refer"
            className="inline-flex h-9 shrink-0 items-center whitespace-nowrap rounded-sm bg-accent-600 px-3 text-body-sm font-medium text-white shadow-1 transition-all duration-200 hover:-translate-y-0.5 hover:bg-accent-600/90 hover:shadow-2 sm:h-10 sm:px-5"
          >
            <span className="sm:hidden">{t.nav.referShort}</span>
            <span className="hidden sm:inline">{t.nav.refer}</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
