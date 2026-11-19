import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ProjectStatus } from "@artiverges/database";

import { requireUser } from "@/lib/auth/session";
import { getSiteProject } from "@/lib/site/repository";
import { canAnswerApproval, canUpdateSite } from "@/lib/site/permissions";
import { canSeeMoney } from "@/lib/auth/roles";
import { STATUS_TH } from "@/lib/projects/statusLabels";
import { ContentCard } from "@/components/ui/ContentCard";
import { StatusBadge, type StatusTone } from "@/components/ui/StatusBadge";
import { SiteMilestones } from "@/components/site/SiteMilestones";
import { SitePhotos } from "@/components/site/SitePhotos";
import { SiteLog } from "@/components/site/SiteLog";

export const metadata: Metadata = { title: "ความคืบหน้างาน · ARTIVERGES NEXT" };

const dateFmt = new Intl.DateTimeFormat("th-TH", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export default async function SiteProjectPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const user = await requireUser();
  const { projectId } = await params;
  const canSeeCost = canSeeMoney(user.role);
  const project = await getSiteProject(user, projectId, canSeeCost);
  if (!project) notFound();

  const canEdit = canUpdateSite(user.role);
  const canAnswer = canAnswerApproval(user.role);
  const st = STATUS_TH[project.status as ProjectStatus] ?? {
    label: project.status,
    tone: "gray" as StatusTone,
  };
  const pct = Math.max(0, Math.min(100, Math.round(project.progress)));
  const current = project.milestones.find((m) => m.status === "in_progress");

  return (
    <div className="space-y-5">
      <Link
        href="/site"
        className="inline-block text-body-sm text-text-secondary hover:underline"
      >
        ← กลับไปหน้างานของฉัน
      </Link>

      <ContentCard className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-h2 font-bold text-text-primary">
              {project.name}
            </h1>
            {project.address && (
              <p className="text-body-sm text-text-secondary">
                {project.address}
              </p>
            )}
          </div>
          <StatusBadge tone={st.tone}>{st.label}</StatusBadge>
        </div>

        <div className="mt-4">
          <div className="mb-1 flex items-center justify-between text-caption text-text-secondary">
            <span>ความคืบหน้ารวม</span>
            <span className="tabular-nums text-text-primary">{pct}%</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#e7e1d5]">
            <div
              className="h-full rounded-full bg-primary-700 transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4 border-t border-[#f0ece2] pt-4 sm:grid-cols-3">
          <div>
            <div className="text-caption text-text-secondary">
              กำลังดำเนินการ
            </div>
            <div className="text-body font-semibold text-text-primary">
              {current ? current.name : "—"}
            </div>
          </div>
          <div>
            <div className="text-caption text-text-secondary">เริ่มงาน</div>
            <div className="text-body font-semibold text-text-primary">
              {project.startDate
                ? dateFmt.format(new Date(project.startDate))
                : "—"}
            </div>
          </div>
          <div>
            <div className="text-caption text-text-secondary">กำหนดส่งมอบ</div>
            <div className="text-body font-semibold text-text-primary">
              {project.endDate
                ? dateFmt.format(new Date(project.endDate))
                : "—"}
            </div>
          </div>
        </div>
      </ContentCard>

      <ContentCard className="p-5">
        <h2 className="mb-3 text-body font-semibold text-text-primary">
          ขั้นตอนการดำเนินงาน
        </h2>
        <SiteMilestones
          projectId={project.id}
          milestones={project.milestones}
          canEdit={canEdit}
        />
      </ContentCard>

      <ContentCard className="p-5">
        <h2 className="mb-3 text-body font-semibold text-text-primary">
          บันทึกหน้างาน
        </h2>
        <SiteLog
          projectId={project.id}
          log={project.log}
          milestones={project.milestones}
          canEdit={canEdit}
          canAnswer={canAnswer}
          canSeeCost={canSeeCost}
        />
      </ContentCard>

      <ContentCard className="p-5">
        <h2 className="mb-3 text-body font-semibold text-text-primary">
          รูปภาพหน้างาน
        </h2>
        <SitePhotos
          projectId={project.id}
          photos={project.photos}
          canEdit={canEdit}
        />
      </ContentCard>
    </div>
  );
}
