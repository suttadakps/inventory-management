import { Prisma, type ContractStatus } from "@artiverges/database";
import { prisma } from "@/lib/db";
import type { CurrentUser } from "@/lib/auth/session";
import { round2 } from "./calc";
import { visibleContractStatuses, canManageContracts } from "./permissions";

/**
 * Contracts repository. Sole data-access point; access enforced here (Prisma
 * bypasses RLS). Every mutation writes a contract_logs entry (audit trail).
 * Decimal/Date mapped to plain primitives for the UI.
 */

// ---- DTOs -------------------------------------------------------------------

export type ContractListItem = {
  id: string;
  contractNo: string;
  title: string | null;
  version: number;
  status: ContractStatus;
  value: number;
  projectCode: string;
  projectName: string;
  clientName: string;
  quotationNo: string;
  milestoneCount: number;
  updatedAt: string;
  archived: boolean;
};

export type MilestoneDto = {
  id: string;
  title: string;
  percentage: number;
  amount: number;
  dueDate: string | null;
  paymentStatus: string;
  invoiceStatus: string;
  sortOrder: number;
};

export type ContractFileDto = {
  id: string;
  fileName: string;
  fileUrl: string;
  mimeType: string | null;
  createdAt: string;
};

export type ContractCommentDto = {
  id: string;
  body: string;
  authorName: string | null;
  createdAt: string;
};

export type ContractLogDto = {
  id: string;
  action: string;
  detail: string | null;
  actorName: string | null;
  createdAt: string;
};

export type ContractVersionDto = {
  id: string;
  version: number;
  note: string | null;
  createdByName: string | null;
  createdAt: string;
};

export type ContractDetailDto = {
  id: string;
  contractNo: string;
  title: string | null;
  version: number;
  status: ContractStatus;
  value: number;
  projectId: string;
  quotationId: string;
  project: { code: string; name: string };
  client: { name: string; email: string | null };
  quotation: { quotationNo: string; total: number; version: number };
  scope: string | null;
  paymentTerms: string | null;
  warranty: string | null;
  notes: string | null;
  startDate: string | null;
  endDate: string | null;
  approvedAt: string | null;
  signedAt: string | null;
  clientSignedAt: string | null;
  cancelledAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  archived: boolean;
  milestones: MilestoneDto[];
  files: ContractFileDto[];
  comments: ContractCommentDto[];
  logs: ContractLogDto[];
  versions: ContractVersionDto[];
};

export type ApprovedQuotationOption = {
  id: string;
  quotationNo: string;
  projectId: string;
  projectName: string;
  total: number;
};

export type Paginated<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export const DEFAULT_PAGE_SIZE = 10;

export type ContractContext = {
  id: string;
  status: ContractStatus;
  projectId: string;
  quotationId: string;
  value: number;
};

export type ContractHeaderInput = {
  title?: string;
  scope?: string;
  paymentTerms?: string;
  warranty?: string;
  notes?: string;
  startDate?: Date;
  endDate?: Date;
};

export type MilestoneInput = {
  title: string;
  percentage: number;
  amount: number;
  dueDate?: Date;
};

// ---- Helpers ----------------------------------------------------------------

const num = (d: Prisma.Decimal): number => d.toNumber();
const isoDate = (d: Date | null): string | null =>
  d === null ? null : d.toISOString().slice(0, 10);
const iso = (d: Date | null): string | null =>
  d === null ? null : d.toISOString();
const personName = (
  p: { fullName: string | null; email: string | null } | null
): string | null => (p ? (p.fullName ?? p.email ?? null) : null);

type Db = Prisma.TransactionClient | typeof prisma;

async function writeLog(
  db: Db,
  contractId: string,
  actorId: string,
  action: string,
  detail?: string
): Promise<void> {
  await db.contractLog.create({
    data: { contractId, actorId, action, detail: detail ?? null },
  });
}

// ---- Access scoping ---------------------------------------------------------

function scopeWhere(user: CurrentUser): Prisma.ContractWhereInput {
  if (canManageContracts(user.role)) return {};
  if (user.role === "client") {
    return { status: "signed", client: { portalUserId: user.id } };
  }
  // site_engineer / worker: assigned projects, read-only.
  return {
    project: {
      OR: [
        { managerId: user.id },
        { members: { some: { userId: user.id } } },
      ],
    },
  };
}

