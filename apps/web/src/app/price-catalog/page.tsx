import type { Metadata } from "next";
import Link from "next/link";

import { requireUser } from "@/lib/auth/session";
import { listPriceCatalogItems } from "@/lib/price-catalog/repository";
import { canManagePriceCatalog } from "@/lib/price-catalog/permissions";
import { ContentCard } from "@/components/ui/ContentCard";
import { formatBaht } from "@/lib/format";

export const metadata: Metadata = { title: "ราคากลาง · ARTIVERGES NEXT" };

export default async function PriceCatalogListPage() {
  const user = await requireUser();
  const canManage = canManagePriceCatalog(user.role);
  const items = await listPriceCatalogItems();

  return (
    <div className="space-y-5">
      {canManage && (
        <div className="flex justify-end">
          <Link
            href="/price-catalog/new"
            className="inline-flex h-10 items-center rounded-md bg-primary-700 px-4 text-body-sm font-medium text-white hover:bg-primary-600"
          >
            + เพิ่มรายการราคากลาง
          </Link>
        </div>
      )}

      {items.length === 0 ? (
        <div className="rounded-lg border border-dashed border-[#ddd6c8] bg-white p-10 text-center text-body-sm text-text-secondary">
          ยังไม่มีรายการราคากลาง
        </div>
      ) : (
        <ContentCard className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-body-sm">
            <thead className="border-b border-[#f0ece2] text-caption font-medium uppercase tracking-wide text-text-secondary">
              <tr>
                <th className="px-6 py-3">รายการ</th>
                <th className="px-6 py-3">หมวดหมู่</th>
                <th className="px-6 py-3">หน่วย</th>
                <th className="px-6 py-3 text-right">ค่าของ</th>
                <th className="px-6 py-3 text-right">ค่าแรง</th>
                <th className="px-6 py-3 text-right">รวม</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0ece2]">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-[#faf8f3]">
                  <td className="px-6 py-4 align-top">
                    <Link
                      href={`/price-catalog/${item.id}`}
                      className="font-semibold text-text-primary hover:underline"
                    >
                      {item.name}
                    </Link>
                  </td>
                  <td className="px-6 py-4 align-top text-text-secondary">
                    {item.category ?? "—"}
                  </td>
                  <td className="px-6 py-4 align-top text-text-secondary">
                    {item.unit ?? "—"}
                  </td>
                  <td className="px-6 py-4 text-right align-top tabular-nums text-text-secondary">
                    {formatBaht(item.materialCost, true)}
                  </td>
                  <td className="px-6 py-4 text-right align-top tabular-nums text-text-secondary">
                    {formatBaht(item.laborCost, true)}
                  </td>
                  <td className="px-6 py-4 text-right align-top font-semibold tabular-nums text-text-primary">
                    {formatBaht(item.materialCost + item.laborCost, true)}
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
