import type { Metadata } from "next";
import Link from "next/link";

import { requireUser } from "@/lib/auth/session";
import {
  listProjects,
  listCalendarEntries,
  type CalendarEntry,
} from "@/lib/projects/repository";
import { STATUS_TH } from "@/lib/projects/statusLabels";
import { ContentCard } from "@/components/ui/ContentCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { SelectFilterBar } from "@/components/ui/SelectFilterBar";

export const metadata: Metadata = { title: "ปฏิทินโปรเจค · ARTIVERGES NEXT" };

const WEEKDAYS_TH = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];
const MAX_CHIPS_PER_DAY = 3;

const monthLabelFmt = new Intl.DateTimeFormat("en-US", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

function parseMonth(monthParam?: string): { year: number; monthIndex: number } {
  const match = monthParam?.match(/^(\d{4})-(\d{2})$/);
  if (match) {
    return { year: Number(match[1]), monthIndex: Number(match[2]) - 1 };
  }
  const now = new Date();
  return { year: now.getUTCFullYear(), monthIndex: now.getUTCMonth() };
}

function monthParamStr(year: number, monthIndex: number): string {
  const y = monthIndex < 0 ? year - 1 : monthIndex > 11 ? year + 1 : year;
  const m = ((monthIndex % 12) + 12) % 12;
  return `${y}-${String(m + 1).padStart(2, "0")}`;
}

function calendarHref(
  monthStr: string,
  projectId: string | undefined
): string {
  const params = new URLSearchParams({ month: monthStr });
  if (projectId) params.set("projectId", projectId);
  return `/calendar?${params.toString()}`;
}

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ projectId?: string; month?: string }>;
}) {
  const user = await requireUser();
  const sp = await searchParams;
  const { year, monthIndex } = parseMonth(sp.month);

  const from = new Date(Date.UTC(year, monthIndex, 1));
  const to = new Date(Date.UTC(year, monthIndex + 1, 0, 23, 59, 59, 999));
  const daysInMonth = to.getUTCDate();
  const firstWeekday = from.getUTCDay();

  const [projects, entries] = await Promise.all([
    listProjects(user, {}),
    listCalendarEntries(user, { projectId: sp.projectId, from, to }),
  ]);

  const entriesByDay = new Map<number, CalendarEntry[]>();
  for (const e of entries) {
    const day = new Date(e.date).getUTCDate();
    const list = entriesByDay.get(day) ?? [];
    list.push(e);
    entriesByDay.set(day, list);
  }

  const cells: (number | null)[] = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const currentMonthStr = monthParamStr(year, monthIndex);
  const prevMonthStr = monthParamStr(year, monthIndex - 1);
  const nextMonthStr = monthParamStr(year, monthIndex + 1);

  return (
    <div className="space-y-5">
      <ContentCard className="p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href={calendarHref(prevMonthStr, sp.projectId)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[#e2ddd0] bg-white text-text-primary hover:bg-[#faf8f3]"
              aria-label="เดือนก่อนหน้า"
            >
              ‹
            </Link>
            <h2 className="w-40 text-center text-h3 font-semibold text-text-primary">
              {monthLabelFmt.format(from)}
            </h2>
            <Link
              href={calendarHref(nextMonthStr, sp.projectId)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[#e2ddd0] bg-white text-text-primary hover:bg-[#faf8f3]"
              aria-label="เดือนถัดไป"
            >
              ›
            </Link>
          </div>

          <SelectFilterBar
            basePath="/calendar"
            label="โปรเจค"
            paramName="projectId"
            allLabel="ทุกโปรเจค"
            options={projects.map((p) => ({ value: p.id, label: p.name }))}
          />
        </div>
      </ContentCard>

      <ContentCard className="p-6">
        <div className="grid grid-cols-7 gap-px overflow-hidden rounded-md border border-[#f0ece2] bg-[#f0ece2]">
          {WEEKDAYS_TH.map((w) => (
            <div
              key={w}
              className="bg-[#faf8f3] px-2 py-2 text-center text-caption font-medium text-text-secondary"
            >
              {w}
            </div>
          ))}
          {cells.map((day, idx) => {
            const dayEntries = day ? (entriesByDay.get(day) ?? []) : [];
            const overflow = dayEntries.length - MAX_CHIPS_PER_DAY;
            return (
              <div
                key={idx}
                className="min-h-28 space-y-1 bg-white p-2 align-top"
              >
                {day && (
                  <div className="text-caption font-medium text-text-secondary">
                    {day}
                  </div>
                )}
                {dayEntries.slice(0, MAX_CHIPS_PER_DAY).map((e) => {
                  const st = STATUS_TH[e.status] ?? {
                    label: e.status,
                    tone: "gray" as const,
                  };
                  return (
                    <Link
                      key={e.id}
                      href={`/projects/${e.projectId}`}
                      className="block truncate"
                      title={`${e.projectName} · ${st.label}`}
                    >
                      <StatusBadge tone={st.tone} className="w-full truncate">
                        {e.projectName}
                      </StatusBadge>
                    </Link>
                  );
                })}
                {overflow > 0 && (
                  <div className="text-caption text-text-secondary">
                    +{overflow} อื่นๆ
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </ContentCard>
    </div>
  );
}
