"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

import { useTranslation } from "@/lib/marketing/translations";

export function Hero() {
  const t = useTranslation();
  const sectionRef = useRef<HTMLElement>(null);
  const videoWrapRef = useRef<HTMLDivElement>(null);
  const eyebrowRef = useRef<HTMLParagraphElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Staggered entrance: label -> heading -> body -> CTA
      gsap
        .timeline({ defaults: { ease: "power3.out" } })
        .from(eyebrowRef.current, { y: 24, opacity: 0, duration: 0.7 })
        .from(titleRef.current, { y: 36, opacity: 0, duration: 0.9 }, "-=0.5")
        .from(subtitleRef.current, { y: 24, opacity: 0, duration: 0.8 }, "-=0.55")
        .from(ctaRef.current, { y: 20, opacity: 0, duration: 0.7 }, "-=0.5");

      // Subtle parallax: video scales + fades as the hero scrolls away
      gsap.to(videoWrapRef.current, {
        scale: 1.12,
        opacity: 0.25,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="top"
      className="relative flex min-h-[92vh] items-end overflow-hidden bg-bg"
    >
      <div ref={videoWrapRef} className="absolute inset-0">
        <video
          className="h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          poster="/marketing/video/poster.jpg"
        >
          <source
            src="/marketing/video/hero-mobile.mp4"
            media="(max-width: 768px)"
            type="video/mp4"
          />
          <source src="/marketing/video/hero.mp4" type="video/mp4" />
        </video>
      </div>

      {/* Color-grade the bright daylight footage into the dark CI-blue theme */}
      <div className="absolute inset-0 bg-primary-700/55 mix-blend-multiply" />
      <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/50 to-primary-700/30" />
      <div className="absolute inset-0 bg-gradient-to-b from-bg/70 via-transparent to-transparent" />

      <div className="relative mx-auto w-full max-w-6xl px-6 pb-20 pt-32 lg:px-8">
        <p
          ref={eyebrowRef}
          className="text-body-sm font-medium uppercase tracking-[0.2em] text-white/70"
        >
          {t.hero.eyebrow}
        </p>
        <h1
          ref={titleRef}
          className="mt-4 max-w-2xl text-[40px] font-bold leading-[1.1] text-white sm:text-[56px]"
        >
          {t.hero.title}
        </h1>
        <p
          ref={subtitleRef}
          className="mt-6 max-w-xl text-body text-white/80 sm:text-[16px]"
        >
          {t.hero.subtitle}
        </p>
        <div ref={ctaRef} className="mt-9 flex flex-wrap gap-4">
          <a
            href="#portfolio"
            className="inline-flex h-11 items-center rounded-sm bg-white px-6 text-body font-medium text-primary-700 shadow-2 transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/90 hover:shadow-3"
          >
            {t.hero.ctaWork}
          </a>
          <a
            href="#contact"
            className="inline-flex h-11 items-center rounded-sm border border-white/40 px-6 text-body font-medium text-white transition-all duration-200 hover:-translate-y-0.5 hover:border-white/70 hover:bg-white/10"
          >
            {t.hero.ctaContact}
          </a>
        </div>
      </div>
    </section>
  );
}
