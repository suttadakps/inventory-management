import type { Metadata } from "next";
import Link from "next/link";

import { requireUser } from "@/lib/auth/session";
import { listAllBoqs } from "@/lib/boq/repository";
import { BoqStatusBadge } from "@/components/boq/BoqStatusBadge";
import { ContentCard } from "@/components/ui/ContentCard";
import { formatBaht } from "@/lib/format";

export const metadata: Metadata = { title: "BOQ / ใบเสนอราคา · ARTIVERGES NEXT" };

const dateFmt = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

export default async function BoqIndexPage() {
  const user = await requireUser();
  const boqs = await listAllBoqs(user);

  if (boqs.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-[#ddd6c8] bg-white p-10 text-center">
        <p className="text-body font-medium text-text-primary">ยังไม่มี BOQ</p>
        <p className="mt-1 text-body-sm text-text-secondary">
          เปิดโปรเจคแล้วสร้าง BOQ เพื่อเริ่มต้น —{" "}
          <Link href="/projects" className="text-primary-700 hover:underline">
            ไปที่โปรเจค
          </Link>
        </p>
      </div>
    );
  }

  return (
    <ContentCard className="overflow-x-auto">
      <table className="w-full min-w-[820px] text-left text-body-sm">
        <thead className="border-b border-[#f0ece2] text-caption font-medium uppercase tracking-wide text-text-secondary">
          <tr>
            <th className="px-6 py-3">BOQ</th>
            <th className="px-6 py-3">โปรเจค</th>
            <th className="px-6 py-3">สถานะ</th>
            <th className="px-6 py-3 text-right">ยอดรวม</th>
            <th className="px-6 py-3">อัปเดตล่าสุด</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#f0ece2]">
          {boqs.map((b) => (
            <tr key={b.id} className="hover:bg-[#faf8f3]">
              <td className="px-6 py-4 align-top">
                <Link
                  href={`/projects/${b.project.id}/boq/${b.id}`}
                  className="font-semibold text-text-primary hover:underline"
                >
                  {b.title || `BOQ v${b.version}`}
                </Link>
                <div className="mt-0.5 text-caption text-text-secondary">
                  v{b.version}
                </div>
              </td>
              <td className="px-6 py-4 align-top">
                <Link
                  href={`/projects/${b.project.id}`}
                  className="text-text-primary hover:underline"
                >
                  {b.project.name}
                </Link>
                <div className="text-caption text-text-secondary">
                  {b.project.code} · {b.project.clientName}
                </div>
              </td>
              <td className="px-6 py-4 align-top">
                <BoqStatusBadge status={b.status} />
              </td>
              <td className="px-6 py-4 text-right align-top tabular-nums text-text-primary">
                {formatBaht(b.grandTotal, true)}
              </td>
              <td className="px-6 py-4 align-top text-text-secondary">
                {dateFmt.format(new Date(b.updatedAt))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </ContentCard>
  );
}
