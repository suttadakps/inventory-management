import { prisma } from "@/lib/db";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/serviceRole";
import type { Role } from "@/lib/auth/roles";

/**
 * Account administration for the back office.
 *
 * Accounts are created outright with a password the office chooses and hands
 * over, rather than emailed invitations: most site crew have no working email
 * address, and several share one. The address is therefore just a login name
 * — hence `email_confirm: true`, so nobody has to click a link that will never
 * arrive.
 */

export type ManagedUser = {
  id: string;
  email: string;
  fullName: string | null;
  role: Role;
  status: string;
  createdAt: string;
  projects: { id: string; name: string }[];
  clientName: string | null;
};

export async function listUsers(): Promise<ManagedUser[]> {
  const [rows, clients] = await Promise.all([
    prisma.user.findMany({
      orderBy: [{ role: "asc" }, { createdAt: "asc" }],
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        status: true,
        createdAt: true,
        memberships: {
          select: { project: { select: { id: true, name: true } } },
        },
        managedProjects: {
          where: { deletedAt: null },
          select: { id: true, name: true },
        },
      },
    }),
    prisma.client.findMany({
      where: { portalUserId: { not: null } },
      select: { portalUserId: true, name: true },
    }),
  ]);

  const clientByUser = new Map(clients.map((c) => [c.portalUserId!, c.name]));

  return rows.map((u) => {
    // A manager is attached to their projects without a membership row, so
    // fold both sources together and de-duplicate.
    const byId = new Map<string, { id: string; name: string }>();
    for (const m of u.memberships) byId.set(m.project.id, m.project);
    for (const p of u.managedProjects) byId.set(p.id, p);
    return {
      id: u.id,
      email: u.email ?? "",
      fullName: u.fullName,
      role: u.role as Role,
      status: u.status,
      createdAt: u.createdAt.toISOString(),
      projects: Array.from(byId.values()),
      clientName: clientByUser.get(u.id) ?? null,
    };
  });
}

export type CreateUserInput = {
  email: string;
  password: string;
  fullName: string;
  role: Role;
  projectIds: string[];
  clientId: string | null;
};

/**
 * Creates the Supabase auth user, then its profile row and assignments. The
 * profile is upserted because a database trigger may already have inserted a
 * default row the moment the auth user appeared.
 */
export async function createUser(input: CreateUserInput): Promise<string> {
  const supabase = createSupabaseServiceRoleClient();

  const { data, error } = await supabase.auth.admin.createUser({
    email: input.email,
    password: input.password,
    email_confirm: true,
    user_metadata: { full_name: input.fullName },
  });
  if (error || !data.user) {
    throw new Error(error?.message ?? "สร้างบัญชีไม่สำเร็จ");
  }
  const userId = data.user.id;

  try {
    await prisma.user.upsert({
      where: { id: userId },
      create: {
        id: userId,
        email: input.email,
        fullName: input.fullName,
        role: input.role,
      },
      update: {
        email: input.email,
        fullName: input.fullName,
        role: input.role,
      },
    });

    await assignProjects(userId, input.projectIds, input.role);
    if (input.clientId) {
      await prisma.client.update({
        where: { id: input.clientId },
        data: { portalUserId: userId },
      });
    }
  } catch (e) {
    // Never leave an auth user stranded without a profile — they would be able
    // to sign in and land on an empty portal with no way for us to find them.
    await supabase.auth.admin.deleteUser(userId).catch(() => {});
    throw e;
  }

  return userId;
}

export async function updateUser(
  userId: string,
  input: { fullName: string; role: Role; projectIds: string[]; clientId: string | null }
): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { fullName: input.fullName, role: input.role },
  });
  await assignProjects(userId, input.projectIds, input.role);

  // Re-point the client link: clear any previous one so a user is never the
  // portal contact for two different clients at once.
  await prisma.client.updateMany({
    where: { portalUserId: userId },
    data: { portalUserId: null },
  });
  if (input.clientId) {
    await prisma.client.update({
      where: { id: input.clientId },
      data: { portalUserId: userId },
    });
  }
}

export async function setUserPassword(
  userId: string,
  password: string
): Promise<void> {
  const supabase = createSupabaseServiceRoleClient();
  const { error } = await supabase.auth.admin.updateUserById(userId, {
    password,
  });
  if (error) throw new Error(error.message);
}

export async function deleteUser(userId: string): Promise<void> {
  const supabase = createSupabaseServiceRoleClient();
  await prisma.client.updateMany({
    where: { portalUserId: userId },
    data: { portalUserId: null },
  });
  await prisma.projectMember.deleteMany({ where: { userId } });
  const { error } = await supabase.auth.admin.deleteUser(userId);
  if (error) throw new Error(error.message);
  // The profile row is removed by the cascade from auth.users; make sure.
  await prisma.user.deleteMany({ where: { id: userId } });
}

/** Replaces a user's project memberships with exactly `projectIds`. */
async function assignProjects(
  userId: string,
  projectIds: string[],
  role: Role
): Promise<void> {
  const projectRole =
    role === "site_engineer" ? "engineer" : role === "worker" ? "worker" : "member";

  await prisma.projectMember.deleteMany({
    where: { userId, projectId: { notIn: projectIds.length ? projectIds : [""] } },
  });
  for (const projectId of projectIds) {
    await prisma.projectMember.upsert({
      where: { projectId_userId: { projectId, userId } },
      create: { projectId, userId, projectRole },
      update: { projectRole },
    });
  }
}

export async function listAssignableProjects(): Promise<
  { id: string; name: string }[]
> {
  return prisma.project.findMany({
    where: { deletedAt: null },
    orderBy: { updatedAt: "desc" },
    select: { id: true, name: true },
  });
}

export async function listClientsForLinking(): Promise<
  { id: string; name: string }[]
> {
  return prisma.client.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
}
