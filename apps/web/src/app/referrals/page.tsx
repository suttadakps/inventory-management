import type { Metadata } from "next";

import { listReferrals } from "@/lib/referrals/repository";
import { ContentCard } from "@/components/ui/ContentCard";
import { MetricCard } from "@/components/ui/MetricCard";
import { ReferralRow } from "@/components/referrals/ReferralRow";
import { ReferralAddForm } from "@/components/referrals/ReferralAddForm";

export const metadata: Metadata = {
  title: "พาร์ทเนอร์แนะนำงาน · ARTIVERGES NEXT",
};

export default async function ReferralsPage() {
  const rows = await listReferrals();
  const pending = rows.filter(
    (r) => r.status === "new" || r.status === "contacted"
  ).length;
  const won = rows.filter((r) => r.status === "won").length;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MetricCard label="งานที่แนะนำทั้งหมด" value={String(rows.length)} />
        <MetricCard label="รอติดตาม" value={String(pending)} tone="orange" />
        <MetricCard label="ปิดการขาย" value={String(won)} tone="green" />
      </div>

      <ReferralAddForm />

      {rows.length === 0 ? (
        <div className="rounded-lg border border-dashed border-[#ddd6c8] bg-white p-10 text-center text-body-sm text-text-secondary">
          ยังไม่มีงานที่แนะนำเข้ามา
        </div>
      ) : (
        <ContentCard className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-body-sm">
            <thead className="border-b border-[#f0ece2] text-caption font-medium uppercase tracking-wide text-text-secondary">
              <tr>
                <th className="px-6 py-3">ผู้แนะนำ</th>
                <th className="px-6 py-3">งานที่แนะนำ</th>
                <th className="px-6 py-3 text-right">งบประมาณ</th>
                <th className="px-6 py-3">สถานะติดต่อกลับ</th>
                <th className="px-6 py-3">บันทึกการติดต่อ</th>
                <th className="px-6 py-3 text-right" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0ece2]">
              {rows.map((r) => (
                <ReferralRow key={r.id} row={r} />
              ))}
            </tbody>
          </table>
        </ContentCard>
      )}
    </div>
  );
}
