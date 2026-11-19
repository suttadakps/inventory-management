import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { requireUser } from "@/lib/auth/session";
import { canManageUsers } from "@/lib/users/permissions";
import {
  listUsers,
  listAssignableProjects,
  listClientsForLinking,
} from "@/lib/users/repository";
import { UsersManager } from "@/components/users/UsersManager";

export const metadata: Metadata = { title: "ผู้ใช้งาน · ARTIVERGES NEXT" };

export default async function UsersPage() {
  const user = await requireUser();
  if (!canManageUsers(user.role)) notFound();

  const [users, projects, clients] = await Promise.all([
    listUsers(),
    listAssignableProjects(),
    listClientsForLinking(),
  ]);

  return (
    <UsersManager
      users={users}
      projects={projects}
      clients={clients}
      currentUserId={user.id}
    />
  );
}