async function canViewContract(
  user: CurrentUser,
  contract: {
    status: ContractStatus;
    projectId: string;
    client: { portalUserId: string | null };
    project: { managerId: string | null; members: { userId: string }[] };
  }
): Promise<boolean> {
  if (canManageContracts(user.role)) return true;
  const statuses = visibleContractStatuses(user.role);
  if (statuses && !statuses.includes(contract.status)) return false;
  if (user.role === "client") {
    return contract.client.portalUserId === user.id;
  }
  return (
    contract.project.managerId === user.id ||
    contract.project.members.some((m) => m.userId === user.id)
  );
}

// ---- Reads ------------------------------------------------------------------

export async function listContracts(
  user: CurrentUser,
  opts: { q?: string; page?: number; pageSize?: number; includeArchived?: boolean }
): Promise<Paginated<ContractListItem>> {
  const pageSize = Math.min(Math.max(1, opts.pageSize ?? DEFAULT_PAGE_SIZE), 100);
  const page = Math.max(1, opts.page ?? 1);

  const filters: Prisma.ContractWhereInput[] = [scopeWhere(user)];
  if (!opts.includeArchived) filters.push({ deletedAt: null });
  if (opts.q) {
    filters.push({
      OR: [
        { contractNo: { contains: opts.q, mode: "insensitive" } },
        { title: { contains: opts.q, mode: "insensitive" } },
        { project: { name: { contains: opts.q, mode: "insensitive" } } },
        { client: { name: { contains: opts.q, mode: "insensitive" } } },
      ],
    });
  }
  const where: Prisma.ContractWhereInput = { AND: filters };

  const [total, rows] = await Promise.all([
    prisma.contract.count({ where }),
    prisma.contract.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        contractNo: true,
        title: true,
        version: true,
        status: true,
        value: true,
        updatedAt: true,
        deletedAt: true,
        project: { select: { code: true, name: true } },
        client: { select: { name: true } },
        quotation: { select: { quotationNo: true } },
        _count: { select: { milestones: true } },
      },
    }),
  ]);

  return {
    items: rows.map((c) => ({
      id: c.id,
      contractNo: c.contractNo,
      title: c.title,
      version: c.version,
      status: c.status,
      value: num(c.value),
      projectCode: c.project.code,
      projectName: c.project.name,
      clientName: c.client.name,
      quotationNo: c.quotation.quotationNo,
      milestoneCount: c._count.milestones,
      updatedAt: c.updatedAt.toISOString(),
      archived: c.deletedAt !== null,
    })),
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function getContract(
  user: CurrentUser,
  id: string
): Promise<ContractDetailDto | null> {
  const c = await prisma.contract.findFirst({
    where: { id },
    include: {
      project: {
        select: {
          code: true,
          name: true,
          managerId: true,
          members: { select: { userId: true } },
        },
      },
      client: { select: { name: true, primaryEmail: true, portalUserId: true } },
      quotation: { select: { quotationNo: true, total: true, version: true } },
      milestones: { orderBy: { sortOrder: "asc" } },
      files: {
        where: { deletedAt: null },
        orderBy: { createdAt: "desc" },
      },
      comments: {
        where: { deletedAt: null },
        orderBy: { createdAt: "asc" },
      },
      logs: { orderBy: { createdAt: "desc" }, take: 200 },
      versions: { orderBy: { version: "desc" } },
    },
  });
  if (!c) return null;
  // Archived contracts are visible only to managers (for restore).
  if (c.deletedAt !== null && !canManageContracts(user.role)) return null;

  const allowed = await canViewContract(user, {
    status: c.status,
    projectId: c.projectId,
    client: { portalUserId: c.client.portalUserId },
    project: { managerId: c.project.managerId, members: c.project.members },
  });
  if (!allowed) return null;

  // Resolve actor / author / creator names in one lookup.
  const personIds = new Set<string>();
  for (const cm of c.comments) if (cm.authorId) personIds.add(cm.authorId);
  for (const l of c.logs) if (l.actorId) personIds.add(l.actorId);
  for (const v of c.versions) if (v.createdById) personIds.add(v.createdById);
  const people = personIds.size
    ? await prisma.user.findMany({
        where: { id: { in: [...personIds] } },
        select: { id: true, fullName: true, email: true },
      })
    : [];
  const nameOf = (uid: string | null): string | null => {
    if (!uid) return null;
    const p = people.find((x) => x.id === uid);
    return p ? (p.fullName ?? p.email ?? null) : null;
  };

  return {
    id: c.id,
    contractNo: c.contractNo,
    title: c.title,
    version: c.version,
    status: c.status,
    value: num(c.value),
    projectId: c.projectId,
    quotationId: c.quotationId,
    project: { code: c.project.code, name: c.project.name },
    client: { name: c.client.name, email: c.client.primaryEmail },
    quotation: {
      quotationNo: c.quotation.quotationNo,
      total: num(c.quotation.total),
      version: c.quotation.version,
    },
    scope: c.scope,
    paymentTerms: c.paymentTerms,
    warranty: c.warranty,
    notes: c.notes,
    startDate: isoDate(c.startDate),
    endDate: isoDate(c.endDate),
    approvedAt: iso(c.approvedAt),
    signedAt: iso(c.signedAt),
    clientSignedAt: iso(c.clientSignedAt),
    cancelledAt: iso(c.cancelledAt),
    completedAt: iso(c.completedAt),
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
    archived: c.deletedAt !== null,
    milestones: c.milestones.map((m) => ({
      id: m.id,
      title: m.title,
      percentage: num(m.percentage),
      amount: num(m.amount),
      dueDate: isoDate(m.dueDate),
      paymentStatus: m.paymentStatus,
      invoiceStatus: m.invoiceStatus,
      sortOrder: m.sortOrder,
    })),
    files: c.files.map((f) => ({
      id: f.id,
      fileName: f.fileName,
      fileUrl: f.fileUrl,
      mimeType: f.mimeType,
      createdAt: f.createdAt.toISOString(),
    })),
    comments: c.comments.map((cm) => ({
      id: cm.id,
      body: cm.body,
      authorName: nameOf(cm.authorId),
      createdAt: cm.createdAt.toISOString(),
    })),
    logs: c.logs.map((l) => ({
      id: l.id,
      action: l.action,
      detail: l.detail,
      actorName: nameOf(l.actorId),
      createdAt: l.createdAt.toISOString(),
    })),
    versions: c.versions.map((v) => ({
      id: v.id,
      version: v.version,
      note: v.note,
      createdByName: nameOf(v.createdById),
      createdAt: v.createdAt.toISOString(),
    })),
  };
}

export async function getContractContext(
  id: string
): Promise<ContractContext | null> {
  const c = await prisma.contract.findUnique({
    where: { id },
    select: { id: true, status: true, projectId: true, quotationId: true, value: true },
  });
  return c
    ? {
        id: c.id,
        status: c.status,
        projectId: c.projectId,
        quotationId: c.quotationId,
        value: num(c.value),
      }
    : null;
}

export async function listApprovedQuotationOptions(): Promise<
  ApprovedQuotationOption[]
> {
  const quotes = await prisma.quotation.findMany({
    where: {
      status: "approved",
      deletedAt: null,
      // No live (non-cancelled, non-deleted) contract yet.
      contracts: {
        none: { deletedAt: null, status: { not: "cancelled" } },
      },
    },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      quotationNo: true,
      projectId: true,
      total: true,
      project: { select: { name: true } },
    },
  });
  return quotes.map((q) => ({
    id: q.id,
    quotationNo: q.quotationNo,
    projectId: q.projectId,
    projectName: q.project.name,
    total: num(q.total),
  }));
}

