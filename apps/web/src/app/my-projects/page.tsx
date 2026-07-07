import type { Metadata } from "next";
import Link from "next/link";

import { requireUser } from "@/lib/auth/session";
import { listAeCommission } from "@/lib/projects/repository";
import { ContentCard } from "@/components/ui/ContentCard";
import { MetricCard } from "@/components/ui/MetricCard";
import { StatusBadge, type StatusTone } from "@/components/ui/StatusBadge";
import { formatBaht } from "@/lib/format";

export const metadata: Metadata = {
  title: "โปรเจคของฉัน (AE) · ARTIVERGES NEXT",
};

const STATUS_TH: Record<string, { label: string; tone: StatusTone }> = {
  planning: { label: "วางแผน", tone: "tan" },
  active: { label: "กำลังดำเนินการ", tone: "navy" },
  on_hold: { label: "พักงาน", tone: "amber" },
  completed: { label: "เสร็จสิ้น", tone: "green" },
  warranty: { label: "รับประกัน", tone: "navy" },
  closed: { label: "ปิดงาน", tone: "gray" },
};

export default async function MyProjectsPage() {
  const user = await requireUser();
  const data = await listAeCommission(user);

  return (
    <div className="space-y-5">
      {/* Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MetricCard
          label="มูลค่าที่ขายได้ทั้งหมด"
          value={formatBaht(data.totalSold, true)}
        />
        <MetricCard
          label="ค่าคอมมิชชั่นที่ได้รับแล้ว"
          value={formatBaht(data.totalReceived, true)}
          tone="green"
        />
        <MetricCard
          label="ค่าคอมมิชชั่นค้างรับ (ตามยอดเก็บเงิน)"
          value={formatBaht(data.totalOutstanding, true)}
          tone="orange"
        />
      </div>

      {/* Per-project commission */}
      {data.rows.length === 0 ? (
        <div className="rounded-lg border border-dashed border-[#ddd6c8] bg-white p-10 text-center">
          <p className="text-body font-medium text-text-primary">
            ยังไม่มีโปรเจค
          </p>
          <p className="mt-1 text-body-sm text-text-secondary">
            เมื่อคุณเป็นผู้ดูแลโปรเจค รายการค่าคอมมิชชั่นจะแสดงที่นี่ —{" "}
            <Link href="/projects" className="text-primary-700 hover:underline">
              ไปที่โปรเจค
            </Link>
          </p>
        </div>
      ) : (
        <ContentCard className="overflow-x-auto">
          <table className="w-full min-w-[880px] text-left text-body-sm">
            <thead className="border-b border-[#f0ece2] text-caption font-medium uppercase tracking-wide text-text-secondary">
              <tr>
                <th className="px-6 py-3">โปรเจค</th>
                <th className="px-6 py-3 text-right">มูลค่า</th>
                <th className="px-6 py-3 text-right">คอมมิชชั่น</th>
                <th className="px-6 py-3 text-right">ได้รับแล้ว</th>
                <th className="px-6 py-3 text-right">ค้างรับ</th>
                <th className="px-6 py-3">สถานะ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0ece2]">
              {data.rows.map((r) => {
                const st = STATUS_TH[r.status] ?? {
                  label: r.status,
                  tone: "gray" as StatusTone,
                };
                return (
                  <tr key={r.id} className="hover:bg-[#faf8f3]">
                    <td className="px-6 py-4 align-top">
                      <Link
                        href={`/projects/${r.id}`}
                        className="font-semibold text-text-primary hover:underline"
                      >
                        {r.name}
                      </Link>
                      <div className="text-caption text-text-secondary">
                        {r.clientName}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right align-top tabular-nums text-text-primary">
                      {formatBaht(r.contractValue, true)}
                    </td>
                    <td className="px-6 py-4 text-right align-top font-semibold tabular-nums text-text-primary">
                      {formatBaht(r.commission, true)}
                    </td>
                    <td className="px-6 py-4 text-right align-top tabular-nums text-success">
                      {formatBaht(r.received, true)}
                    </td>
                    <td className="px-6 py-4 text-right align-top tabular-nums text-accent-600">
                      {formatBaht(r.outstanding, true)}
                    </td>
                    <td className="px-6 py-4 align-top">
                      <StatusBadge tone={st.tone}>{st.label}</StatusBadge>
                    </td>
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
