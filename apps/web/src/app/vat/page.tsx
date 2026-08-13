import type { Metadata } from "next";
import Link from "next/link";

import { requireUser } from "@/lib/auth/session";
import { listVatFilings } from "@/lib/vat/repository";
import { canManageVat } from "@/lib/vat/permissions";
import { ContentCard } from "@/components/ui/ContentCard";
import { formatBaht } from "@/lib/format";

export const metadata: Metadata = { title: "ภ.พ.30 · ARTIVERGES NEXT" };

const MONTHS_TH = [
  "มกราคม",
  "กุมภาพันธ์",
  "มีนาคม",
  "เมษายน",
  "พฤษภาคม",
  "มิถุนายน",
  "กรกฎาคม",
  "สิงหาคม",
  "กันยายน",
  "ตุลาคม",
  "พฤศจิกายน",
  "ธันวาคม",
];

const now = new Date();

export default async function VatListPage() {
  const user = await requireUser();
  const canManage = canManageVat(user.role);
  const filings = canManage ? await listVatFilings() : [];

  return (
    <div className="space-y-5">
      {canManage && (
        <div className="flex justify-end">
          <Link
            href={`/vat/new?year=${now.getFullYear()}&month=${now.getMonth() + 1}`}
            className="inline-flex h-10 items-center rounded-md bg-primary-700 px-4 text-body-sm font-medium text-white hover:bg-primary-600"
          >
            + สร้างแบบ ภ.พ.30 เดือนนี้
          </Link>
        </div>
      )}

      {!canManage ? (
        <div className="rounded-lg border border-dashed border-[#ddd6c8] bg-white p-10 text-center text-body-sm text-text-secondary">
          ไม่มีสิทธิ์เข้าถึงหน้านี้
        </div>
      ) : filings.length === 0 ? (
        <div className="rounded-lg border border-dashed border-[#ddd6c8] bg-white p-10 text-center text-body-sm text-text-secondary">
          ยังไม่มีแบบ ภ.พ.30
        </div>
      ) : (
        <ContentCard className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-body-sm">
            <thead className="border-b border-[#f0ece2] text-caption font-medium uppercase tracking-wide text-text-secondary">
              <tr>
                <th className="px-6 py-3">เดือนภาษี</th>
                <th className="px-6 py-3 text-right">ภาษีขาย</th>
                <th className="px-6 py-3 text-right">ภาษีซื้อ</th>
                <th className="px-6 py-3 text-right">ภาษีสุทธิ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0ece2]">
              {filings.map((f) => {
                const net = f.salesVat - f.purchaseVat;
                return (
                  <tr key={f.id} className="hover:bg-[#faf8f3]">
                    <td className="px-6 py-4 align-top">
                      <Link
                        href={`/vat/${f.id}`}
                        className="font-semibold text-text-primary hover:underline"
                      >
                        {MONTHS_TH[f.periodMonth - 1]} {f.periodYear}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-right align-top tabular-nums text-text-primary">
                      {formatBaht(f.salesVat, true)}
                    </td>
                    <td className="px-6 py-4 text-right align-top tabular-nums text-text-primary">
                      {formatBaht(f.purchaseVat, true)}
                    </td>
                    <td
                      className={`px-6 py-4 text-right align-top font-semibold tabular-nums ${net >= 0 ? "text-accent-600" : "text-success"}`}
                    >
                      {net >= 0 ? "ต้องชำระ " : "ชำระเกิน "}
                      {formatBaht(Math.abs(net), true)}
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
