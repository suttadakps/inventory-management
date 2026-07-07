import type { Metadata } from "next";
import Link from "next/link";

import { requireUser } from "@/lib/auth/session";
import { getDashboardKpis, getDashboardLists } from "@/lib/dashboard/repository";

export const metadata: Metadata = { title: "Dashboard · ARTIVERGES NEXT" };

const baht0 = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  maximumFractionDigits: 0,
});
const dateFmt = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});
const dateFmtTh = new Intl.DateTimeFormat("th-TH", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

function baht(n: number): string {
  return baht0.format(Number.isFinite(n) ? n : 0);
}

const STATUS_TH: Record<string, { label: string; cls: string }> = {
  planning: { label: "วางแผน", cls: "bg-[#efe9dc] text-[#8a7a55]" },
  active: { label: "กำลังดำเนินการ", cls: "bg-[#e3ecf7] text-primary-700" },
  on_hold: { label: "พักงาน", cls: "bg-[#fbe4cf] text-[#a9791b]" },
  completed: { label: "เสร็จสิ้น", cls: "bg-[#dcefe4] text-success" },
  warranty: { label: "รับประกัน", cls: "bg-[#e3ecf7] text-primary-700" },
  closed: { label: "ปิดงาน", cls: "bg-[#ece9e2] text-neutral" },
};

function StatCard({
  label,
  value,
  sub,
  tone = "navy",
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: "navy" | "green" | "orange";
}) {
  const valueColor =
    tone === "green"
      ? "text-success"
      : tone === "orange"
        ? "text-accent-600"
        : "text-text-primary";
  return (
    <div className="rounded-lg border border-[#ece7db] bg-white p-5 shadow-1">
      <div className="text-body-sm font-medium text-text-secondary">
        {label}
      </div>
      <div className={`mt-2 text-h1 font-bold tabular-nums ${valueColor}`}>
        {value}
      </div>
      {sub && (
        <div className="mt-1 text-caption text-text-secondary">{sub}</div>
      )}
    </div>
  );
}

function CreamProgress({ value }: { value: number }) {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div className="h-2 w-40 overflow-hidden rounded-full bg-[#e7e1d5]">
      <div
        className="h-full rounded-full bg-primary-700"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

/** Parses a `YYYY-MM-DD` search-param value (from an <input type="date">)
 * into a Date, or undefined if missing/invalid. */
function parseDateParam(v: string | undefined): Date | undefined {
  if (!v) return undefined;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  await requireUser();
  const sp = await searchParams;

  let from = parseDateParam(sp.from);
  let to = parseDateParam(sp.to);
  // Swap if the user picked a reversed range, so the filter still makes sense.
  if (from && to && from > to) [from, to] = [to, from];
  const hasRange = Boolean(from || to);

  // Independent reads — fetched in parallel. Each is itself a cached,
  // DB-side-aggregated/bounded query (see lib/dashboard/repository.ts).
  const [kpis, lists] = await Promise.all([
    getDashboardKpis({ from, to }),
    getDashboardLists({ from, to }),
  ]);

  const deadlineLabel = kpis.deadlineIsPeriodScoped
    ? "ครบกำหนดส่งในช่วงที่เลือก"
    : "ใกล้ Deadline (14 วัน)";
  const deadlineSectionEmpty = kpis.deadlineIsPeriodScoped
    ? "ไม่มีโปรเจคที่ครบกำหนดส่งในช่วงเวลาที่เลือก"
    : "ไม่มีโปรเจคที่ใกล้ถึงกำหนดส่งใน 14 วัน";

  return (
    <div className="space-y-6">
      {/* Period filter */}
      <form
        method="get"
        className="flex flex-wrap items-end gap-3 rounded-lg border border-[#ece7db] bg-white p-4 shadow-1"
      >
        <div className="space-y-1.5">
          <label
            htmlFor="from"
            className="text-caption font-medium text-text-secondary"
          >
            จากวันที่
          </label>
          <input
            id="from"
            type="date"
            name="from"
            defaultValue={sp.from ?? ""}
            className="h-10 rounded-md border border-[#e2ddd0] bg-white px-3 text-body-sm text-text-primary focus:border-primary-600 focus:outline-none"
          />
        </div>
        <div className="space-y-1.5">
          <label
            htmlFor="to"
            className="text-caption font-medium text-text-secondary"
          >
            ถึงวันที่
          </label>
          <input
            id="to"
            type="date"
            name="to"
            defaultValue={sp.to ?? ""}
            className="h-10 rounded-md border border-[#e2ddd0] bg-white px-3 text-body-sm text-text-primary focus:border-primary-600 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          className="inline-flex h-10 items-center justify-center rounded-md bg-primary-700 px-4 text-body-sm font-medium text-white transition-colors hover:bg-primary-600"
        >
          กรองข้อมูล
        </button>
        {hasRange && (
          <Link
            href="/dashboard"
            className="text-body-sm font-medium text-text-secondary hover:text-text-primary hover:underline"
          >
            ล้างตัวกรอง
          </Link>
        )}
        <span className="ml-auto text-caption text-text-secondary">
          {hasRange
            ? `แสดงข้อมูล${from ? ` ตั้งแต่ ${dateFmtTh.format(from)}` : ""}${
                to ? ` ถึง ${dateFmtTh.format(to)}` : ""
              }`
            : "แสดงข้อมูลทั้งหมด"}
        </span>
      </form>

      {/* KPI grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="ยอดขายรวม" value={baht(kpis.totalSales)} />
        <StatCard
          label="มูลค่าโปรเจคทั้งหมด"
          value={baht(kpis.projectValue)}
          sub={`${kpis.projectCount} โปรเจค`}
        />
        <StatCard
          label="รายรับที่รับแล้ว"
          value={baht(kpis.received)}
          tone="green"
        />
        <StatCard label="ยอดค้างรับ" value={baht(kpis.outstanding)} />

        <StatCard label="ต้นทุนรวม" value={baht(kpis.totalCost)} />
        <StatCard
          label="กำไรขั้นต้น"
          value={baht(kpis.grossProfit)}
          sub={`${Math.round(kpis.margin)}% margin`}
        />
        <StatCard label="กำลังดำเนินการ" value={`${kpis.inProgress} โปรเจค`} />
        <StatCard
          label={deadlineLabel}
          value={`${kpis.deadlineCount} โปรเจค`}
          tone="orange"
        />
      </div>

      {/* Ongoing + deadline sections */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Ongoing projects */}
        <section className="rounded-lg border border-[#ece7db] bg-white p-6 shadow-1">
          <h2 className="mb-4 text-h3 font-semibold text-text-primary">
            โปรเจคที่กำลังดำเนินการ
          </h2>
          {lists.ongoing.length === 0 ? (
            <p className="text-body-sm text-text-secondary">
              ยังไม่มีโปรเจคที่กำลังดำเนินการ
            </p>
          ) : (
            <ul className="divide-y divide-[#f0ece2]">
              {lists.ongoing.map((p) => {
                const st = STATUS_TH[p.status] ?? {
                  label: p.status,
                  cls: "bg-[#ece9e2] text-neutral",
                };
                return (
                  <li
                    key={p.id}
                    className="flex items-center justify-between gap-4 py-3"
                  >
                    <div className="min-w-0">
                      <Link
                        href={`/projects/${p.id}`}
                        className="block truncate font-medium text-text-primary hover:underline"
                      >
                        {p.name}
                      </Link>
                      <div className="truncate text-caption text-text-secondary">
                        {p.clientName}
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <CreamProgress value={p.progress} />
                      <span
                        className={`rounded-full px-2.5 py-1 text-caption font-medium ${st.cls}`}
                      >
                        {st.label}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* Upcoming / period deadlines */}
        <section className="rounded-lg border border-[#ece7db] bg-white p-6 shadow-1">
          <h2 className="mb-4 text-h3 font-semibold text-text-primary">
            {kpis.deadlineIsPeriodScoped ? "กำหนดส่งในช่วงที่เลือก" : "ใกล้ถึง Deadline"}
          </h2>
          {lists.deadlines.length === 0 ? (
            <p className="text-body-sm text-text-secondary">
              {deadlineSectionEmpty}
            </p>
          ) : (
            <ul className="divide-y divide-[#f0ece2]">
              {lists.deadlines.map((p) => (
                <li key={p.id} className="py-3">
                  <Link
                    href={`/projects/${p.id}`}
                    className="block font-medium text-text-primary hover:underline"
                  >
                    {p.name}
                  </Link>
                  <div className="text-caption text-accent-600">
                    ส่งมอบ {p.endDate ? dateFmt.format(new Date(p.endDate)) : "—"}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
