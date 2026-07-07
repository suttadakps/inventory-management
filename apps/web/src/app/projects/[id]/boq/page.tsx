import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { requireUser } from "@/lib/auth/session";
import { canManageBoq } from "@/lib/boq/permissions";
import { listBoqsForProject } from "@/lib/boq/repository";
import {
  createBoqAction,
  duplicateBoqAction,
  newVersionBoqAction,
} from "@/lib/boq/actions";
import { BoqStatusBadge } from "@/components/boq/BoqStatusBadge";
import { ContentCard } from "@/components/ui/ContentCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Input } from "@/components/ui/Input";
import { formatBaht, formatPct } from "@/lib/format";

export const metadata: Metadata = { title: "BOQ · ARTIVERGES NEXT" };

export default async function ProjectBoqListPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id: projectId } = await params;

  const data = await listBoqsForProject(user, projectId);
  if (!data) notFound();

  const canManage = canManageBoq(user.role);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link
            href={`/projects/${projectId}`}
            className="text-body-sm text-text-secondary hover:underline"
          >
            ← {data.project.name}
          </Link>
          <h2 className="mt-1 text-h2 font-bold text-text-primary">
            BOQ / รายการประมาณราคา
          </h2>
          <p className="text-body-sm text-text-secondary">
            {data.project.code} · {data.project.clientName}
          </p>
        </div>
        <Link
          href={`/projects/${projectId}/quotations`}
          className="inline-flex h-9 items-center rounded-md border border-primary-700 px-3 text-body-sm font-medium text-primary-700 hover:bg-primary-100"
        >
          ใบเสนอราคา →
        </Link>
      </div>

      {canManage && (
        <ContentCard className="p-4">
          <form
            action={createBoqAction}
            className="flex flex-wrap items-end gap-3"
          >
            <input type="hidden" name="projectId" value={projectId} />
            <div className="min-w-56 flex-1 space-y-1.5">
              <label
                htmlFor="title"
                className="text-body-sm font-medium text-text-primary"
              >
                หัวข้อ BOQ ใหม่
              </label>
              <Input id="title" name="title" placeholder="เช่น BOQ หลัก" />
            </div>
            <button
              type="submit"
              className="inline-flex h-10 items-center justify-center rounded-md bg-primary-700 px-4 text-body-sm font-medium text-white transition-colors hover:bg-primary-600"
            >
              + สร้าง BOQ
            </button>
          </form>
        </ContentCard>
      )}

      {data.boqs.length === 0 ? (
        <div className="rounded-lg border border-dashed border-[#ddd6c8] bg-white p-10 text-center text-body-sm text-text-secondary">
          ยังไม่มี BOQ สำหรับโปรเจคนี้
        </div>
      ) : (
        <ContentCard className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-body-sm">
            <thead className="border-b border-[#f0ece2] text-caption font-medium uppercase tracking-wide text-text-secondary">
              <tr>
                <th className="px-6 py-3">BOQ</th>
                <th className="px-6 py-3">สถานะ</th>
                <th className="px-6 py-3 text-right">ต้นทุน</th>
                <th className="px-6 py-3 text-right">ราคาขาย</th>
                <th className="px-6 py-3 text-right">กำไร</th>
                <th className="px-6 py-3 text-right">
                  <span className="sr-only">การจัดการ</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0ece2]">
              {data.boqs.map((b) => (
                <tr key={b.id} className="hover:bg-[#faf8f3]">
                  <td className="px-6 py-4 align-top">
                    <Link
                      href={`/projects/${projectId}/boq/${b.id}`}
                      className="font-semibold text-text-primary hover:underline"
                    >
                      {b.title ?? `BOQ v${b.version}`}
                    </Link>
                    <div className="mt-0.5 flex items-center gap-2 text-caption text-text-secondary">
                      <span>v{b.version}</span>
                      {b.isLatest && (
                        <StatusBadge tone="navy">ล่าสุด</StatusBadge>
                      )}
                      <span>· {b.totals.itemCount} รายการ</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 align-top">
                    <BoqStatusBadge status={b.status} />
                  </td>
                  <td className="px-6 py-4 text-right align-top tabular-nums text-text-secondary">
                    {formatBaht(b.totals.costTotal, true)}
                  </td>
                  <td className="px-6 py-4 text-right align-top tabular-nums text-text-primary">
                    {formatBaht(b.totals.sellingTotal, true)}
                  </td>
                  <td className="px-6 py-4 text-right align-top tabular-nums text-text-primary">
                    {formatPct(b.totals.marginPct)}
                  </td>
                  <td className="px-6 py-4 align-top">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        href={`/projects/${projectId}/boq/${b.id}`}
                        className="text-body-sm font-medium text-primary-700 hover:underline"
                      >
                        เปิด
                      </Link>
                      {canManage && (
                        <>
                          <form action={duplicateBoqAction}>
                            <input type="hidden" name="boqId" value={b.id} />
                            <button
                              type="submit"
                              className="text-body-sm text-text-secondary hover:underline"
                            >
                              ทำสำเนา
                            </button>
                          </form>
                          <form action={newVersionBoqAction}>
                            <input type="hidden" name="boqId" value={b.id} />
                            <button
                              type="submit"
                              className="text-body-sm text-text-secondary hover:underline"
                            >
                              เวอร์ชันใหม่
                            </button>
                          </form>
                        </>
                      )}
                    </div>
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
