"use client";

import { useMobileSidebar } from "@/components/layout/MobileSidebarContext";

/** Hamburger button shown in the top bar on mobile/tablet (hidden on lg+, where the sidebar is always visible). */
export function MobileMenuButton() {
  const { setOpen } = useMobileSidebar();

  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      aria-label="เปิดเมนู"
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-[#e2ddd0] bg-white text-text-primary transition-colors hover:bg-[#faf8f3] lg:hidden"
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 18 18"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      >
        <path d="M2 4.5h14M2 9h14M2 13.5h14" />
      </svg>
    </button>
  );
}
