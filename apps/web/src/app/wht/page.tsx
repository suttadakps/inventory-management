import type { Metadata } from "next";
import Link from "next/link";

import { requireUser } from "@/lib/auth/session";
import { listWhtCertificates } from "@/lib/wht/repository";
import { canManageWht } from "@/lib/wht/permissions";
import { ContentCard } from "@/components/ui/ContentCard";
import { formatBaht } from "@/lib/format";

export const metadata: Metadata = { title: "ใบทวิ 50 · ARTIVERGES NEXT" };

const dateFmt = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

export default async function WhtListPage() {
  const user = await requireUser();
  const canManage = canManageWht(user.role);
  const certs = canManage ? await listWhtCertificates(user) : [];

  return (
    <div className="space-y-5">
      {canManage && (
        <div className="flex justify-end">
          <Link
            href="/wht/new"
            className="inline-flex h-10 items-center rounded-md bg-primary-700 px-4 text-body-sm font-medium text-white hover:bg-primary-600"
          >
            + ออกใบทวิ 50 ใหม่
          </Link>
        </div>
      )}

      {!canManage ? (
        <div className="rounded-lg border border-dashed border-[#ddd6c8] bg-white p-10 text-center text-body-sm text-text-secondary">
          ไม่มีสิทธิ์เข้าถึงหน้านี้
        </div>
      ) : certs.length === 0 ? (
        <div className="rounded-lg border border-dashed border-[#ddd6c8] bg-white p-10 text-center text-body-sm text-text-secondary">
          ยังไม่มีใบทวิ 50
        </div>
      ) : (
        <ContentCard className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-body-sm">
            <thead className="border-b border-[#f0ece2] text-caption font-medium uppercase tracking-wide text-text-secondary">
              <tr>
                <th className="px-6 py-3">ผู้ถูกหักภาษี</th>
                <th className="px-6 py-3">โปรเจค</th>
                <th className="px-6 py-3">เล่มที่/เลขที่</th>
                <th className="px-6 py-3 text-right">จำนวนเงินที่จ่าย</th>
                <th className="px-6 py-3 text-right">ภาษีที่หัก</th>
                <th className="px-6 py-3">วันที่จ่าย</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0ece2]">
              {certs.map((c) => (
                <tr key={c.id} className="hover:bg-[#faf8f3]">
                  <td className="px-6 py-4 align-top">
                    <Link
                      href={`/wht/${c.id}`}
                      className="font-semibold text-text-primary hover:underline"
                    >
                      {c.payeeName}
                    </Link>
                  </td>
                  <td className="px-6 py-4 align-top text-text-secondary">
                    {c.projectName ?? "—"}
                  </td>
                  <td className="px-6 py-4 align-top text-text-secondary">
                    {c.bookNo || "—"} / {c.docNo || "—"}
                  </td>
                  <td className="px-6 py-4 text-right align-top tabular-nums text-text-primary">
                    {formatBaht(c.amountPaid, true)}
                  </td>
                  <td className="px-6 py-4 text-right align-top tabular-nums text-text-primary">
                    {formatBaht(c.taxWithheld, true)}
                  </td>
                  <td className="px-6 py-4 align-top text-text-secondary">
                    {dateFmt.format(new Date(c.paymentDate))}
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
