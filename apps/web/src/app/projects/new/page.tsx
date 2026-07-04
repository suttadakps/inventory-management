import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { requireUser } from "@/lib/auth/session";
import { canCreateProject } from "@/lib/projects/permissions";
import {
  listClientOptions,
  listAssignableUsers,
} from "@/lib/projects/repository";
import { createProject } from "@/lib/projects/actions";
import { ProjectForm } from "@/components/projects/ProjectForm";

export const metadata: Metadata = { title: "New project · ARTIVERGES NEXT" };

export default async function NewProjectPage() {
  const user = await requireUser();
  if (!canCreateProject(user.role)) redirect("/projects");

  const [clients, users] = await Promise.all([
    listClientOptions(),
    listAssignableUsers(),
  ]);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link
          href="/projects"
          className="text-body-sm text-text-secondary hover:underline"
        >
          ← Projects
        </Link>
        <h1 className="mt-1 text-h1 font-bold text-text-primary">
          New project
        </h1>
      </div>

      <div className="rounded-md border border-border bg-surface p-6">
        <ProjectForm
          mode="create"
          action={createProject}
          clients={clients}
          users={users}
        />
      </div>
    </div>
  );
}
