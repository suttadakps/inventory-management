import type { Metadata } from "next";
import Link from "next/link";

import { requireUser } from "@/lib/auth/session";
import { canCreateProject } from "@/lib/projects/permissions";
import { listProjects } from "@/lib/projects/repository";
import { ProjectsTable } from "@/components/projects/ProjectsTable";

export const metadata: Metadata = { title: "โปรเจค · ARTIVERGES NEXT" };

export default async function ProjectsPage() {
  const user = await requireUser();
  const projects = await listProjects(user, {});
  const canCreate = canCreateProject(user.role);

  return (
    <div className="space-y-4">
      {canCreate && (
        <div className="flex justify-end">
          <Link
            href="/projects/new"
            className="inline-flex h-10 items-center justify-center rounded-md bg-primary-700 px-4 text-body-sm font-medium text-white transition-colors hover:bg-primary-600"
          >
            + สร้างโปรเจคใหม่
          </Link>
        </div>
      )}

      <ProjectsTable items={projects} />
    </div>
  );
}
