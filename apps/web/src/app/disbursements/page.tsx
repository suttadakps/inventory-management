import type { Metadata } from "next";

import { requireUser } from "@/lib/auth/session";
import { listProjects } from "@/lib/projects/repository";
import {
  listDisbursements,
  canApproveDisbursement,
  canSubmitDisbursement,
} from "@/lib/disbursements/repository";
import { ContentCard } from "@/components/ui/ContentCard";
import { StatusBadge, type StatusTone } from "@/components/ui/StatusBadge";
import { DisbursementForm } from "@/components/disbursements/DisbursementForm";
import { DisbursementActions } from "@/components/disbursements/DisbursementActions";
import { formatBaht } from "@/lib/format";

export const metadata: Metadata = { title: "เบิกเงิน · ARTIVERGES NEXT" };

const dateFmt = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

const STATUS_TH: Record<string, { label: string; tone: StatusTone }> = {
  pending: { label: "รออนุมัติ", tone: "amber" },
  approved: { label: "อนุมัติแล้ว", tone: "navy" },
  paid: { label: "จ่ายแล้ว", tone: "green" },
  rejected: { label: "ปฏิเสธ", tone: "red" },
};

export default async function DisbursementsPage() {
  const user = await requireUser();
  const [rows, projects] = await Promise.all([
    listDisbursements(user),
    listProjects(user, {}),
  ]);
  const canApprove = canApproveDisbursement(user.role);
  const canSubmit = canSubmitDisbursement(user.role);

  return (
    <div className="space-y-5">
      {canSubmit && (
        <DisbursementForm
          projects={projects.map((p) => ({ id: p.id, name: p.name }))}
          defaultName={user.fullName ?? user.email ?? ""}
        />
      )}

      {rows.length === 0 ? (
        <div className="rounded-lg border border-dashed border-[#ddd6c8] bg-white p-10 text-center text-body-sm text-text-secondary">
          ยังไม่มีคำขอเบิกเงิน
        </div>
      ) : (
        <ContentCard className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-body-sm">
            <thead className="border-b border-[#f0ece2] text-caption font-medium uppercase tracking-wide text-text-secondary">
              <tr>
                <th className="px-6 py-3">ผู้เบิก</th>
                <th className="px-6 py-3">โปรเจค</th>
                <th className="px-6 py-3 text-right">จำนวนเงิน</th>
                <th className="px-6 py-3">เหตุผล</th>
                <th className="px-6 py-3">วันที่ต้องการ</th>
                <th className="px-6 py-3">สถานะ</th>
                {canApprove && <th className="px-6 py-3" />}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0ece2]">
              {rows.map((r) => {
                const st = STATUS_TH[r.status] ?? {
                  label: r.status,
                  tone: "gray" as StatusTone,
                };
                return (
                  <tr key={r.id} className="hover:bg-[#faf8f3]">
                    <td className="px-6 py-4 align-top font-semibold text-text-primary">
                      {r.requesterName}
                    </td>
                    <td className="px-6 py-4 align-top text-text-secondary">
                      {r.projectName ?? "—"}
                    </td>
                    <td className="px-6 py-4 text-right align-top font-semibold tabular-nums text-text-primary">
                      {formatBaht(r.amount, true)}
                    </td>
                    <td className="px-6 py-4 align-top text-text-primary">
                      {r.reason ?? "—"}
                    </td>
                    <td className="px-6 py-4 align-top text-text-secondary">
                      {r.neededDate
                        ? dateFmt.format(new Date(r.neededDate))
                        : "—"}
                    </td>
                    <td className="px-6 py-4 align-top">
                      <StatusBadge tone={st.tone}>{st.label}</StatusBadge>
                    </td>
                    {canApprove && (
                      <td className="px-6 py-4 align-top">
                        <DisbursementActions id={r.id} status={r.status} />
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
