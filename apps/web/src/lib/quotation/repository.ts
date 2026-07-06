import { Prisma, type QuotationStatus } from "@artiverges/database";
import { prisma } from "@/lib/db";
import type { CurrentUser } from "@/lib/auth/session";
import { computeQuotationTotals, type DiscountType } from "./calc";
import { visibleQuotationStatuses, canManageQuotation } from "./permissions";

/**
 * Quotation repository. Sole data-access point; access enforced here because
 * Prisma bypasses RLS. Decimal/Date mapped to plain primitives for the UI.
 */

// ---- DTOs -------------------------------------------------------------------

export type QuotationItemDto = {
  id: string;
  description: string;
  unit: string | null;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  sortOrder: number;
};

export type QuotationSummaryDto = {
  id: string;
  quotationNo: string;
  version: number;
  title: string | null;
  status: QuotationStatus;
  total: number;
  issueDate: string | null;
  expiryDate: string | null;
  updatedAt: string;
  expired: boolean;
};

export type QuotationDetailDto = {
  id: string;
  quotationNo: string;
  version: number;
  title: string | null;
  status: QuotationStatus;
  projectId: string;
  project: { code: string; name: string };
  client: { name: string; email: string | null };
  boq: { id: string; version: number } | null;
  issueDate: string | null;
  expiryDate: string | null;
  paymentTerms: string | null;
  warranty: string | null;
  scope: string | null;
  excludedItems: string | null;
  notes: string | null;
  discountType: DiscountType;
  discountValue: number;
  discountAmount: number;
  taxPct: number;
  taxAmount: number;
  subtotal: number;
  total: number;
  items: QuotationItemDto[];
  expired: boolean;
  sentAt: string | null;
  approvedAt: string | null;
  updatedAt: string;
};

export type ApprovedBoqOption = {
  id: string;
  version: number;
  title: string | null;
  sellingTotal: number;
};

export type QuotationWriteInput = {
  title?: string;
  issueDate?: Date;
  expiryDate?: Date;
  paymentTerms?: string;
  warranty?: string;
  scope?: string;
  excludedItems?: string;
  notes?: string;
  discountType: DiscountType;
  discountValue: number;
  taxPct: number;
};

// ---- Helpers ----------------------------------------------------------------

const num = (d: Prisma.Decimal): number => d.toNumber();
const isoDate = (d: Date | null): string | null =>
  d === null ? null : d.toISOString().slice(0, 10);

function isExpired(status: QuotationStatus, expiry: Date | null): boolean {
  if (!expiry) return false;
  if (status !== "sent" && status !== "viewed") return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return expiry < today;
}

async function canViewProjectQuotations(
  user: CurrentUser,
  projectId: string
): Promise<boolean> {
  if (canManageQuotation(user.role)) return true;
  if (user.role === "client") {
    const p = await prisma.project.findUnique({
      where: { id: projectId },
      select: { client: { select: { portalUserId: true } } },
    });
    return p?.client.portalUserId === user.id;
  }
  return false;
}

function canViewStatus(user: CurrentUser, status: QuotationStatus): boolean {
  const allowed = visibleQuotationStatuses(user.role);
  return allowed === null || allowed.includes(status);
}

// ---- Reads ------------------------------------------------------------------

export type ProjectQuotationList = {
  project: { id: string; code: string; name: string; clientName: string };
  quotations: QuotationSummaryDto[];
};

export async function listQuotationsForProject(
  user: CurrentUser,
  projectId: string
): Promise<ProjectQuotationList | null> {
  if (!(await canViewProjectQuotations(user, projectId))) return null;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true, code: true, name: true, client: { select: { name: true } } },
  });
  if (!project) return null;

  const rows = await prisma.quotation.findMany({
    where: { projectId, deletedAt: null },
    orderBy: [{ version: "desc" }],
    select: {
      id: true,
      quotationNo: true,
      version: true,
      title: true,
      status: true,
      total: true,
      issueDate: true,
      expiryDate: true,
      updatedAt: true,
    },
  });

  const quotations = rows
    .filter((q) => canViewStatus(user, q.status))
    .map((q) => ({
      id: q.id,
      quotationNo: q.quotationNo,
      version: q.version,
      title: q.title,
      status: q.status,
      total: num(q.total),
      issueDate: isoDate(q.issueDate),
      expiryDate: isoDate(q.expiryDate),
      updatedAt: q.updatedAt.toISOString(),
      expired: isExpired(q.status, q.expiryDate),
    }));

  return {
    project: {
      id: project.id,
      code: project.code,
      name: project.name,
      clientName: project.client.name,
    },
    quotations,
  };
}

