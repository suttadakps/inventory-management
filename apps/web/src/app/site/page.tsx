import type { Metadata } from "next";
import Link from "next/link";
import type { ProjectStatus } from "@artiverges/database";

import { requireUser } from "@/lib/auth/session";
import { listSiteProjects } from "@/lib/site/repository";
import { STATUS_TH } from "@/lib/projects/statusLabels";
import { ContentCard } from "@/components/ui/ContentCard";
import { StatusBadge, type StatusTone } from "@/components/ui/StatusBadge";

export const metadata: Metadata = { title: "งานของฉัน · ARTIVERGES NEXT" };

export default async function SiteHomePage() {
  const user = await requireUser();
  const projects = await listSiteProjects(user);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-h1 font-bold text-text-primary">งานของฉัน</h1>
        <p className="text-body-sm text-text-secondary">
          ความคืบหน้าและภาพหน้างานของโปรเจคที่คุณดูแล
        </p>
      </div>

      {projects.length === 0 ? (
        <div className="rounded-lg border border-dashed border-[#ddd6c8] bg-white p-10 text-center text-body-sm text-text-secondary">
          ยังไม่มีโปรเจคที่ได้รับมอบหมาย
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {projects.map((p) => {
            const st = STATUS_TH[p.status as ProjectStatus] ?? {
              label: p.status,
              tone: "gray" as StatusTone,
            };
            const pct = Math.max(0, Math.min(100, Math.round(p.progress)));
            return (
              <Link key={p.id} href={`/site/${p.id}`} className="block">
                <ContentCard className="h-full p-5 transition-shadow hover:shadow-2">
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="text-h3 font-semibold text-text-primary">
                      {p.name}
                    </h2>
                    <StatusBadge tone={st.tone}>{st.label}</StatusBadge>
                  </div>

                  <div className="mt-4">
                    <div className="mb-1 flex items-center justify-between text-caption text-text-secondary">
                      <span>ความคืบหน้า</span>
                      <span className="tabular-nums text-text-primary">
                        {pct}%
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-[#e7e1d5]">
                      <div
                        className="h-full rounded-full bg-primary-700"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-3 flex gap-4 text-caption text-text-secondary">
                    <span>
                      ขั้นตอน{" "}
                      <span className="tabular-nums text-text-primary">
                        {p.milestoneDone}/{p.milestoneTotal}
                      </span>
                    </span>
                    <span>
                      รูปหน้างาน{" "}
                      <span className="tabular-nums text-text-primary">
                        {p.photoCount}
                      </span>
                    </span>
                  </div>
                </ContentCard>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
