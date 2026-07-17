import Link from "next/link";

import type { ProjectListItem } from "@/lib/projects/repository";
import { STATUS_TH } from "@/lib/projects/statusLabels";
import { StatusBadge } from "@/components/ui/StatusBadge";

const baht0 = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  maximumFractionDigits: 0,
});
const dateFmt = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

function baht(value: number | null): string {
  return value === null ? "—" : baht0.format(value);
}

export function ProjectsTable({ items }: { items: ProjectListItem[] }) {
  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-[#ddd6c8] bg-white p-10 text-center">
        <p className="text-body font-medium text-text-primary">ไม่พบโปรเจค</p>
        <p className="mt-1 text-body-sm text-text-secondary">
          สร้างโปรเจคใหม่เพื่อเริ่มต้น
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-[#ece7db] bg-white shadow-1">
      <table className="w-full min-w-[820px] text-left text-body-sm">
        <thead className="border-b border-[#f0ece2] text-caption font-medium uppercase tracking-wide text-text-secondary">
          <tr>
            <th className="px-6 py-3">โปรเจค</th>
            <th className="px-6 py-3">ลูกค้า</th>
            <th className="px-6 py-3">มูลค่า</th>
            <th className="px-6 py-3">Progress</th>
            <th className="px-6 py-3">ส่งมอบ</th>
            <th className="px-6 py-3">สถานะ</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#f0ece2]">
          {items.map((p) => {
            const st = STATUS_TH[p.status as keyof typeof STATUS_TH] ?? {
              label: p.status,
              tone: "gray" as const,
            };
            return (
              <tr key={p.id} className="hover:bg-[#faf8f3]">
                <td className="px-6 py-4 align-top">
                  <Link
                    href={`/projects/${p.id}`}
                    className="font-semibold text-text-primary hover:underline"
                  >
                    {p.name}
                  </Link>
                  <div className="mt-0.5 text-caption text-text-secondary">
                    อัปเดตล่าสุด: {dateFmt.format(new Date(p.updatedAt))}
                    {p.archived ? " · เก็บถาวร" : ""}
                  </div>
                </td>
                <td className="px-6 py-4 align-top text-text-primary">
                  {p.clientName}
                </td>
                <td className="px-6 py-4 align-top tabular-nums text-text-primary">
                  {baht(p.contractValue)}
                </td>
                <td className="px-6 py-4 align-top tabular-nums text-text-secondary">
                  {Math.round(p.progress)}%
                </td>
                <td className="px-6 py-4 align-top text-text-primary">
                  {p.endDate ? dateFmt.format(new Date(p.endDate)) : "—"}
                </td>
                <td className="px-6 py-4 align-top">
                  <StatusBadge tone={st.tone}>{st.label}</StatusBadge>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
