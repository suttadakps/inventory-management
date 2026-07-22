import {
  Prisma,
  type ProjectStatus,
  type PaymentMethod,
} from "@artiverges/database";
import { prisma } from "@/lib/db";
import type { Role } from "@/lib/auth/roles";
import type { CurrentUser } from "@/lib/auth/session";
import { canViewAllProjects } from "./permissions";

/**
 * Projects repository (repository pattern, docs/03 §4, docs/08 §6).
 * The only place that touches the projects data. All queries are role-scoped
 * here because Prisma bypasses RLS.
 *
 * Prisma Decimal/Date values are mapped to plain primitives so results are safe
 * to serialize across the Server/Client Component boundary.
 */

// ---- DTOs -------------------------------------------------------------------

export type ProjectListItem = {
  id: string;
  code: string;
  name: string;
  clientName: string;
  status: ProjectStatus;
  budget: number | null;
  contractValue: number | null;
  progress: number;
  startDate: string | null;
  endDate: string | null;
  updatedAt: string;
  managerName: string | null;
  siteEngineerName: string | null;
  archived: boolean;
};

export type ProjectDetail = ProjectListItem & {
  clientId: string;
  address: string | null;
  managerId: string | null;
  siteEngineerId: string | null;
  contractValue: number | null;
  commissionRate: number;
  actualCost: number;
  createdAt: string;
  updatedAt: string;
};

export type ProjectOption = { id: string; name: string };
export type UserOption = { id: string; name: string; role: Role };

export type ProjectWriteInput = {
  code: string;
  name: string;
  clientId: string;
  address?: string;
  status: ProjectStatus;
  budget?: number;
  contractValue?: number;
  actualCost?: number;
  commissionRate: number;
  startDate?: Date;
  endDate?: Date;
  progress: number;
  managerId?: string;
  siteEngineerId?: string;
};

export type ProjectAuthz = {
  exists: boolean;
  isManager: boolean;
  isAssignedEngineer: boolean;
  isMember: boolean;
  clientPortalUserId: string | null;
};

// ---- Prisma shapes / mappers ------------------------------------------------

const projectInclude = {
  client: { select: { id: true, name: true, portalUserId: true } },
  manager: { select: { id: true, fullName: true, email: true } },
  members: {
    where: { projectRole: "engineer" as const },
    select: {
      userId: true,
      user: { select: { fullName: true, email: true } },
    },
  },
} satisfies Prisma.ProjectInclude;

type ProjectRecord = Prisma.ProjectGetPayload<{ include: typeof projectInclude }>;

const dec = (v: Prisma.Decimal | null): number | null =>
  v === null ? null : v.toNumber();

const isoDate = (d: Date | null): string | null =>
  d === null ? null : d.toISOString().slice(0, 10);

const displayName = (
  u: { fullName: string | null; email?: string | null } | null
): string | null => (u ? (u.fullName ?? u.email ?? null) : null);

function toListItem(p: ProjectRecord): ProjectListItem {
  const engineer = p.members[0]?.user ?? null;
  return {
    id: p.id,
    code: p.code,
    name: p.name,
    clientName: p.client.name,
    status: p.status,
    budget: dec(p.budgetCost),
    contractValue: dec(p.contractValue),
    progress: p.progressPct.toNumber(),
    startDate: isoDate(p.startDate),
    endDate: isoDate(p.endDate),
    updatedAt: p.updatedAt.toISOString(),
    managerName: displayName(p.manager),
    siteEngineerName: displayName(engineer),
    archived: p.deletedAt !== null,
  };
}

function toDetail(p: ProjectRecord): ProjectDetail {
  return {
    ...toListItem(p),
    clientId: p.clientId,
    address: p.address,
    managerId: p.managerId,
    siteEngineerId: p.members[0]?.userId ?? null,
    contractValue: dec(p.contractValue),
    commissionRate: p.commissionRate.toNumber(),
    actualCost: p.actualCost.toNumber(),
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  };
}

