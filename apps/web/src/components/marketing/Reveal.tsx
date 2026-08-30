"use client";

import { useEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type AnimationType =
  | "fade-up"
  | "slide-left"
  | "slide-right"
  | "scale-up"
  | "stagger-up";

const VARIANTS: Record<AnimationType, gsap.TweenVars> = {
  "fade-up": { y: 50, opacity: 0 },
  "slide-left": { x: -70, opacity: 0 },
  "slide-right": { x: 70, opacity: 0 },
  "scale-up": { scale: 0.9, opacity: 0 },
  "stagger-up": { y: 40, opacity: 0 },
};

export function Reveal({
  children,
  animation = "fade-up",
  stagger = false,
  persist = false,
  className,
}: {
  children: ReactNode;
  animation?: AnimationType;
  stagger?: boolean;
  persist?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      const targets: gsap.TweenTarget = stagger ? Array.from(el.children) : el;
      gsap.from(targets, {
        ...VARIANTS[animation],
        duration: animation === "scale-up" ? 1.0 : 0.9,
        ease: "power3.out",
        stagger: stagger ? 0.12 : 0,
        scrollTrigger: {
          trigger: el,
          start: "top 85%",
          toggleActions: persist ? "play none none none" : "play none none reverse",
        },
      });
    }, ref);

    return () => ctx.revert();
  }, [animation, stagger, persist]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