export async function getQuotation(
  user: CurrentUser,
  id: string
): Promise<QuotationDetailDto | null> {
  const q = await prisma.quotation.findFirst({
    where: { id, deletedAt: null },
    include: {
      items: { orderBy: { sortOrder: "asc" } },
      project: { select: { code: true, name: true } },
      client: { select: { name: true, primaryEmail: true } },
      boq: { select: { id: true, version: true } },
    },
  });
  if (!q) return null;
  if (!(await canViewProjectQuotations(user, q.projectId))) return null;
  if (!canViewStatus(user, q.status)) return null;

  return {
    id: q.id,
    quotationNo: q.quotationNo,
    version: q.version,
    title: q.title,
    status: q.status,
    projectId: q.projectId,
    project: { code: q.project.code, name: q.project.name },
    client: { name: q.client.name, email: q.client.primaryEmail },
    boq: q.boq ? { id: q.boq.id, version: q.boq.version } : null,
    issueDate: isoDate(q.issueDate),
    expiryDate: isoDate(q.expiryDate),
    paymentTerms: q.paymentTerms,
    warranty: q.warranty,
    scope: q.scope,
    excludedItems: q.excludedItems,
    notes: q.notes,
    discountType: (q.discountType as DiscountType) ?? "amount",
    discountValue: num(q.discountValue),
    discountAmount: num(q.discount),
    taxPct: num(q.taxPct),
    taxAmount: num(q.taxAmount),
    subtotal: num(q.subtotal),
    total: num(q.total),
    items: q.items.map((i) => ({
      id: i.id,
      description: i.description,
      unit: i.unit,
      quantity: num(i.quantity),
      unitPrice: num(i.unitPrice),
      lineTotal: num(i.lineTotal),
      sortOrder: i.sortOrder,
    })),
    expired: isExpired(q.status, q.expiryDate),
    sentAt: q.sentAt?.toISOString() ?? null,
    approvedAt: q.approvedAt?.toISOString() ?? null,
    updatedAt: q.updatedAt.toISOString(),
  };
}

export async function listApprovedBoqs(
  projectId: string
): Promise<ApprovedBoqOption[]> {
  const boqs = await prisma.boq.findMany({
    where: { projectId, status: "approved", deletedAt: null },
    orderBy: { version: "desc" },
    select: {
      id: true,
      version: true,
      title: true,
      sections: {
        select: {
          categories: {
            select: { items: { select: { quantity: true, sellingPrice: true } } },
          },
        },
      },
    },
  });

  return boqs.map((b) => {
    let sellingTotal = 0;
    for (const s of b.sections)
      for (const c of s.categories)
        for (const i of c.items)
          sellingTotal += num(i.quantity) * num(i.sellingPrice);
    return {
      id: b.id,
      version: b.version,
      title: b.title,
      sellingTotal: Math.round(sellingTotal * 100) / 100,
    };
  });
}

export async function getQuotationContext(
  id: string
): Promise<{ id: string; status: QuotationStatus; projectId: string } | null> {
  const q = await prisma.quotation.findUnique({
    where: { id },
    select: { id: true, status: true, projectId: true },
  });
  return q ? { id: q.id, status: q.status, projectId: q.projectId } : null;
}

// ---- Number generation ------------------------------------------------------

async function nextQuotationNumber(
  tx: Prisma.TransactionClient
): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `QT-${year}-`;
  const last = await tx.quotation.findFirst({
    where: { quotationNo: { startsWith: prefix } },
    orderBy: { quotationNo: "desc" },
    select: { quotationNo: true },
  });
  const n = last ? Number.parseInt(last.quotationNo.slice(prefix.length), 10) + 1 : 1;
  return `${prefix}${String(n).padStart(4, "0")}`;
}

// ---- Writes -----------------------------------------------------------------

export async function generateFromBoq(
  projectId: string,
  boqId: string,
  actorId: string
): Promise<string> {
  const boq = await prisma.boq.findFirst({
    where: { id: boqId, projectId, status: "approved", deletedAt: null },
    include: {
      project: { select: { clientId: true } },
      sections: {
        orderBy: { sortOrder: "asc" },
        include: {
          categories: {
            orderBy: { sortOrder: "asc" },
            include: { items: { orderBy: { sortOrder: "asc" } } },
          },
        },
      },
    },
  });
  if (!boq) throw new Error("Approved BOQ not found for this project.");

  // Snapshot selling lines from the BOQ.
  const lines: {
    description: string;
    unit: string | null;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
    sortOrder: number;
  }[] = [];
  let order = 0;
  let subtotal = 0;
  for (const s of boq.sections) {
    for (const c of s.categories) {
      for (const i of c.items) {
        const quantity = num(i.quantity);
        const unitPrice = num(i.sellingPrice);
        const lineTotal = Math.round(quantity * unitPrice * 100) / 100;
        subtotal += lineTotal;
        lines.push({
          description: `${c.name}: ${i.description}`,
          unit: i.unit,
          quantity,
          unitPrice,
          lineTotal,
          sortOrder: order++,
        });
      }
    }
  }
  subtotal = Math.round(subtotal * 100) / 100;

  const issue = new Date();
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + 30);

  return prisma.$transaction(async (tx) => {
    const version =
      ((
        await tx.quotation.aggregate({
          where: { projectId },
          _max: { version: true },
        })
      )._max.version ?? 0) + 1;

    const quotationNo = await nextQuotationNumber(tx);

    const quotation = await tx.quotation.create({
      data: {
        quotationNo,
        projectId,
        clientId: boq.project.clientId,
        boqId: boq.id,
        version,
        title: boq.title ? `Quotation — ${boq.title}` : `Quotation v${version}`,
        status: "draft",
        issueDate: issue,
        expiryDate: expiry,
        discountType: "amount",
        discountValue: 0,
        discount: 0,
        taxPct: 0,
        taxAmount: 0,
        subtotal,
        total: subtotal,
        createdById: actorId,
        updatedById: actorId,
      },
      select: { id: true },
    });

    if (lines.length > 0) {
      await tx.quotationItem.createMany({
        data: lines.map((l) => ({ quotationId: quotation.id, ...l })),
      });
    }
    return quotation.id;
  });
}

