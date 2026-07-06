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
import { formatMoney } from "@/lib/format";

export const metadata: Metadata = { title: "Quotations · ARTIVERGES NEXT" };

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
    <div className="space-y-6">
      <div>
        <Link
          href={`/projects/${projectId}`}
          className="text-body-sm text-text-secondary hover:underline"
        >
          ← {data.project.name}
        </Link>
        <h1 className="mt-1 text-h1 font-bold text-text-primary">Quotations</h1>
        <p className="font-mono text-body-sm text-text-secondary">
          {data.project.code} · {data.project.clientName}
        </p>
      </div>

      {canManage && (
        <GenerateQuotation projectId={projectId} approvedBoqs={approvedBoqs} />
      )}

      {data.quotations.length === 0 ? (
        <div className="rounded-md border border-dashed border-border bg-surface p-10 text-center text-body-sm text-text-secondary">
          No quotations yet for this project.
        </div>
      ) : (
        <div className="overflow-hidden rounded-md border border-border bg-surface">
          <table className="w-full text-left text-body-sm">
            <thead className="border-b border-border bg-bg text-caption uppercase tracking-wide text-text-secondary">
              <tr>
                <th className="px-4 py-3 font-medium">Quotation</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="hidden px-4 py-3 font-medium md:table-cell">
                  Issued
                </th>
                <th className="hidden px-4 py-3 font-medium md:table-cell">
                  Expires
                </th>
                <th className="px-4 py-3 text-right font-medium">Grand total</th>
                <th className="px-4 py-3 text-right font-medium">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.quotations.map((q) => (
                <tr key={q.id} className="hover:bg-primary-100/40">
                  <td className="px-4 py-3">
                    <Link
                      href={`/projects/${projectId}/quotations/${q.id}`}
                      className="font-medium text-primary-700 hover:underline"
                    >
                      {q.quotationNo}
                    </Link>
                    <div className="mt-0.5 text-caption text-text-secondary">
                      {q.title ?? `Revision v${q.version}`} · v{q.version}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <QuotationStatusBadge status={q.status} expired={q.expired} />
                  </td>
                  <td className="hidden px-4 py-3 text-text-secondary md:table-cell">
                    {q.issueDate ?? "—"}
                  </td>
                  <td className="hidden px-4 py-3 text-text-secondary md:table-cell">
                    {q.expiryDate ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums text-text-primary">
                    {formatMoney(q.total, true)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/projects/${projectId}/quotations/${q.id}`}
                      className="text-body-sm font-medium text-primary-600 hover:underline"
                    >
                      Open
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
