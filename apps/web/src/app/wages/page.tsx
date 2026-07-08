import type { Metadata } from "next";

import { requireUser } from "@/lib/auth/session";
import { listProjects } from "@/lib/projects/repository";
import { listWages, canManageWages } from "@/lib/wages/repository";
import { ContentCard } from "@/components/ui/ContentCard";
import { MetricCard } from "@/components/ui/MetricCard";
import { StatusBadge, type StatusTone } from "@/components/ui/StatusBadge";
import { SelectFilterBar } from "@/components/ui/SelectFilterBar";
import { WageForm } from "@/components/wages/WageForm";
import { WageActions } from "@/components/wages/WageActions";
import { formatBaht } from "@/lib/format";

export const metadata: Metadata = { title: "สรุปค่าแรง · ARTIVERGES NEXT" };

const dateFmt = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

const STATUS_TH: Record<string, { label: string; tone: StatusTone }> = {
  unpaid: { label: "ค้างจ่าย", tone: "amber" },
  paid: { label: "จ่ายแล้ว", tone: "green" },
};

export default async function WagesPage({
  searchParams,
}: {
  searchParams: Promise<{ projectId?: string; workerName?: string }>;
}) {
  const user = await requireUser();
  const sp = await searchParams;
  const [data, projects] = await Promise.all([
    listWages(user),
    listProjects(user, {}),
  ]);
  const canManage = canManageWages(user.role);

  // Distinct worker names present in the data, for the filter dropdown.
  const workerNames = Array.from(
    new Set(data.rows.map((r) => r.workerName))
  ).sort((a, b) => a.localeCompare(b, "th"));

  // Summary cards recompute from the filtered rows, so they always match
  // what the table below is showing (with no filter, that's everything).
  const visibleRows = data.rows.filter(
    (r) =>
      (!sp.projectId || r.projectId === sp.projectId) &&
      (!sp.workerName || r.workerName === sp.workerName)
  );
  const hasFilter = Boolean(sp.projectId || sp.workerName);
  const visibleTotal = visibleRows.reduce((s, r) => s + r.amount, 0);
  const visiblePaid = visibleRows
    .filter((r) => r.status === "paid")
    .reduce((s, r) => s + r.amount, 0);
  const visibleUnpaid = visibleTotal - visiblePaid;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MetricCard label="ค่าแรงรวม" value={formatBaht(visibleTotal, true)} />
        <MetricCard
          label="จ่ายแล้ว"
          value={formatBaht(visiblePaid, true)}
          tone="green"
        />
        <MetricCard
          label="ค้างจ่าย"
          value={formatBaht(visibleUnpaid, true)}
          tone="orange"
        />
      </div>

      {canManage && (
        <WageForm projects={projects.map((p) => ({ id: p.id, name: p.name }))} />
      )}

      <div className="flex flex-wrap items-center gap-4">
        <SelectFilterBar
          basePath="/wages"
          label="โปรเจค"
          paramName="projectId"
          allLabel="ทุกโปรเจค"
          options={projects.map((p) => ({ value: p.id, label: p.name }))}
        />
        <SelectFilterBar
          basePath="/wages"
          label="คนงาน"
          paramName="workerName"
          allLabel="ทุกคนงาน"
          options={workerNames.map((n) => ({ value: n, label: n }))}
        />
      </div>

      {visibleRows.length === 0 ? (
        <div className="rounded-lg border border-dashed border-[#ddd6c8] bg-white p-10 text-center text-body-sm text-text-secondary">
          {hasFilter ? "ไม่มีรายการค่าแรงตามที่กรอง" : "ยังไม่มีรายการค่าแรง"}
        </div>
      ) : (
        <ContentCard className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-body-sm">
            <thead className="border-b border-[#f0ece2] text-caption font-medium uppercase tracking-wide text-text-secondary">
              <tr>
                <th className="px-6 py-3">คนงาน</th>
                <th className="px-6 py-3">โปรเจค</th>
                <th className="px-6 py-3 text-right">จำนวนวัน</th>
                <th className="px-6 py-3 text-right">ค่าแรง</th>
                <th className="px-6 py-3">วันที่</th>
                <th className="px-6 py-3">สถานะ</th>
                {canManage && <th className="px-6 py-3 text-right" />}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0ece2]">
              {visibleRows.map((w) => {
                const st = STATUS_TH[w.status] ?? {
                  label: w.status,
                  tone: "gray" as StatusTone,
                };
                return (
                  <tr key={w.id} className="hover:bg-[#faf8f3]">
                    <td className="px-6 py-4 align-top">
                      <div className="font-semibold text-text-primary">
                        {w.workerName}
                      </div>
                      {w.roleLabel && (
                        <div className="text-caption text-text-secondary">
                          {w.roleLabel}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 align-top text-text-secondary">
                      {w.projectName ?? "—"}
                    </td>
                    <td className="px-6 py-4 text-right align-top tabular-nums text-text-primary">
                      {w.daysWorked || "—"}
                    </td>
                    <td className="px-6 py-4 text-right align-top font-semibold tabular-nums text-text-primary">
                      {formatBaht(w.amount, true)}
                    </td>
                    <td className="px-6 py-4 align-top text-text-secondary">
                      {w.date ? dateFmt.format(new Date(w.date)) : "—"}
                    </td>
                    <td className="px-6 py-4 align-top">
                      <StatusBadge tone={st.tone}>{st.label}</StatusBadge>
                    </td>
                    {canManage && (
                      <td className="px-6 py-4 align-top">
                        <WageActions id={w.id} status={w.status} />
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </ContentCard>
      )}
    </div>
  );
}
