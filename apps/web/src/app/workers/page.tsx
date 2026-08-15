import type { Metadata } from "next";
import Link from "next/link";

import { requireUser } from "@/lib/auth/session";
import { listWorkers } from "@/lib/workers/repository";
import { canManageWorkers } from "@/lib/workers/permissions";
import { ContentCard } from "@/components/ui/ContentCard";

export const metadata: Metadata = { title: "รายชื่อช่าง · ARTIVERGES NEXT" };

export default async function WorkersListPage() {
  const user = await requireUser();
  const canManage = canManageWorkers(user.role);
  const workers = canManage ? await listWorkers() : [];

  return (
    <div className="space-y-5">
      {canManage && (
        <div className="flex justify-end">
          <Link
            href="/workers/new"
            className="inline-flex h-10 items-center rounded-md bg-primary-700 px-4 text-body-sm font-medium text-white hover:bg-primary-600"
          >
            + เพิ่มช่างใหม่
          </Link>
        </div>
      )}

      {!canManage ? (
        <div className="rounded-lg border border-dashed border-[#ddd6c8] bg-white p-10 text-center text-body-sm text-text-secondary">
          ไม่มีสิทธิ์เข้าถึงหน้านี้
        </div>
      ) : workers.length === 0 ? (
        <div className="rounded-lg border border-dashed border-[#ddd6c8] bg-white p-10 text-center text-body-sm text-text-secondary">
          ยังไม่มีรายชื่อช่าง
        </div>
      ) : (
        <ContentCard className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-body-sm">
            <thead className="border-b border-[#f0ece2] text-caption font-medium uppercase tracking-wide text-text-secondary">
              <tr>
                <th className="px-6 py-3">ชื่อ</th>
                <th className="px-6 py-3">ตำแหน่ง</th>
                <th className="px-6 py-3">เบอร์โทร</th>
                <th className="px-6 py-3">เลขประจำตัวผู้เสียภาษี</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0ece2]">
              {workers.map((w) => (
                <tr key={w.id} className="hover:bg-[#faf8f3]">
                  <td className="px-6 py-4 align-top">
                    <Link
                      href={`/workers/${w.id}`}
                      className="font-semibold text-text-primary hover:underline"
                    >
                      {w.name}
                    </Link>
                  </td>
                  <td className="px-6 py-4 align-top text-text-secondary">
                    {w.position ?? "—"}
                  </td>
                  <td className="px-6 py-4 align-top text-text-secondary">
                    {w.phone ?? "—"}
                  </td>
                  <td className="px-6 py-4 align-top text-text-secondary">
                    {w.taxId ?? "—"}
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
