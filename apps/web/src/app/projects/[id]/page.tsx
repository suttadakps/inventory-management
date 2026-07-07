import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { requireUser } from "@/lib/auth/session";
import {
  canArchiveProject,
  canEditProject,
} from "@/lib/projects/permissions";
import {
  getProjectForUser,
  sumProjectIncoming,
  listStatusHistory,
  listProjectNotes,
} from "@/lib/projects/repository";
import { ContentCard } from "@/components/ui/ContentCard";
import { MetricCard } from "@/components/ui/MetricCard";
import { StatusBadge, type StatusTone } from "@/components/ui/StatusBadge";
import { ProjectProgressControl } from "@/components/projects/ProjectProgressControl";
import { ProjectNotes } from "@/components/projects/ProjectNotes";
import {
  ArchiveProjectButton,
  RestoreProjectButton,
} from "@/components/projects/ArchiveProjectButtons";
import { formatBaht } from "@/lib/format";

export const metadata: Metadata = { title: "โปรเจค · ARTIVERGES NEXT" };

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

function fmtDate(d: string | null): string {
  return d ? dateFmt.format(new Date(d)) : "—";
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;

  const project = await getProjectForUser(user, id);
  if (!project) notFound();

  const [received, history, notes] = await Promise.all([
    sumProjectIncoming(id),
    listStatusHistory(id),
    listProjectNotes(id),
  ]);
  const value = project.contractValue ?? 0;
  const outstanding = Math.max(0, value - received);

  // Fall back to the current status when there is no recorded history yet.
  const timeline =
    history.length > 0
      ? history
      : [{ status: project.status, date: project.updatedAt }];

  const isManager = project.managerId === user.id;
  const isAssignedEngineer = project.siteEngineerId === user.id;
  const canEdit = canEditProject(user.role, { isManager, isAssignedEngineer });
  const canArchive = canArchiveProject(user.role);
  const st = STATUS_TH[project.status] ?? {
    label: project.status,
    tone: "gray" as StatusTone,
  };

  return (
    <div className="space-y-5">
      <Link
        href="/projects"
        className="text-body-sm text-text-secondary hover:underline"
      >
        ← กลับไปหน้ารายการโปรเจค
      </Link>

      {/* Header + metrics + progress */}
      <ContentCard className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-h2 font-bold text-text-primary">
                {project.name}
              </h2>
              <StatusBadge tone={st.tone}>{st.label}</StatusBadge>
              {project.archived && (
                <StatusBadge tone="gray">เก็บถาวร</StatusBadge>
              )}
            </div>
            <p className="mt-1 text-body-sm text-text-secondary">
              {project.clientName}
              {project.address ? ` · ${project.address}` : ""}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/projects/${project.id}/boq`}
              className="inline-flex h-9 items-center rounded-md bg-primary-700 px-3 text-body-sm font-medium text-white hover:bg-primary-600"
            >
              BOQ
            </Link>
            <Link
              href={`/projects/${project.id}/quotations`}
              className="inline-flex h-9 items-center rounded-md border border-primary-700 px-3 text-body-sm font-medium text-primary-700 hover:bg-primary-100"
            >
              ใบเสนอราคา
            </Link>
            {canEdit && !project.archived && (
              <Link
                href={`/projects/${project.id}/edit`}
                className="inline-flex h-9 items-center rounded-md border border-[#e2ddd0] bg-white px-3 text-body-sm font-medium text-text-primary hover:bg-[#faf8f3]"
              >
                แก้ไข
              </Link>
            )}
            {canArchive &&
              (project.archived ? (
                <RestoreProjectButton id={project.id} />
              ) : (
                <ArchiveProjectButton id={project.id} />
              ))}
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <MetricCard label="มูลค่างาน" value={formatBaht(value, true)} />
          <MetricCard
            label="รับแล้ว"
            value={formatBaht(received, true)}
            tone="green"
          />
          <MetricCard
            label="ค้างรับ"
            value={formatBaht(outstanding, true)}
            tone="orange"
          />
          <MetricCard label="เริ่มงาน" value={fmtDate(project.startDate)} />
          <MetricCard label="ส่งมอบ" value={fmtDate(project.endDate)} />
        </div>

        <div className="mt-5 border-t border-[#f0ece2] pt-5">
          <ProjectProgressControl
            projectId={project.id}
            progress={project.progress}
            status={project.status}
            editable={canEdit && !project.archived}
          />
        </div>
      </ContentCard>

      {/* Overview + finance */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ContentCard className="p-6">
          <h3 className="mb-4 text-h3 font-semibold text-text-primary">
            รายละเอียด
          </h3>
          <dl className="grid grid-cols-2 gap-4 text-body-sm">
            <div>
              <dt className="text-caption text-text-secondary">รหัสโปรเจค</dt>
              <dd className="font-mono text-text-primary">{project.code}</dd>
            </div>
            <div>
              <dt className="text-caption text-text-secondary">ลูกค้า</dt>
              <dd className="text-text-primary">{project.clientName}</dd>
            </div>
            <div>
              <dt className="text-caption text-text-secondary">
                ผู้จัดการโปรเจค
              </dt>
              <dd className="text-text-primary">
                {project.managerName ?? "—"}
              </dd>
            </div>
            <div>
              <dt className="text-caption text-text-secondary">วิศวกรหน้างาน</dt>
              <dd className="text-text-primary">
                {project.siteEngineerName ?? "—"}
              </dd>
            </div>
            <div className="col-span-2">
              <dt className="text-caption text-text-secondary">
                สถานที่ก่อสร้าง
              </dt>
              <dd className="text-text-primary">{project.address ?? "—"}</dd>
            </div>
          </dl>
        </ContentCard>

        <ContentCard className="p-6">
          <h3 className="mb-4 text-h3 font-semibold text-text-primary">
            การเงิน
          </h3>
          <dl className="space-y-3 text-body-sm">
            <div className="flex items-center justify-between">
              <dt className="text-text-secondary">มูลค่างาน</dt>
              <dd className="tabular-nums text-text-primary">
                {formatBaht(value, true)}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-text-secondary">รับแล้ว</dt>
              <dd className="tabular-nums text-success">
                {formatBaht(received, true)}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-text-secondary">ค้างรับ</dt>
              <dd className="tabular-nums text-accent-600">
                {formatBaht(outstanding, true)}
              </dd>
            </div>
            <div className="flex items-center justify-between border-t border-[#f0ece2] pt-3">
              <dt className="text-text-secondary">ต้นทุนจริง</dt>
              <dd className="tabular-nums text-text-primary">
                {formatBaht(project.actualCost, true)}
              </dd>
            </div>
          </dl>
        </ContentCard>
      </div>

      {/* Timeline + daily log */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ContentCard className="p-6">
          <h3 className="mb-4 text-h3 font-semibold text-text-primary">
            Timeline สถานะ
          </h3>
          <ul className="space-y-4">
            {timeline.map((h, idx) => {
              const t = STATUS_TH[h.status] ?? {
                label: h.status,
                tone: "gray" as StatusTone,
              };
              return (
                <li key={idx} className="flex gap-3">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary-700" />
                  <div>
                    <div className="font-medium text-text-primary">
                      {t.label}
                    </div>
                    <div className="text-caption text-text-secondary">
                      {fmtDate(h.date)}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </ContentCard>

        <ContentCard className="p-6">
          <h3 className="mb-4 text-h3 font-semibold text-text-primary">
            บันทึกรายวัน
          </h3>
          <ProjectNotes
            projectId={project.id}
            notes={notes}
            canAdd={!project.archived}
          />
        </ContentCard>
      </div>
    </div>
  );
}
