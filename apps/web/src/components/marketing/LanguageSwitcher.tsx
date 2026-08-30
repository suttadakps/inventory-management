"use client";

import { Globe } from "lucide-react";

import { useLanguage, type Locale } from "@/lib/marketing/language-context";

const OPTIONS: { locale: Locale; label: string }[] = [
  { locale: "th", label: "ไทย" },
  { locale: "en", label: "EN" },
  { locale: "zh", label: "中文" },
];

export function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage();

  return (
    <div className="flex items-center gap-0.5 rounded-full border border-border bg-surface p-0.5 pl-2">
      <Globe className="h-3.5 w-3.5 shrink-0 text-text-disabled" strokeWidth={1.75} />
      {OPTIONS.map((opt) => (
        <button
          key={opt.locale}
          type="button"
          onClick={() => setLocale(opt.locale)}
          aria-current={locale === opt.locale}
          className={`rounded-full px-2.5 py-1 text-caption font-medium transition-all duration-200 ${
            locale === opt.locale
              ? "bg-primary-600 text-white shadow-1"
              : "text-text-secondary hover:bg-primary-100 hover:text-primary-600"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
