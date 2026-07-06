"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils/cn";

type Item = { label: string; href?: string };

/**
 * Left navigation for the ARTIVERGES NEXT operations shell (Thai labels, per
 * the design reference). Items without a route yet render as muted,
 * non-clickable entries so we never link to a page that does not exist.
 */
const NAV: Item[] = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "โปรเจค", href: "/projects" },
  { label: "BOQ / ใบเสนอราคา", href: "/boq" },
  { label: "เบิกเงิน" },
  { label: "บันทึกต้นทุน" },
  { label: "สรุปค่าแรง" },
  { label: "พอร์ทัลลูกค้า", href: "/clients" },
  { label: "โปรเจคของฉัน (AE)", href: "/projects" },
  { label: "พาร์ทเนอร์แนะนำงาน" },
];

export function AppSidebar({ roleLabel }: { roleLabel: string }) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-[#e7e1d5] bg-[#fbfaf6] lg:flex print:!hidden">
      <div className="px-6 pb-6 pt-6">
        <Image
          src="/artiverges-next-logo.png"
          alt="ARTIVERGES NEXT"
          width={170}
          height={40}
          priority
          style={{ height: "auto", width: "150px" }}
        />
        <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-text-secondary">
          Contractor &amp; Interior Ops
        </p>
      </div>

      <nav className="flex-1 space-y-0.5 px-3">
        {NAV.map((item) => {
          if (!item.href) {
            return (
              <span
                key={item.label}
                className="flex cursor-default items-center gap-2.5 rounded-md px-3 py-2 text-body-sm text-text-disabled"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-[#d8d2c4]" />
                {item.label}
              </span>
            );
          }
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-3 py-2 text-body-sm font-medium transition-colors",
                active
                  ? "bg-white text-primary-700 shadow-1"
                  : "text-text-secondary hover:bg-white/70 hover:text-text-primary"
              )}
            >
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  active ? "bg-primary-700" : "bg-[#c9c2b2]"
                )}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-[#e7e1d5] px-5 py-5">
        <p className="text-caption text-text-secondary">มุมมองผู้ใช้</p>
        <div className="mt-2 rounded-md border border-[#e2ddd0] bg-white px-3 py-2 text-body-sm font-medium text-text-primary">
          {roleLabel}
        </div>
      </div>
    </aside>
  );
}