// ---- Number generation ------------------------------------------------------

async function nextContractNumber(db: Db): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `CT-${year}-`;
  const last = await db.contract.findFirst({
    where: { contractNo: { startsWith: prefix } },
    orderBy: { contractNo: "desc" },
    select: { contractNo: true },
  });
  const n = last ? Number.parseInt(last.contractNo.slice(prefix.length), 10) + 1 : 1;
  return `${prefix}${String(n).padStart(4, "0")}`;
}

// ---- Snapshot ---------------------------------------------------------------

async function buildSnapshot(
  db: Db,
  contractId: string
): Promise<Prisma.InputJsonValue> {
  const c = await db.contract.findUniqueOrThrow({
    where: { id: contractId },
    include: { milestones: { orderBy: { sortOrder: "asc" } } },
  });
  return {
    contractNo: c.contractNo,
    title: c.title,
    status: c.status,
    value: c.value.toString(),
    scope: c.scope,
    paymentTerms: c.paymentTerms,
    warranty: c.warranty,
    notes: c.notes,
    startDate: isoDate(c.startDate),
    endDate: isoDate(c.endDate),
    milestones: c.milestones.map((m) => ({
      title: m.title,
      percentage: m.percentage.toString(),
      amount: m.amount.toString(),
      dueDate: isoDate(m.dueDate),
      paymentStatus: m.paymentStatus,
      invoiceStatus: m.invoiceStatus,
    })),
    capturedAt: new Date().toISOString(),
  };
}

