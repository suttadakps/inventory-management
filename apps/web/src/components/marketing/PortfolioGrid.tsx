"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ArrowRight, Box, X } from "lucide-react";
import {
  PORTFOLIO_PROJECTS,
  type PortfolioProject,
} from "@/lib/marketing/portfolio-data";
import { useLanguage } from "@/lib/marketing/language-context";
import { useTranslation } from "@/lib/marketing/translations";
import { Reveal } from "@/components/marketing/Reveal";

export function PortfolioGrid() {
  const [active, setActive] = useState<PortfolioProject | null>(null);
  const [mainImage, setMainImage] = useState<string | null>(null);
  const { locale } = useLanguage();
  const t = useTranslation();

  useEffect(() => {
    if (!active) return;
    setMainImage(active.image);
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActive(null);
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [active]);

  return (
    <>
      <Reveal
        animation="stagger-up"
        stagger
        className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        {PORTFOLIO_PROJECTS.map((project) => (
          <button
            key={project.slug}
            type="button"
            onClick={() => setActive(project)}
            className="group relative aspect-[4/5] overflow-hidden rounded-md text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
          >
            <Image
              src={project.image}
              alt={`${project.name} — ${project.type[locale]}`}
              fill
              sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
            {project.isRender && (
              <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-caption font-medium text-white backdrop-blur">
                <Box className="h-3 w-3" strokeWidth={2} />
                {t.portfolio.renderBadge}
              </span>
            )}
            <div className="absolute inset-x-0 bottom-0 p-6">
              <p className="text-body-sm font-medium uppercase tracking-wide text-white/70">
                {project.type[locale]}
              </p>
              <h3 className="mt-1 text-h2 font-bold text-white">
                {project.name}
              </h3>
              <span className="mt-2 inline-flex items-center gap-1.5 text-body-sm font-medium text-white/80 opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:opacity-100">
                {t.portfolio.viewDetails}
                <ArrowRight className="h-4 w-4" strokeWidth={2} />
              </span>
            </div>
          </button>
        ))}
      </Reveal>

      {active && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setActive(null)}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-md border border-border bg-surface"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setActive(null)}
              aria-label="Close"
              className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white transition-colors duration-200 hover:bg-accent-600"
            >
              <X className="h-5 w-5" strokeWidth={2} />
            </button>

            <div className="relative aspect-[16/9] w-full">
              <Image
                src={mainImage ?? active.image}
                alt={`${active.name} — ${active.type[locale]}`}
                fill
                sizes="(min-width: 768px) 768px, 100vw"
                className="object-cover"
              />
            </div>

            {active.gallery && active.gallery.length > 0 && (
              <div className="flex gap-2 overflow-x-auto border-b border-border bg-surface p-3">
                {[active.image, ...active.gallery].map((src, i) => (
                  <button
                    key={src}
                    type="button"
                    onClick={() => setMainImage(src)}
                    className={`relative h-14 w-20 shrink-0 overflow-hidden rounded-sm ring-2 transition-opacity ${
                      (mainImage ?? active.image) === src
                        ? "opacity-100 ring-accent-600"
                        : "opacity-70 ring-transparent hover:opacity-100"
                    }`}
                    aria-label={`${active.name} photo ${i + 1}`}
                  >
                    <Image
                      src={src}
                      alt=""
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            <div className="p-6 sm:p-8">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-body-sm font-medium uppercase tracking-wide text-accent-600">
                  {active.type[locale]}
                </p>
                {active.isRender && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary-100 px-2.5 py-1 text-caption font-medium text-primary-700">
                    <Box className="h-3 w-3" strokeWidth={2} />
                    {t.portfolio.renderBadge}
                  </span>
                )}
              </div>
              <h3 className="mt-1 text-h1 font-bold text-text-primary">
                {active.name}
              </h3>
              <p className="mt-4 text-body text-text-secondary">
                {active.overview[locale]}
              </p>

              <div className="mt-6 space-y-4">
                {active.highlights.map((h) => (
                  <div key={h.title[locale]}>
                    <h4 className="text-h3 font-bold text-text-primary">
                      {h.title[locale]}
                    </h4>
                    <p className="mt-1 text-body-sm text-text-secondary">
                      {h.description[locale]}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
