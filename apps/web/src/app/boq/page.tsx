import type { Metadata } from "next";
import Link from "next/link";

import { requireUser } from "@/lib/auth/session";
import { listAllBoqs } from "@/lib/boq/repository";
import { canManageBoq } from "@/lib/boq/permissions";
import { listProjects } from "@/lib/projects/repository";
import { createBoqAction } from "@/lib/boq/actions";
import { BoqStatusBadge } from "@/components/boq/BoqStatusBadge";
import { ContentCard } from "@/components/ui/ContentCard";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { formatBaht } from "@/lib/format";

export const metadata: Metadata = { title: "BOQ / ใบเสนอราคา · ARTIVERGES NEXT" };

const dateFmt = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

export default async function BoqIndexPage() {
  const user = await requireUser();
  const [boqs, projects] = await Promise.all([
    listAllBoqs(user),
    listProjects(user, {}),
  ]);
  const canManage = canManageBoq(user.role);

  return (
    <div className="space-y-4">
      {/* Create a new BOQ — standalone by default, or under a project */}
      {canManage && (
        <ContentCard className="p-4">
          <form
            action={createBoqAction}
            className="flex flex-wrap items-end gap-3"
          >
            <div className="min-w-48 flex-1 space-y-1.5">
              <label
                htmlFor="title"
                className="text-body-sm font-medium text-text-primary"
              >
                ชื่อโปรเจค / หัวข้อ BOQ
              </label>
              <Input
                id="title"
                name="title"
                placeholder="เช่น สนาม Pickleball — BOQ"
              />
            </div>
            {projects.length > 0 && (
              <div className="min-w-56 flex-1 space-y-1.5">
                <label
                  htmlFor="projectId"
                  className="text-body-sm font-medium text-text-primary"
                >
                  ผูกกับโปรเจค (ไม่บังคับ)
                </label>
                <Select id="projectId" name="projectId" defaultValue="">
                  <option value="">— ไม่ผูกโปรเจค (สร้างเดี่ยว) —</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.code})
                    </option>
                  ))}
                </Select>
              </div>
            )}
            <button
              type="submit"
              className="inline-flex h-10 items-center justify-center rounded-md bg-primary-700 px-4 text-body-sm font-medium text-white transition-colors hover:bg-primary-600"
            >
              + สร้าง BOQ ใหม่
            </button>
          </form>
        </ContentCard>
      )}

      {boqs.length === 0 ? (
        <div className="rounded-lg border border-dashed border-[#ddd6c8] bg-white p-10 text-center">
          <p className="text-body font-medium text-text-primary">
            ยังไม่มี BOQ
          </p>
          <p className="mt-1 text-body-sm text-text-secondary">
            {canManage
              ? "กรอกชื่อ แล้วกด “+ สร้าง BOQ ใหม่” ด้านบนเพื่อเริ่มต้น"
              : "ยังไม่มีเอกสาร BOQ"}
          </p>
        </div>
      ) : (
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
                      href={
                        b.project
                          ? `/projects/${b.project.id}/boq/${b.id}`
                          : `/boq/${b.id}`
                      }
                      className="font-semibold text-text-primary hover:underline"
                    >
                      {b.title || `BOQ v${b.version}`}
                    </Link>
                    <div className="mt-0.5 text-caption text-text-secondary">
                      v{b.version}
                    </div>
                  </td>
                  <td className="px-6 py-4 align-top">
                    {b.project ? (
                      <>
                        <Link
                          href={`/projects/${b.project.id}`}
                          className="text-text-primary hover:underline"
                        >
                          {b.project.name}
                        </Link>
                        <div className="text-caption text-text-secondary">
                          {b.project.code} · {b.project.clientName}
                        </div>
                      </>
                    ) : (
                      <span className="text-text-secondary">เอกสารเดี่ยว</span>
                    )}
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
      )}
    </div>
  );
}