// ---- Lifecycle writes -------------------------------------------------------

export async function generateContract(
  quotationId: string,
  actorId: string
): Promise<string> {
  const quotation = await prisma.quotation.findFirst({
    where: { id: quotationId, status: "approved", deletedAt: null },
    select: {
      id: true,
      projectId: true,
      clientId: true,
      total: true,
      title: true,
      paymentTerms: true,
      warranty: true,
      scope: true,
    },
  });
  if (!quotation) throw new Error("Approved quotation not found.");

  const existing = await prisma.contract.count({
    where: { quotationId, deletedAt: null, status: { not: "cancelled" } },
  });
  if (existing > 0) {
    throw new Error("An active contract already exists for this quotation.");
  }

  const value = num(quotation.total);
  // Seed milestones: Down 30%, Progress 40%, Final 30% (final absorbs rounding).
  const down = round2(value * 0.3);
  const progress = round2(value * 0.4);
  const final = round2(value - down - progress);

  return prisma.$transaction(async (tx) => {
    const contractNo = await nextContractNumber(tx);
    const contract = await tx.contract.create({
      data: {
        contractNo,
        quotationId: quotation.id,
        projectId: quotation.projectId,
        clientId: quotation.clientId,
        title: quotation.title
          ? `Contract — ${quotation.title}`
          : `Contract ${contractNo}`,
        version: 1,
        status: "draft",
        value,
        scope: quotation.scope,
        paymentTerms: quotation.paymentTerms,
        warranty: quotation.warranty,
        createdById: actorId,
        updatedById: actorId,
        milestones: {
          create: [
            { title: "Down Payment", percentage: 30, amount: down, sortOrder: 0 },
            { title: "Progress Payment", percentage: 40, amount: progress, sortOrder: 1 },
            { title: "Final Payment", percentage: 30, amount: final, sortOrder: 2 },
          ],
        },
      },
      select: { id: true },
    });

    await tx.contractVersion.create({
      data: {
        contractId: contract.id,
        version: 1,
        snapshot: await buildSnapshot(tx, contract.id),
        note: "Generated from quotation",
        createdById: actorId,
      },
    });
    await writeLog(
      tx,
      contract.id,
      actorId,
      "created",
      `Generated from quotation ${quotationId}`
    );
    return contract.id;
  });
}

export async function updateContractHeader(
  id: string,
  input: ContractHeaderInput,
  actorId: string
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    await tx.contract.update({
      where: { id },
      data: {
        title: input.title ?? null,
        scope: input.scope ?? null,
        paymentTerms: input.paymentTerms ?? null,
        warranty: input.warranty ?? null,
        notes: input.notes ?? null,
        startDate: input.startDate ?? null,
        endDate: input.endDate ?? null,
        updatedById: actorId,
      },
    });
    await writeLog(tx, id, actorId, "updated", "Contract details updated");
  });
}

const STATUS_DATA: Record<ContractStatus, () => Prisma.ContractUpdateInput> = {
  draft: () => ({
    approvedAt: null,
    approvedById: null,
    signedAt: null,
    signedById: null,
    clientSignedAt: null,
  }),
  pending_approval: () => ({}),
  approved: () => ({ approvedAt: new Date() }),
  signed: () => ({ signedAt: new Date(), clientSignedAt: new Date() }),
  cancelled: () => ({ cancelledAt: new Date() }),
  completed: () => ({ completedAt: new Date() }),
};

export async function setContractStatus(
  id: string,
  status: ContractStatus,
  actorId: string
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const extra = STATUS_DATA[status]();
    await tx.contract.update({
      where: { id },
      data: {
        status,
        updatedById: actorId,
        approvedById: status === "approved" ? actorId : extra.approvedById,
        signedById: status === "signed" ? actorId : extra.signedById,
        ...extra,
      },
    });
    await writeLog(tx, id, actorId, "status_changed", status);
  });
}

