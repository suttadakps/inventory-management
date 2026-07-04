import type { Metadata } from "next";
import Link from "next/link";
import type { ProjectStatus } from "@artiverges/database";

import { requireUser } from "@/lib/auth/session";
import { canCreateProject } from "@/lib/projects/permissions";
import { listProjects } from "@/lib/projects/repository";
import { PROJECT_STATUSES } from "@/lib/validation/project";
import { STATUS_LABELS } from "@/components/projects/ProjectStatusBadge";
import { ProjectsTable } from "@/components/projects/ProjectsTable";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

export const metadata: Metadata = { title: "Projects · ARTIVERGES NEXT" };

function parseStatus(value?: string): ProjectStatus | undefined {
  return value && (PROJECT_STATUSES as readonly string[]).includes(value)
    ? (value as ProjectStatus)
    : undefined;
}

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; archived?: string }>;
}) {
  const user = await requireUser();
  const sp = await searchParams;

  const q = sp.q?.trim() || undefined;
  const status = parseStatus(sp.status);
  const includeArchived = sp.archived === "1";

  const projects = await listProjects(user, { q, status, includeArchived });
  const canCreate = canCreateProject(user.role);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-h1 font-bold text-text-primary">Projects</h1>
          <p className="text-body-sm text-text-secondary">
            {projects.length} {projects.length === 1 ? "project" : "projects"}
            {includeArchived ? " (including archived)" : ""}
          </p>
        </div>
        {canCreate && (
          <Link
            href="/projects/new"
            className="inline-flex h-10 items-center justify-center rounded-sm bg-primary-600 px-4 text-body font-medium text-white hover:bg-primary-700"
          >
            New project
          </Link>
        )}
      </div>

      {/* Filters (server-driven GET form) */}
      <form
        method="get"
        className="flex flex-wrap items-end gap-3 rounded-md border border-border bg-surface p-4"
      >
        <div className="min-w-48 flex-1 space-y-1.5">
          <label htmlFor="q" className="text-body-sm font-medium">
            Search
          </label>
          <Input
            id="q"
            name="q"
            defaultValue={q ?? ""}
            placeholder="Name, code, or client"
          />
        </div>
        <div className="w-44 space-y-1.5">
          <label htmlFor="status" className="text-body-sm font-medium">
            Status
          </label>
          <Select id="status" name="status" defaultValue={status ?? ""}>
            <option value="">All statuses</option>
            {PROJECT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </Select>
        </div>
        <label className="flex h-10 items-center gap-2 text-body-sm text-text-secondary">
          <input
            type="checkbox"
            name="archived"
            value="1"
            defaultChecked={includeArchived}
            className="h-4 w-4 rounded-sm border-border text-primary-600"
          />
          Show archived
        </label>
        <button
          type="submit"
          className="h-10 rounded-sm border border-border bg-surface px-4 text-body-sm font-medium text-text-primary hover:bg-primary-100"
        >
          Apply
        </button>
      </form>

      <ProjectsTable items={projects} />
    </div>
  );
}
