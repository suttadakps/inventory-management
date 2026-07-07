import type { Metadata } from "next";

import { requireUser } from "@/lib/auth/session";
import { listProjects } from "@/lib/projects/repository";
import {
  listExpenses,
  canManageCosts,
} from "@/lib/costs/repository";
import { ContentCard } from "@/components/ui/ContentCard";
import { MetricCard } from "@/components/ui/MetricCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { CostForm } from "@/components/costs/CostForm";
import { CostDeleteButton } from "@/components/costs/CostDeleteButton";
import { formatBaht } from "@/lib/format";

export const metadata: Metadata = { title: "บันทึกต้นทุน · ARTIVERGES NEXT" };

const dateFmt = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

export default async function CostsPage() {
  const user = await requireUser();
  const [rows, projects] = await Promise.all([
    listExpenses(user),
    listProjects(user, {}),
  ]);
  const canManage = canManageCosts(user.role);
  const total = rows.reduce((s, r) => s + r.amount, 0);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MetricCard label="ต้นทุนรวม" value={formatBaht(total, true)} />
        <MetricCard label="จำนวนรายการ" value={String(rows.length)} />
        <MetricCard
          label="เฉลี่ยต่อรายการ"
          value={formatBaht(rows.length ? total / rows.length : 0, true)}
        />
      </div>

      {canManage && <CostForm projects={projects.map((p) => ({ id: p.id, name: p.name }))} />}

      {rows.length === 0 ? (
        <div className="rounded-lg border border-dashed border-[#ddd6c8] bg-white p-10 text-center text-body-sm text-text-secondary">
          ยังไม่มีการบันทึกต้นทุน
        </div>
      ) : (
        <ContentCard className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-body-sm">
            <thead className="border-b border-[#f0ece2] text-caption font-medium uppercase tracking-wide text-text-secondary">
              <tr>
                <th className="px-6 py-3">โปรเจค</th>
                <th className="px-6 py-3">หมวด</th>
                <th className="px-6 py-3">รายละเอียด</th>
                <th className="px-6 py-3 text-right">จำนวนเงิน</th>
                <th className="px-6 py-3">วันที่</th>
                {canManage && <th className="px-6 py-3" />}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0ece2]">
              {rows.map((r) => (
                <tr key={r.id} className="hover:bg-[#faf8f3]">
                  <td className="px-6 py-4 align-top text-text-primary">
                    {r.projectName ?? "ส่วนกลาง"}
                  </td>
                  <td className="px-6 py-4 align-top">
                    <StatusBadge tone="tan">{r.category}</StatusBadge>
                  </td>
                  <td className="px-6 py-4 align-top text-text-primary">
                    {r.description ?? "—"}
                  </td>
                  <td className="px-6 py-4 text-right align-top font-semibold tabular-nums text-text-primary">
                    {formatBaht(r.amount, true)}
                  </td>
                  <td className="px-6 py-4 align-top text-text-secondary">
                    {dateFmt.format(new Date(r.date))}
                  </td>
                  {canManage && (
                    <td className="px-6 py-4 text-right align-top">
                      <CostDeleteButton id={r.id} />
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </ContentCard>
      )}
    </div>
  );
}
