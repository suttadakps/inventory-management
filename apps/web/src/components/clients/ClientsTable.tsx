import Link from "next/link";

import type { ClientListItem } from "@/lib/clients/repository";
import { ContentCard } from "@/components/ui/ContentCard";
import { StatusBadge } from "@/components/ui/StatusBadge";

const TYPE_TH: Record<string, string> = {
  individual: "บุคคลธรรมดา",
  business: "นิติบุคคล",
};

/** Clients table styled to the ARTIVERGES NEXT cream/white design (Thai). */
export function ClientsTable({ items }: { items: ClientListItem[] }) {
  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-[#ddd6c8] bg-white p-10 text-center">
        <p className="text-body font-medium text-text-primary">ไม่พบลูกค้า</p>
        <p className="mt-1 text-body-sm text-text-secondary">
          เพิ่มลูกค้าใหม่เพื่อเริ่มต้น
        </p>
      </div>
    );
  }

  return (
    <ContentCard className="overflow-x-auto">
      <table className="w-full min-w-[820px] text-left text-body-sm">
        <thead className="border-b border-[#f0ece2] text-caption font-medium uppercase tracking-wide text-text-secondary">
          <tr>
            <th className="px-6 py-3">ลูกค้า</th>
            <th className="px-6 py-3">ผู้ติดต่อ</th>
            <th className="px-6 py-3">อีเมล</th>
            <th className="px-6 py-3">เบอร์โทร</th>
            <th className="px-6 py-3 text-right">โปรเจค</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#f0ece2]">
          {items.map((c) => (
            <tr key={c.id} className="hover:bg-[#faf8f3]">
              <td className="px-6 py-4 align-top">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/clients/${c.id}`}
                    className="font-semibold text-text-primary hover:underline"
                  >
                    {c.name}
                  </Link>
                  {c.archived && <StatusBadge tone="gray">เก็บถาวร</StatusBadge>}
                </div>
                <div className="mt-0.5 text-caption text-text-secondary">
                  {TYPE_TH[c.type] ?? c.type}
                </div>
              </td>
              <td className="px-6 py-4 align-top text-text-primary">
                {c.contactPerson ?? "—"}
              </td>
              <td className="px-6 py-4 align-top text-text-primary">
                {c.email ?? "—"}
              </td>
              <td className="px-6 py-4 align-top text-text-primary">
                {c.phone ?? "—"}
              </td>
              <td className="px-6 py-4 text-right align-top tabular-nums text-text-primary">
                {c.projectCount}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </ContentCard>
  );
}