// ---- Scoping ----------------------------------------------------------------

/** Restrict a query to the projects a given user is allowed to see. */
function scopeWhere(user: CurrentUser): Prisma.ProjectWhereInput {
  if (canViewAllProjects(user.role)) return {};
  if (user.role === "client") {
    return { client: { portalUserId: user.id } };
  }
  // site_engineer / worker: only assigned projects.
  return {
    OR: [
      { managerId: user.id },
      { members: { some: { userId: user.id } } },
    ],
  };
}

function canViewRecord(user: CurrentUser, p: ProjectRecord): boolean {
  if (canViewAllProjects(user.role)) return true;
  if (user.role === "client") return p.client.portalUserId === user.id;
  return (
    p.managerId === user.id || p.members.some((m) => m.userId === user.id)
  );
}

// ---- Reads ------------------------------------------------------------------

export async function listProjects(
  user: CurrentUser,
  opts: { q?: string; status?: ProjectStatus; includeArchived?: boolean } = {}
): Promise<ProjectListItem[]> {
  // Combine role-scope and filters with AND so neither clause's `OR` can
  // overwrite the other (which would leak out-of-scope rows).
  const filters: Prisma.ProjectWhereInput[] = [scopeWhere(user)];
  if (!opts.includeArchived) filters.push({ deletedAt: null });
  if (opts.status) filters.push({ status: opts.status });
  if (opts.q) {
    filters.push({
      OR: [
        { name: { contains: opts.q, mode: "insensitive" } },
        { code: { contains: opts.q, mode: "insensitive" } },
        { client: { name: { contains: opts.q, mode: "insensitive" } } },
      ],
    });
  }

  const rows = await prisma.project.findMany({
    where: { AND: filters },
    include: projectInclude,
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return rows.map(toListItem);
}

/** Detail scoped to the requesting user; null if missing or not permitted. */
export async function getProjectForUser(
  user: CurrentUser,
  id: string
): Promise<ProjectDetail | null> {
  const p = await prisma.project.findUnique({
    where: { id },
    include: projectInclude,
  });
  if (!p) return null;
  if (!canViewRecord(user, p)) return null;
  return toDetail(p);
}

/** Authorization context for edit/archive decisions. */
export async function getProjectAuthz(
  userId: string,
  id: string
): Promise<ProjectAuthz> {
  // Only ids are needed for the authz checks below — narrower than
  // `projectInclude` (which also pulls manager/member display names and the
  // client's name, unused here).
  const p = await prisma.project.findUnique({
    where: { id },
    select: {
      managerId: true,
      members: { select: { userId: true } },
      client: { select: { portalUserId: true } },
    },
  });
  if (!p) {
    return {
      exists: false,
      isManager: false,
      isAssignedEngineer: false,
      isMember: false,
      clientPortalUserId: null,
    };
  }
  return {
    exists: true,
    isManager: p.managerId === userId,
    isAssignedEngineer: p.members.some((m) => m.userId === userId),
    isMember:
      p.managerId === userId || p.members.some((m) => m.userId === userId),
    clientPortalUserId: p.client.portalUserId,
  };
}

// ---- Option lists (real data — no mocks) ------------------------------------

export async function listClientOptions(): Promise<ProjectOption[]> {
  const clients = await prisma.client.findMany({
    where: { deletedAt: null },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
  return clients;
}

export async function listAssignableUsers(): Promise<UserOption[]> {
  const users = await prisma.user.findMany({
    where: {
      status: "active",
      role: { in: ["owner", "admin", "ae", "site_engineer"] },
    },
    select: { id: true, fullName: true, email: true, role: true },
    orderBy: { fullName: "asc" },
  });
  return users.map((u) => ({
    id: u.id,
    name: u.fullName ?? u.email ?? "Unknown",
    role: u.role as Role,
  }));
}

// ---- Writes -----------------------------------------------------------------

/** Editable fields shared by create and update (code is create-only). */
function editableData(input: ProjectWriteInput, actorId: string) {
  return {
    name: input.name,
    clientId: input.clientId,
    status: input.status,
    address: input.address ?? null,
    budgetCost: input.budget ?? null,
    contractValue: input.contractValue ?? null,
    actualCost: input.actualCost ?? 0,
    commissionRate: input.commissionRate,
    startDate: input.startDate ?? null,
    endDate: input.endDate ?? null,
    progressPct: input.progress,
    managerId: input.managerId ?? null,
    updatedById: actorId,
  };
}

export async function createProject(
  input: ProjectWriteInput,
  actorId: string
): Promise<string> {
  return prisma.$transaction(async (tx) => {
    const project = await tx.project.create({
      data: {
        code: input.code,
        createdById: actorId,
        ...editableData(input, actorId),
      },
    });
    if (input.siteEngineerId) {
      await tx.projectMember.create({
        data: {
          projectId: project.id,
          userId: input.siteEngineerId,
          projectRole: "engineer",
        },
      });
    }
    return project.id;
  });
}

export async function updateProject(
  id: string,
  input: ProjectWriteInput,
  actorId: string
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    // Code is immutable on update — intentionally not written.
    await tx.project.update({
      where: { id },
      data: editableData(input, actorId),
    });
    // Reconcile the single "site engineer" membership.
    await tx.projectMember.deleteMany({
      where: { projectId: id, projectRole: "engineer" },
    });
    if (input.siteEngineerId) {
      await tx.projectMember.create({
        data: {
          projectId: id,
          userId: input.siteEngineerId,
          projectRole: "engineer",
        },
      });
    }
  });
}

export async function archiveProject(
  id: string,
  actorId: string
): Promise<void> {
  await prisma.project.update({
    where: { id },
    data: { deletedAt: new Date(), updatedById: actorId },
  });
}

export async function restoreProject(
  id: string,
  actorId: string
): Promise<void> {
  await prisma.project.update({
    where: { id },
    data: { deletedAt: null, updatedById: actorId },
  });
}

// ---- AE commission view ("โปรเจคของฉัน") ------------------------------------
// Commission per project = contract value × commission rate (%). Received vs
// outstanding commission is derived from how much of the contract has actually
// been collected (incoming payments ÷ contract value).

const round2c = (n: number): number =>
  Math.round((n + Number.EPSILON) * 100) / 100;

export type AeCommissionRow = {
  id: string;
  name: string;
  clientName: string;
  status: ProjectStatus;
  contractValue: number;
  commission: number;
  received: number;
  outstanding: number;
};

export type AeCommission = {
  totalSold: number;
  totalReceived: number;
  totalOutstanding: number;
  rows: AeCommissionRow[];
};

export async function listAeCommission(user: CurrentUser): Promise<AeCommission> {
  const projects = await prisma.project.findMany({
    where: { deletedAt: null, ...scopeWhere(user) },
    orderBy: { updatedAt: "desc" },
    // Same bound used by every other project list in this repository
    // (listProjects, listAllBoqs, ...) — keeps this scoped-role query from
    // growing unbounded as the projects table grows.
    take: 200,
    select: {
      id: true,
      name: true,
      status: true,
      contractValue: true,
      commissionRate: true,
      client: { select: { name: true } },
      payments: {
        where: { direction: "incoming" },
        select: { amount: true },
      },
    },
  });

  const rows: AeCommissionRow[] = projects.map((p) => {
    const value = p.contractValue ? p.contractValue.toNumber() : 0;
    const rate = p.commissionRate.toNumber(); // percent
    const commission = round2c((value * rate) / 100);
    const collected = p.payments.reduce((s, x) => s + x.amount.toNumber(), 0);
    const ratio = value > 0 ? Math.min(1, collected / value) : 0;
    const received = round2c(commission * ratio);
    return {
      id: p.id,
      name: p.name,
      clientName: p.client.name,
      status: p.status,
      contractValue: value,
      commission,
      received,
      outstanding: round2c(commission - received),
    };
  });

  return {
    totalSold: round2c(rows.reduce((s, r) => s + r.contractValue, 0)),
    totalReceived: round2c(rows.reduce((s, r) => s + r.received, 0)),
    totalOutstanding: round2c(rows.reduce((s, r) => s + r.outstanding, 0)),
    rows,
  };
}

// ---- Quick create (name only) ------------------------------------------------
// Create a project with just a name; the code is auto-generated and a reusable
// "unassigned client" placeholder is attached. The rest of the details are
// filled in later on the project edit page.

const UNASSIGNED_CLIENT = "ยังไม่ระบุลูกค้า";

export async function createProjectQuick(
  name: string,
  actorId: string
): Promise<string> {
  return prisma.$transaction(async (tx) => {
    let client = await tx.client.findFirst({
      where: { name: UNASSIGNED_CLIENT, deletedAt: null },
      select: { id: true },
    });
    if (!client) {
      client = await tx.client.create({
        data: { name: UNASSIGNED_CLIENT, createdById: actorId },
        select: { id: true },
      });
    }

    const year = new Date().getFullYear();
    let seq =
      (await tx.project.count({
        where: { code: { startsWith: `PRJ-${year}-` } },
      })) + 1;
    let code = `PRJ-${year}-${String(seq).padStart(3, "0")}`;
    // Guard against gaps / manually-entered codes.
    while (await tx.project.findUnique({ where: { code }, select: { id: true } })) {
      seq += 1;
      code = `PRJ-${year}-${String(seq).padStart(3, "0")}`;
    }

    const project = await tx.project.create({
      data: {
        code,
        name,
        clientId: client.id,
        status: "planning",
        progressPct: 0,
        commissionRate: 0,
        createdById: actorId,
        updatedById: actorId,
      },
      select: { id: true },
    });
    return project.id;
  });
}

// ---- Project detail helpers (finance + inline progress/status) ---------------

export async function sumProjectIncoming(projectId: string): Promise<number> {
  const agg = await prisma.payment.aggregate({
    where: { projectId, direction: "incoming" },
    _sum: { amount: true },
  });
  return agg._sum.amount ? agg._sum.amount.toNumber() : 0;
}

export async function setProjectProgress(
  projectId: string,
  progress: number,
  actorId: string
): Promise<void> {
  const p = Math.max(0, Math.min(100, Math.round(progress)));
  await prisma.project.update({
    where: { id: projectId },
    data: { progressPct: p, updatedById: actorId },
  });
}

export async function setProjectStatus(
  projectId: string,
  status: ProjectStatus,
  actorId: string
): Promise<void> {
  await prisma.$transaction([
    prisma.project.update({
      where: { id: projectId },
      data: { status, updatedById: actorId },
    }),
    prisma.projectStatusHistory.create({
      data: { projectId, status, changedById: actorId },
    }),
  ]);
}

export type StatusHistoryItem = { id: string | null; status: string; date: string };

export async function listStatusHistory(
  projectId: string
): Promise<StatusHistoryItem[]> {
  const rows = await prisma.projectStatusHistory.findMany({
    where: { projectId },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
  return rows.map((r) => ({
    id: r.id,
    status: r.status,
    date: r.createdAt.toISOString(),
  }));
}

/** Log a status/date as history without changing the project's live status. */
export async function addStatusHistoryEntry(
  projectId: string,
  status: string,
  date: Date,
  actorId: string
): Promise<void> {
  await prisma.projectStatusHistory.create({
    data: { projectId, status, changedById: actorId, createdAt: date },
  });
}

export async function updateStatusHistoryEntry(
  entryId: string,
  projectId: string,
  status: string,
  date: Date
): Promise<void> {
  await prisma.projectStatusHistory.updateMany({
    where: { id: entryId, projectId },
    data: { status, createdAt: date },
  });
}

export async function deleteStatusHistoryEntry(
  entryId: string,
  projectId: string
): Promise<void> {
  await prisma.projectStatusHistory.deleteMany({
    where: { id: entryId, projectId },
  });
}

export type CalendarEntry = {
  id: string;
  projectId: string;
  projectName: string;
  status: string;
  date: string;
};

/** Status-history entries across every project the user can see (ปฏิทินโปรเจค). */
export async function listCalendarEntries(
  user: CurrentUser,
  opts: { projectId?: string; from?: Date; to?: Date } = {}
): Promise<CalendarEntry[]> {
  const filters: Prisma.ProjectStatusHistoryWhereInput[] = [
    { project: scopeWhere(user) },
  ];
  if (opts.projectId) filters.push({ projectId: opts.projectId });
  if (opts.from || opts.to) {
    filters.push({
      createdAt: {
        ...(opts.from ? { gte: opts.from } : {}),
        ...(opts.to ? { lte: opts.to } : {}),
      },
    });
  }

  const rows = await prisma.projectStatusHistory.findMany({
    where: { AND: filters },
    include: { project: { select: { name: true } } },
    orderBy: { createdAt: "asc" },
  });
  return rows.map((r) => ({
    id: r.id,
    projectId: r.projectId,
    projectName: r.project.name,
    status: r.status,
    date: r.createdAt.toISOString(),
  }));
}

export type ProjectNoteItem = {
  id: string;
  body: string;
  authorName: string | null;
  date: string;
};

export async function listProjectNotes(
  projectId: string
): Promise<ProjectNoteItem[]> {
  const rows = await prisma.projectNote.findMany({
    where: { projectId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return rows.map((r) => ({
    id: r.id,
    body: r.body,
    authorName: r.authorName,
    date: r.createdAt.toISOString(),
  }));
}

export async function addProjectNote(
  projectId: string,
  body: string,
  author: { id: string; name: string | null }
): Promise<void> {
  await prisma.projectNote.create({
    data: { projectId, body, authorId: author.id, authorName: author.name },
  });
}

export async function updateProjectNote(
  noteId: string,
  projectId: string,
  body: string
): Promise<void> {
  await prisma.projectNote.updateMany({
    where: { id: noteId, projectId },
    data: { body },
  });
}

export async function deleteProjectNote(
  noteId: string,
  projectId: string
): Promise<void> {
  await prisma.projectNote.deleteMany({ where: { id: noteId, projectId } });
}

// ---- LINE trigger reminders (การแจ้งเตือน) ----------------------------------

export type ProjectTriggerItem = {
  id: string;
  message: string;
  triggerAt: string;
  sentAt: string | null;
  doneAt: string | null;
};

export async function listProjectTriggers(
  projectId: string
): Promise<ProjectTriggerItem[]> {
  const rows = await prisma.projectTrigger.findMany({
    where: { projectId },
    orderBy: { triggerAt: "asc" },
    take: 100,
  });
  return rows.map((r) => ({
    id: r.id,
    message: r.message,
    triggerAt: r.triggerAt.toISOString(),
    sentAt: r.sentAt ? r.sentAt.toISOString() : null,
    doneAt: r.doneAt ? r.doneAt.toISOString() : null,
  }));
}

export async function addProjectTrigger(
  projectId: string,
  message: string,
  triggerAt: Date,
  createdById: string
): Promise<void> {
  await prisma.projectTrigger.create({
    data: { projectId, message, triggerAt, createdById },
  });
}

export async function deleteProjectTrigger(
  triggerId: string,
  projectId: string
): Promise<void> {
  await prisma.projectTrigger.deleteMany({
    where: { id: triggerId, projectId },
  });
}

export type DueTriggerItem = {
  id: string;
  message: string;
  projectName: string;
};

/** Triggers whose scheduled time has arrived and haven't been sent to LINE yet. */
export async function listDueTriggers(asOf: Date): Promise<DueTriggerItem[]> {
  const rows = await prisma.projectTrigger.findMany({
    where: { sentAt: null, triggerAt: { lte: asOf } },
    include: { project: { select: { name: true } } },
  });
  return rows.map((r) => ({
    id: r.id,
    message: r.message,
    projectName: r.project.name,
  }));
}

export async function markTriggerSent(triggerId: string): Promise<void> {
  await prisma.projectTrigger.update({
    where: { id: triggerId },
    data: { sentAt: new Date() },
  });
}

/** Toggle a trigger's to-do completion (from the web checkbox or the LINE "Done" button). */
export async function markTriggerDone(
  triggerId: string,
  done: boolean
): Promise<void> {
  await prisma.projectTrigger.update({
    where: { id: triggerId },
    data: { doneAt: done ? new Date() : null },
  });
}

// ---- Incoming payments (การรับเงิน) -----------------------------------------

export type ProjectPaymentItem = {
  id: string;
  amount: number;
  method: string | null;
  date: string;
  note: string | null;
};

export async function listProjectPayments(
  projectId: string
): Promise<ProjectPaymentItem[]> {
  const rows = await prisma.payment.findMany({
    where: { projectId, direction: "incoming" },
    orderBy: { paidAt: "desc" },
    take: 100,
  });
  return rows.map((r) => ({
    id: r.id,
    amount: r.amount.toNumber(),
    method: r.method,
    date: r.paidAt.toISOString(),
    note: r.note,
  }));
}

export async function addProjectPayment(
  projectId: string,
  input: {
    amount: number;
    method?: PaymentMethod;
    paidAt?: Date;
    note?: string;
    clientId?: string | null;
  },
  actorId: string
): Promise<void> {
  await prisma.payment.create({
    data: {
      direction: "incoming",
      partyType: "client",
      projectId,
      clientId: input.clientId ?? null,
      amount: input.amount,
      method: input.method ?? null,
      paidAt: input.paidAt ?? new Date(),
      note: input.note ?? null,
      createdById: actorId,
      updatedById: actorId,
    },
  });
}

export async function deleteProjectPayment(
  paymentId: string,
  projectId: string
): Promise<void> {
  await prisma.payment.deleteMany({
    where: { id: paymentId, projectId, direction: "incoming" },
  });
}

// ---- Client portal (พอร์ทัลลูกค้า) — read-only project overview --------------

export type PortalProject = {
  id: string;
  name: string;
  code: string;
  clientName: string;
  status: ProjectStatus;
  progress: number;
  value: number;
  received: number;
  outstanding: number;
  endDate: string | null;
};

export async function listPortalProjects(
  user: CurrentUser
): Promise<PortalProject[]> {
  const projects = await prisma.project.findMany({
    where: { deletedAt: null, ...scopeWhere(user) },
    orderBy: { updatedAt: "desc" },
    take: 100,
    select: {
      id: true,
      name: true,
      code: true,
      status: true,
      progressPct: true,
      contractValue: true,
      endDate: true,
      client: { select: { name: true } },
      payments: { where: { direction: "incoming" }, select: { amount: true } },
    },
  });

  return projects.map((p) => {
    const value = p.contractValue ? p.contractValue.toNumber() : 0;
    const received = p.payments.reduce((s, x) => s + x.amount.toNumber(), 0);
    return {
      id: p.id,
      name: p.name,
      code: p.code,
      clientName: p.client.name,
      status: p.status,
      progress: p.progressPct.toNumber(),
      value,
      received,
      outstanding: Math.max(0, value - received),
      endDate: p.endDate ? p.endDate.toISOString().slice(0, 10) : null,
    };
  });
}
