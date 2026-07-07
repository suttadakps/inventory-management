import type { Metadata } from "next";
import Link from "next/link";

import { requireUser } from "@/lib/auth/session";
import { listPortalProjects } from "@/lib/projects/repository";
import { canViewAllProjects } from "@/lib/projects/permissions";
import { ContentCard } from "@/components/ui/ContentCard";
import { StatusBadge, type StatusTone } from "@/components/ui/StatusBadge";
import { formatBaht } from "@/lib/format";

export const metadata: Metadata = { title: "พอร์ทัลลูกค้า · ARTIVERGES NEXT" };

const dateFmt = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

const STATUS_TH: Record<string, { label: string; tone: StatusTone }> = {
  planning: { label: "วางแผน", tone: "tan" },
  active: { label: "กำลังดำเนินการ", tone: "navy" },
  on_hold: { label: "พักงาน", tone: "amber" },
  completed: { label: "เสร็จสิ้น", tone: "green" },
  warranty: { label: "รับประกัน", tone: "navy" },
  closed: { label: "ปิดงาน", tone: "gray" },
};

function Fact({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div>
      <div className="text-caption text-text-secondary">{label}</div>
      <div className={`text-body font-semibold tabular-nums ${tone ?? "text-text-primary"}`}>
        {value}
      </div>
    </div>
  );
}

export default async function PortalPage() {
  const user = await requireUser();
  const projects = await listPortalProjects(user);
  const isInternal = canViewAllProjects(user.role);

  return (
    <div className="space-y-5">
      {isInternal && (
        <div className="flex justify-end">
          <Link
            href="/clients"
            className="text-body-sm font-medium text-primary-700 hover:underline"
          >
            จัดการข้อมูลลูกค้า →
          </Link>
        </div>
      )}

      {projects.length === 0 ? (
        <div className="rounded-lg border border-dashed border-[#ddd6c8] bg-white p-10 text-center text-body-sm text-text-secondary">
          ยังไม่มีโปรเจค
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {projects.map((p) => {
            const st = STATUS_TH[p.status] ?? {
              label: p.status,
              tone: "gray" as StatusTone,
            };
            const pct = Math.max(0, Math.min(100, Math.round(p.progress)));
            return (
              <ContentCard key={p.id} className="p-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-h3 font-semibold text-text-primary">
                      {p.name}
                    </h3>
                    <p className="text-caption text-text-secondary">
                      {p.code} · {p.clientName}
                    </p>
                  </div>
                  <StatusBadge tone={st.tone}>{st.label}</StatusBadge>
                </div>

                <div className="mt-4">
                  <div className="mb-1 flex items-center justify-between text-caption text-text-secondary">
                    <span>ความคืบหน้า</span>
                    <span className="tabular-nums text-text-primary">{pct}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-[#e7e1d5]">
                    <div
                      className="h-full rounded-full bg-primary-700"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <Fact label="มูลค่างาน" value={formatBaht(p.value, true)} />
                  <Fact
                    label="รับแล้ว"
                    value={formatBaht(p.received, true)}
                    tone="text-success"
                  />
                  <Fact
                    label="ค้างรับ"
                    value={formatBaht(p.outstanding, true)}
                    tone="text-accent-600"
                  />
                  <Fact
                    label="ส่งมอบ"
                    value={p.endDate ? dateFmt.format(new Date(p.endDate)) : "—"}
                  />
                </div>

                <div className="mt-5 flex flex-wrap gap-2 border-t border-[#f0ece2] pt-4">
                  <Link
                    href={`/projects/${p.id}/quotations`}
                    className="inline-flex h-9 items-center rounded-md bg-primary-700 px-3 text-body-sm font-medium text-white hover:bg-primary-600"
                  >
                    ดูใบเสนอราคา
                  </Link>
                  <Link
                    href={`/projects/${p.id}`}
                    className="inline-flex h-9 items-center rounded-md border border-[#e2ddd0] bg-white px-3 text-body-sm font-medium text-text-primary hover:bg-[#faf8f3]"
                  >
                    รายละเอียดโปรเจค
                  </Link>
                </div>
              </ContentCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
