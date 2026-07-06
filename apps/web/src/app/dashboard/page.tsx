import type { Metadata } from "next";
import Link from "next/link";

import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

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

function baht(n: number): string {
  return baht0.format(Number.isFinite(n) ? n : 0);
}

function num(d: unknown): number {
  if (!d) return 0;
  if (typeof d === "number") return d;
  if (typeof d === "string") return parseFloat(d);
  if (typeof d === "object" && d !== null && "toNumber" in d) {
    return (d as { toNumber: () => number }).toNumber();
  }
  return 0;
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

export default async function DashboardPage() {
  await requireUser();

  const now = new Date();
  const todayStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );
  const in14 = new Date(todayStart.getTime() + 14 * 86_400_000);

  const [projects, projAgg, salesAgg, receivedAgg] = await Promise.all([
    prisma.project.findMany({
      where: { deletedAt: null },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        name: true,
        code: true,
        status: true,
        progressPct: true,
        contractValue: true,
        endDate: true,
        client: { select: { name: true } },
      },
    }),
    prisma.project.aggregate({
      where: { deletedAt: null },
      _sum: { contractValue: true, actualCost: true },
    }),
    prisma.contract.aggregate({
      where: {
        deletedAt: null,
        status: { in: ["approved", "signed", "completed"] },
      },
      _sum: { value: true },
    }),
    prisma.payment.aggregate({
      where: { direction: "incoming" },
      _sum: { amount: true },
    }),
  ]);

  const projectValue = num(projAgg._sum.contractValue);
  const totalCost = num(projAgg._sum.actualCost);
  // Sold value = signed/approved contracts; fall back to project pipeline value
  // when no contracts exist yet so the KPI still reflects real data.
  const contractSales = num(salesAgg._sum.value);
  const totalSales = contractSales > 0 ? contractSales : projectValue;
  const received = num(receivedAgg._sum.amount);
  const outstanding = Math.max(0, totalSales - received);
  const grossProfit = totalSales - totalCost;
  const margin = totalSales > 0 ? (grossProfit / totalSales) * 100 : 0;

  const projectCount = projects.length;
  const ongoing = projects.filter(
    (p) => p.status !== "completed" && p.status !== "closed"
  );
  const inProgress = projects.filter((p) => p.status === "active").length;
  const deadlineProjects = projects.filter((p) => {
    if (!p.endDate) return false;
    if (p.status === "completed" || p.status === "closed") return false;
    const d = new Date(p.endDate);
    return d >= todayStart && d <= in14;
  });

  return (
    <div className="space-y-6">
      {/* KPI grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="ยอดขายรวม" value={baht(totalSales)} />
        <StatCard
          label="มูลค่าโปรเจคทั้งหมด"
          value={baht(projectValue)}
          sub={`${projectCount} โปรเจค`}
        />
        <StatCard
          label="รายรับที่รับแล้ว"
          value={baht(received)}
          tone="green"
        />
        <StatCard label="ยอดค้างรับ" value={baht(outstanding)} />

        <StatCard label="ต้นทุนรวม" value={baht(totalCost)} />
        <StatCard
          label="กำไรขั้นต้น"
          value={baht(grossProfit)}
          sub={`${Math.round(margin)}% margin`}
        />
        <StatCard label="กำลังดำเนินการ" value={`${inProgress} โปรเจค`} />
        <StatCard
          label="ใกล้ Deadline (14 วัน)"
          value={`${deadlineProjects.length} โปรเจค`}
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
          {ongoing.length === 0 ? (
            <p className="text-body-sm text-text-secondary">
              ยังไม่มีโปรเจคที่กำลังดำเนินการ
            </p>
          ) : (
            <ul className="divide-y divide-[#f0ece2]">
              {ongoing.slice(0, 6).map((p) => {
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
                        {p.client.name}
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <CreamProgress value={num(p.progressPct)} />
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

        {/* Upcoming deadlines */}
        <section className="rounded-lg border border-[#ece7db] bg-white p-6 shadow-1">
          <h2 className="mb-4 text-h3 font-semibold text-text-primary">
            ใกล้ถึง Deadline
          </h2>
          {deadlineProjects.length === 0 ? (
            <p className="text-body-sm text-text-secondary">
              ไม่มีโปรเจคที่ใกล้ถึงกำหนดส่งใน 14 วัน
            </p>
          ) : (
            <ul className="divide-y divide-[#f0ece2]">
              {deadlineProjects.map((p) => (
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
