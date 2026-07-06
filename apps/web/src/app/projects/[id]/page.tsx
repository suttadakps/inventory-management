import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { requireUser } from "@/lib/auth/session";
import {
  canArchiveProject,
  canEditProject,
} from "@/lib/projects/permissions";
import { getProjectForUser } from "@/lib/projects/repository";
import { ProjectStatusBadge } from "@/components/projects/ProjectStatusBadge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import {
  ArchiveProjectButton,
  RestoreProjectButton,
} from "@/components/projects/ArchiveProjectButtons";

export const metadata: Metadata = { title: "Project · ARTIVERGES NEXT" };

function money(value: number | null): string {
  if (value === null) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <dt className="text-caption font-medium uppercase tracking-wide text-text-secondary">
        {label}
      </dt>
      <dd className="mt-1 text-body text-text-primary">{children}</dd>
    </div>
  );
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

  const isManager = project.managerId === user.id;
  const isAssignedEngineer = project.siteEngineerId === user.id;
  const canEdit = canEditProject(user.role, { isManager, isAssignedEngineer });
  const canArchive = canArchiveProject(user.role);

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/projects"
          className="text-body-sm text-text-secondary hover:underline"
        >
          ← Projects
        </Link>
        <div className="mt-1 flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-h1 font-bold text-text-primary">
                {project.name}
              </h1>
              <ProjectStatusBadge status={project.status} />
              {project.archived && (
                <span className="rounded-sm bg-neutral px-2 py-0.5 text-caption font-medium text-white">
                  Archived
                </span>
              )}
            </div>
            <p className="mt-1 font-mono text-body-sm text-text-secondary">
              {project.code} · {project.clientName}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/projects/${project.id}/boq`}
              className="inline-flex h-9 items-center rounded-sm bg-primary-600 px-3 text-body-sm font-medium text-white hover:bg-primary-700"
            >
              Bills of Quantities
            </Link>
            <Link
              href={`/projects/${project.id}/quotations`}
              className="inline-flex h-9 items-center rounded-sm border border-primary-600 px-3 text-body-sm font-medium text-primary-700 hover:bg-primary-100"
            >
              Quotations
            </Link>
            {canEdit && !project.archived && (
              <Link
                href={`/projects/${project.id}/edit`}
                className="inline-flex h-9 items-center rounded-sm border border-border bg-surface px-3 text-body-sm font-medium text-text-primary hover:bg-primary-100"
              >
                Edit
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
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Overview */}
        <section className="rounded-md border border-border bg-surface p-6 lg:col-span-2">
          <h2 className="mb-4 text-h3 font-semibold text-text-primary">
            Overview
          </h2>
          <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field label="Client">{project.clientName}</Field>
            <Field label="Status">
              <ProjectStatusBadge status={project.status} />
            </Field>
            <Field label="Project manager">
              {project.managerName ?? "Unassigned"}
            </Field>
            <Field label="Site engineer">
              {project.siteEngineerName ?? "Unassigned"}
            </Field>
            <Field label="Start date">{project.startDate ?? "—"}</Field>
            <Field label="End date">{project.endDate ?? "—"}</Field>
            <div className="sm:col-span-2">
              <Field label="Site address">{project.address ?? "—"}</Field>
            </div>
          </dl>
        </section>

        {/* Progress + budget */}
        <section className="space-y-6">
          <div className="rounded-md border border-border bg-surface p-6">
            <h2 className="mb-3 text-h3 font-semibold text-text-primary">
              Progress
            </h2>
            <div className="mb-2 text-h1 font-bold tabular-nums text-primary-700">
              {Math.round(project.progress)}%
            </div>
            <ProgressBar value={project.progress} />
          </div>

          <div className="rounded-md border border-border bg-surface p-6">
            <h2 className="mb-4 text-h3 font-semibold text-text-primary">
              Budget
            </h2>
            <dl className="space-y-3">
              <div className="flex items-center justify-between">
                <dt className="text-body-sm text-text-secondary">Budget</dt>
                <dd className="font-mono tabular-nums text-text-primary">
                  {money(project.budget)}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-body-sm text-text-secondary">
                  Actual cost
                </dt>
                <dd className="font-mono tabular-nums text-text-primary">
                  {money(project.actualCost)}
                </dd>
              </div>
            </dl>
          </div>
        </section>
      </div>
    </div>
  );
}