export async function createContractVersion(
  id: string,
  note: string | undefined,
  actorId: string
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const max = await tx.contractVersion.aggregate({
      where: { contractId: id },
      _max: { version: true },
    });
    const version = (max._max.version ?? 0) + 1;
    await tx.contractVersion.create({
      data: {
        contractId: id,
        version,
        snapshot: await buildSnapshot(tx, id),
        note: note ?? null,
        createdById: actorId,
      },
    });
    await tx.contract.update({
      where: { id },
      data: { version, updatedById: actorId },
    });
    await writeLog(tx, id, actorId, "version_created", `v${version}`);
  });
}

export async function archiveContract(id: string, actorId: string): Promise<void> {
  await prisma.$transaction(async (tx) => {
    await tx.contract.update({
      where: { id },
      data: { deletedAt: new Date(), updatedById: actorId },
    });
    await writeLog(tx, id, actorId, "archived");
  });
}

export async function restoreContract(id: string, actorId: string): Promise<void> {
  await prisma.$transaction(async (tx) => {
    await tx.contract.update({
      where: { id },
      data: { deletedAt: null, updatedById: actorId },
    });
    await writeLog(tx, id, actorId, "restored");
  });
}

// ---- Milestones -------------------------------------------------------------

export async function addMilestone(
  contractId: string,
  actorId: string
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const max = await tx.contractMilestone.aggregate({
      where: { contractId },
      _max: { sortOrder: true },
    });
    await tx.contractMilestone.create({
      data: {
        contractId,
        title: "New milestone",
        sortOrder: (max._max.sortOrder ?? -1) + 1,
      },
    });
    await writeLog(tx, contractId, actorId, "milestone_added");
  });
}

export async function updateMilestone(
  milestoneId: string,
  contractId: string,
  input: MilestoneInput,
  actorId: string
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    await tx.contractMilestone.update({
      where: { id: milestoneId },
      data: {
        title: input.title,
        percentage: input.percentage,
        amount: input.amount,
        dueDate: input.dueDate ?? null,
      },
    });
    await writeLog(tx, contractId, actorId, "milestone_updated", input.title);
  });
}

export async function updateMilestoneStatus(
  milestoneId: string,
  contractId: string,
  data: { paymentStatus?: string; invoiceStatus?: string },
  actorId: string
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    await tx.contractMilestone.update({
      where: { id: milestoneId },
      data: {
        ...(data.paymentStatus
          ? { paymentStatus: data.paymentStatus as never }
          : {}),
        ...(data.invoiceStatus
          ? { invoiceStatus: data.invoiceStatus as never }
          : {}),
      },
    });
    await writeLog(
      tx,
      contractId,
      actorId,
      "milestone_status",
      `${data.paymentStatus ?? ""} ${data.invoiceStatus ?? ""}`.trim()
    );
  });
}

export async function deleteMilestone(
  milestoneId: string,
  contractId: string,
  actorId: string
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    await tx.contractMilestone.delete({ where: { id: milestoneId } });
    await writeLog(tx, contractId, actorId, "milestone_deleted");
  });
}

// ---- Comments ---------------------------------------------------------------

export async function addComment(
  contractId: string,
  authorId: string,
  body: string
): Promise<void> {
  await prisma.contractComment.create({
    data: { contractId, authorId, body },
  });
  await writeLog(prisma, contractId, authorId, "comment_added");
}

export async function deleteComment(
  commentId: string,
  contractId: string,
  actorId: string
): Promise<void> {
  await prisma.contractComment.update({
    where: { id: commentId },
    data: { deletedAt: new Date() },
  });
  await writeLog(prisma, contractId, actorId, "comment_deleted");
}

// ---- Files ------------------------------------------------------------------

export async function addFile(
  contractId: string,
  data: { fileName: string; fileUrl: string; mimeType?: string },
  actorId: string
): Promise<void> {
  await prisma.contractFile.create({
    data: {
      contractId,
      fileName: data.fileName,
      fileUrl: data.fileUrl,
      mimeType: data.mimeType ?? null,
      uploadedById: actorId,
    },
  });
  await writeLog(prisma, contractId, actorId, "file_added", data.fileName);
}

export async function deleteFile(
  fileId: string,
  contractId: string,
  actorId: string
): Promise<void> {
  await prisma.contractFile.update({
    where: { id: fileId },
    data: { deletedAt: new Date() },
  });
  await writeLog(prisma, contractId, actorId, "file_removed");
}

export async function getMilestoneContractId(
  milestoneId: string
): Promise<string | null> {
  const m = await prisma.contractMilestone.findUnique({
    where: { id: milestoneId },
    select: { contractId: true },
  });
  return m?.contractId ?? null;
}
