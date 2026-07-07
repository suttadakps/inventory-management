import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { requireUser } from "@/lib/auth/session";
import { canEditProject } from "@/lib/projects/permissions";
import {
  getProjectForUser,
  getProjectAuthz,
  listClientOptions,
  listAssignableUsers,
} from "@/lib/projects/repository";
import { updateProject } from "@/lib/projects/actions";
import { ProjectForm } from "@/components/projects/ProjectForm";

export const metadata: Metadata = { title: "Edit project · ARTIVERGES NEXT" };

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;

  const project = await getProjectForUser(user, id);
  if (!project) notFound();

  const authz = await getProjectAuthz(user.id, id);
  const allowed = canEditProject(user.role, {
    isManager: authz.isManager,
    isAssignedEngineer: authz.isAssignedEngineer,
  });
  if (!allowed) redirect(`/projects/${id}`);

  const [clients, users] = await Promise.all([
    listClientOptions(),
    listAssignableUsers(),
  ]);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link
          href={`/projects/${id}`}
          className="text-body-sm text-text-secondary hover:underline"
        >
          ← {project.name}
        </Link>
        <h2 className="mt-1 text-h2 font-bold text-text-primary">
          แก้ไขโปรเจค
        </h2>
      </div>

      <div className="rounded-lg border border-[#ece7db] bg-white p-6 shadow-1">
        <ProjectForm
          mode="edit"
          action={updateProject}
          clients={clients}
          users={users}
          values={{
            id: project.id,
            code: project.code,
            name: project.name,
            clientId: project.clientId,
            address: project.address,
            status: project.status,
            budget: project.budget,
            contractValue: project.contractValue,
            actualCost: project.actualCost,
            commissionRate: project.commissionRate,
            startDate: project.startDate,
            endDate: project.endDate,
            progress: project.progress,
            managerId: project.managerId,
            siteEngineerId: project.siteEngineerId,
          }}
        />
      </div>
    </div>
  );
}
