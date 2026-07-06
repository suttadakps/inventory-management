import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { requireUser } from "@/lib/auth/session";
import { canManageQuotation } from "@/lib/quotation/permissions";
import {
  listQuotationsForProject,
  listApprovedBoqs,
} from "@/lib/quotation/repository";
import { QuotationStatusBadge } from "@/components/quotation/QuotationStatusBadge";
import { GenerateQuotation } from "@/components/quotation/GenerateQuotation";
import { ContentCard } from "@/components/ui/ContentCard";
import { formatBaht } from "@/lib/format";

export const metadata: Metadata = { title: "ใบเสนอราคา · ARTIVERGES NEXT" };

export default async function ProjectQuotationsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id: projectId } = await params;

  const data = await listQuotationsForProject(user, projectId);
  if (!data) notFound();

  const canManage = canManageQuotation(user.role);
  const approvedBoqs = canManage ? await listApprovedBoqs(projectId) : [];

  return (
    <div className="space-y-5">
      <div>
        <Link
          href={`/projects/${projectId}`}
          className="text-body-sm text-text-secondary hover:underline"
        >
          ← {data.project.name}
        </Link>
        <h2 className="mt-1 text-h2 font-bold text-text-primary">ใบเสนอราคา</h2>
        <p className="text-body-sm text-text-secondary">
          {data.project.code} · {data.project.clientName}
        </p>
      </div>

      {canManage && (
        <GenerateQuotation projectId={projectId} approvedBoqs={approvedBoqs} />
      )}

      {data.quotations.length === 0 ? (
        <div className="rounded-lg border border-dashed border-[#ddd6c8] bg-white p-10 text-center text-body-sm text-text-secondary">
          ยังไม่มีใบเสนอราคาสำหรับโปรเจคนี้
        </div>
      ) : (
        <ContentCard className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-body-sm">
            <thead className="border-b border-[#f0ece2] text-caption font-medium uppercase tracking-wide text-text-secondary">
              <tr>
                <th className="px-6 py-3">ใบเสนอราคา</th>
                <th className="px-6 py-3">สถานะ</th>
                <th className="px-6 py-3">วันที่ออก</th>
                <th className="px-6 py-3">หมดอายุ</th>
                <th className="px-6 py-3 text-right">ยอดรวม</th>
                <th className="px-6 py-3 text-right">
                  <span className="sr-only">การจัดการ</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0ece2]">
              {data.quotations.map((q) => (
                <tr key={q.id} className="hover:bg-[#faf8f3]">
                  <td className="px-6 py-4 align-top">
                    <Link
                      href={`/projects/${projectId}/quotations/${q.id}`}
                      className="font-semibold text-text-primary hover:underline"
                    >
                      {q.quotationNo}
                    </Link>
                    <div className="mt-0.5 text-caption text-text-secondary">
                      {q.title ?? `แก้ไขครั้งที่ ${q.version}`} · v{q.version}
                    </div>
                  </td>
                  <td className="px-6 py-4 align-top">
                    <QuotationStatusBadge
                      status={q.status}
                      expired={q.expired}
                    />
                  </td>
                  <td className="px-6 py-4 align-top text-text-secondary">
                    {q.issueDate ?? "—"}
                  </td>
                  <td className="px-6 py-4 align-top text-text-secondary">
                    {q.expiryDate ?? "—"}
                  </td>
                  <td className="px-6 py-4 text-right align-top tabular-nums text-text-primary">
                    {formatBaht(q.total, true)}
                  </td>
                  <td className="px-6 py-4 text-right align-top">
                    <Link
                      href={`/projects/${projectId}/quotations/${q.id}`}
                      className="text-body-sm font-medium text-primary-700 hover:underline"
                    >
                      เปิด
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </ContentCard>
      )}
    </div>
  );
}