export async function updateQuotation(
  id: string,
  input: QuotationWriteInput,
  actorId: string
): Promise<void> {
  const agg = await prisma.quotationItem.aggregate({
    where: { quotationId: id },
    _sum: { lineTotal: true },
  });
  const subtotal = agg._sum.lineTotal ? num(agg._sum.lineTotal) : 0;

  const totals = computeQuotationTotals({
    subtotal,
    discountType: input.discountType,
    discountValue: input.discountValue,
    taxPct: input.taxPct,
  });

  await prisma.quotation.update({
    where: { id },
    data: {
      title: input.title ?? null,
      issueDate: input.issueDate ?? null,
      expiryDate: input.expiryDate ?? null,
      paymentTerms: input.paymentTerms ?? null,
      warranty: input.warranty ?? null,
      scope: input.scope ?? null,
      excludedItems: input.excludedItems ?? null,
      notes: input.notes ?? null,
      discountType: input.discountType,
      discountValue: input.discountValue,
      discount: totals.discountAmount,
      taxPct: input.taxPct,
      taxAmount: totals.taxAmount,
      subtotal: totals.subtotal,
      total: totals.total,
      updatedById: actorId,
    },
  });
}

export async function duplicateQuotation(
  id: string,
  actorId: string
): Promise<string> {
  const src = await prisma.quotation.findUnique({
    where: { id },
    include: { items: { orderBy: { sortOrder: "asc" } } },
  });
  if (!src) throw new Error("Quotation not found.");

  const issue = new Date();
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + 30);

  return prisma.$transaction(async (tx) => {
    const version =
      ((
        await tx.quotation.aggregate({
          where: { projectId: src.projectId },
          _max: { version: true },
        })
      )._max.version ?? 0) + 1;
    const quotationNo = await nextQuotationNumber(tx);

    const copy = await tx.quotation.create({
      data: {
        quotationNo,
        projectId: src.projectId,
        clientId: src.clientId,
        boqId: src.boqId,
        version,
        title: src.title ? `${src.title} (rev)` : `Quotation v${version}`,
        status: "draft",
        issueDate: issue,
        expiryDate: expiry,
        paymentTerms: src.paymentTerms,
        warranty: src.warranty,
        scope: src.scope,
        excludedItems: src.excludedItems,
        notes: src.notes,
        discountType: src.discountType,
        discountValue: src.discountValue,
        discount: src.discount,
        taxPct: src.taxPct,
        taxAmount: src.taxAmount,
        subtotal: src.subtotal,
        total: src.total,
        createdById: actorId,
        updatedById: actorId,
      },
      select: { id: true },
    });

    if (src.items.length > 0) {
      await tx.quotationItem.createMany({
        data: src.items.map((i) => ({
          quotationId: copy.id,
          description: i.description,
          unit: i.unit,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          lineTotal: i.lineTotal,
          sortOrder: i.sortOrder,
        })),
      });
    }
    return copy.id;
  });
}

export async function setQuotationStatus(
  id: string,
  status: QuotationStatus,
  actorId: string
): Promise<void> {
  await prisma.quotation.update({
    where: { id },
    data: {
      status,
      updatedById: actorId,
      sentAt: status === "sent" ? new Date() : undefined,
      viewedAt: status === "viewed" ? new Date() : undefined,
      approvedAt: status === "approved" ? new Date() : undefined,
      rejectedAt: status === "rejected" ? new Date() : undefined,
    },
  });
}

export async function archiveQuotation(
  id: string,
  actorId: string
): Promise<void> {
  await prisma.quotation.update({
    where: { id },
    data: { deletedAt: new Date(), updatedById: actorId },
  });
}
