import { Prisma, type BoqStatus } from "@artiverges/database";
import { prisma } from "@/lib/db";
import type { CurrentUser } from "@/lib/auth/session";
import { sumTotals, type BoqTotals, type ItemCosts } from "./calc";
import { visibleStatusesFor } from "./permissions";

/**
 * BOQ repository (repository pattern). Sole data-access point for BOQs;
 * all access control is enforced here because Prisma bypasses RLS.
 * Prisma Decimal/Date values are mapped to plain primitives for the UI.
 */

// ---- DTOs -------------------------------------------------------------------

export type BoqItemDto = {
  id: string;
  categoryId: string;
  itemCode: string | null;
  description: string;
  unit: string | null;
  quantity: number;
  materialCost: number;
  laborCost: number;
  equipmentCost: number;
  overhead: number;
  sellingPrice: number;
  materialId: string | null;
  supplierId: string | null;
  notes: string | null;
  sortOrder: number;
};

export type BoqCategoryDto = {
  id: string;
  name: string;
  sortOrder: number;
  items: BoqItemDto[];
};

export type BoqSectionDto = {
  id: string;
  name: string;
  sortOrder: number;
  categories: BoqCategoryDto[];
};

export type BoqTreeDto = {
  id: string;
  projectId: string;
  version: number;
  status: BoqStatus;
  title: string | null;
  notes: string | null;
  updatedAt: string;
  approvedAt: string | null;
  project: { code: string; name: string; clientName: string };
  sections: BoqSectionDto[];
  totals: BoqTotals;
};

export type BoqSummaryDto = {
  id: string;
  version: number;
  status: BoqStatus;
  title: string | null;
  updatedAt: string;
  totals: BoqTotals;
  isLatest: boolean;
};

export type SupplierOption = { id: string; name: string };

// ---- Prisma shapes ----------------------------------------------------------

const treeInclude = {
  sections: {
    orderBy: { sortOrder: "asc" },
    include: {
      categories: {
        orderBy: { sortOrder: "asc" },
        include: { items: { orderBy: { sortOrder: "asc" } } },
      },
    },
  },
} satisfies Prisma.BoqInclude;

type BoqTreeRow = Prisma.BoqGetPayload<{ include: typeof treeInclude }>;
type ItemRow = BoqTreeRow["sections"][number]["categories"][number]["items"][number];

const num = (d: Prisma.Decimal): number => d.toNumber();

function itemToDto(i: ItemRow): BoqItemDto {
  return {
    id: i.id,
    categoryId: i.categoryId,
    itemCode: i.itemCode,
    description: i.description,
    unit: i.unit,
    quantity: num(i.quantity),
    materialCost: num(i.materialCost),
    laborCost: num(i.laborCost),
    equipmentCost: num(i.equipmentCost),
    overhead: num(i.overhead),
    sellingPrice: num(i.sellingPrice),
    materialId: i.materialId,
    supplierId: i.supplierId,
    notes: i.notes,
    sortOrder: i.sortOrder,
  };
}

function flattenCosts(row: BoqTreeRow): ItemCosts[] {
  const out: ItemCosts[] = [];
  for (const s of row.sections)
    for (const c of s.categories)
      for (const i of c.items)
        out.push({
          quantity: num(i.quantity),
          materialCost: num(i.materialCost),
          laborCost: num(i.laborCost),
          equipmentCost: num(i.equipmentCost),
          overhead: num(i.overhead),
          sellingPrice: num(i.sellingPrice),
        });
  return out;
}

// ---- Access scoping ---------------------------------------------------------

type ProjectScope = {
  clientPortalUserId: string | null;
  managerId: string | null;
  memberIds: string[];
};

async function loadProjectScope(projectId: string): Promise<ProjectScope | null> {
  const p = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      managerId: true,
      client: { select: { portalUserId: true } },
      members: { select: { userId: true } },
    },
  });
  if (!p) return null;
  return {
    clientPortalUserId: p.client.portalUserId,
    managerId: p.managerId,
    memberIds: p.members.map((m) => m.userId),
  };
}

export function canViewProject(user: CurrentUser, scope: ProjectScope): boolean {
  if (["owner", "admin", "ae"].includes(user.role)) return true;
  if (user.role === "client") return scope.clientPortalUserId === user.id;
  // site_engineer / worker
  return scope.managerId === user.id || scope.memberIds.includes(user.id);
}

function canViewStatus(user: CurrentUser, status: BoqStatus): boolean {
  const allowed = visibleStatusesFor(user.role);
  return allowed === null || allowed.includes(status);
}

// ---- Reads ------------------------------------------------------------------

export type ProjectBoqList = {
  project: { id: string; code: string; name: string; clientName: string };
  boqs: BoqSummaryDto[];
};

export async function listBoqsForProject(
  user: CurrentUser,
  projectId: string
): Promise<ProjectBoqList | null> {
  const scope = await loadProjectScope(projectId);
  if (!scope || !canViewProject(user, scope)) return null;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true, code: true, name: true, client: { select: { name: true } } },
  });
  if (!project) return null;

  const rows = await prisma.boq.findMany({
    where: { projectId, deletedAt: null },
    include: treeInclude,
    orderBy: { version: "desc" },
  });

  const visible = rows.filter((b) => canViewStatus(user, b.status));

  // Latest = highest version among non-archived BOQs.
  const latestVersion = Math.max(
    0,
    ...rows.filter((b) => b.status !== "archived").map((b) => b.version)
  );

  const boqs: BoqSummaryDto[] = visible.map((b) => ({
    id: b.id,
    version: b.version,
    status: b.status,
    title: b.title,
    updatedAt: b.updatedAt.toISOString(),
    totals: sumTotals(flattenCosts(b)),
    isLatest: b.version === latestVersion && b.status !== "archived",
  }));

  return {
    project: {
      id: project.id,
      code: project.code,
      name: project.name,
      clientName: project.client.name,
    },
    boqs,
  };
}

export async function getBoqTree(
  user: CurrentUser,
  boqId: string
): Promise<BoqTreeDto | null> {
  const b = await prisma.boq.findFirst({
    where: { id: boqId, deletedAt: null },
    include: {
      ...treeInclude,
      project: {
        select: { id: true, code: true, name: true, client: { select: { name: true } } },
      },
    },
  });
  if (!b) return null;

  const scope = await loadProjectScope(b.projectId);
  if (!scope || !canViewProject(user, scope)) return null;
  if (!canViewStatus(user, b.status)) return null;

  return {
    id: b.id,
    projectId: b.projectId,
    version: b.version,
    status: b.status,
    title: b.title,
    notes: b.notes,
    updatedAt: b.updatedAt.toISOString(),
    approvedAt: b.approvedAt?.toISOString() ?? null,
    project: {
      code: b.project.code,
      name: b.project.name,
      clientName: b.project.client.name,
    },
    sections: b.sections.map((s) => ({
      id: s.id,
      name: s.name,
      sortOrder: s.sortOrder,
      categories: s.categories.map((c) => ({
        id: c.id,
        name: c.name,
        sortOrder: c.sortOrder,
        items: c.items.map(itemToDto),
      })),
    })),
    totals: sumTotals(flattenCosts(b)),
  };
}

export async function listSupplierOptions(): Promise<SupplierOption[]> {
  const rows = await prisma.supplier.findMany({
    where: { deletedAt: null },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
  return rows;
}

// ---- Authz context resolvers ------------------------------------------------

export type BoqContext = { boqId: string; status: BoqStatus; projectId: string };

export async function getBoqContext(boqId: string): Promise<BoqContext | null> {
  const b = await prisma.boq.findUnique({
    where: { id: boqId },
    select: { id: true, status: true, projectId: true },
  });
  return b ? { boqId: b.id, status: b.status, projectId: b.projectId } : null;
}

async function contextFromSection(sectionId: string): Promise<BoqContext | null> {
  const s = await prisma.boqSection.findUnique({
    where: { id: sectionId },
    select: { boq: { select: { id: true, status: true, projectId: true } } },
  });
  return s
    ? { boqId: s.boq.id, status: s.boq.status, projectId: s.boq.projectId }
    : null;
}

async function contextFromCategory(categoryId: string): Promise<BoqContext | null> {
  const c = await prisma.boqCategory.findUnique({
    where: { id: categoryId },
    select: {
      section: { select: { boq: { select: { id: true, status: true, projectId: true } } } },
    },
  });
  const b = c?.section.boq;
  return b ? { boqId: b.id, status: b.status, projectId: b.projectId } : null;
}

async function contextFromItem(itemId: string): Promise<BoqContext | null> {
  const i = await prisma.boqItem.findUnique({
    where: { id: itemId },
    select: {
      category: {
        select: {
          section: { select: { boq: { select: { id: true, status: true, projectId: true } } } },
        },
      },
    },
  });
  const b = i?.category.section.boq;
  return b ? { boqId: b.id, status: b.status, projectId: b.projectId } : null;
}

export {
  contextFromSection,
  contextFromCategory,
  contextFromItem,
  loadProjectScope,
};

// ---- Lifecycle writes -------------------------------------------------------

export async function createBoq(
  projectId: string,
  title: string | undefined,
  actorId: string
): Promise<string> {
  const max = await prisma.boq.aggregate({
    where: { projectId },
    _max: { version: true },
  });
  const version = (max._max.version ?? 0) + 1;
  const boq = await prisma.boq.create({
    data: {
      projectId,
      version,
      status: "draft",
      title: title ?? `BOQ v${version}`,
      createdById: actorId,
      updatedById: actorId,
    },
    select: { id: true },
  });
  return boq.id;
}

/** Deep-copy a BOQ into a new draft version (Duplicate / New Version). */
export async function copyBoq(
  sourceBoqId: string,
  actorId: string,
  titleSuffix: string
): Promise<string> {
  const source = await prisma.boq.findUnique({
    where: { id: sourceBoqId },
    include: treeInclude,
  });
  if (!source) throw new Error("Source BOQ not found.");

  const max = await prisma.boq.aggregate({
    where: { projectId: source.projectId },
    _max: { version: true },
  });
  const version = (max._max.version ?? 0) + 1;

  return prisma.$transaction(async (tx) => {
    const boq = await tx.boq.create({
      data: {
        projectId: source.projectId,
        version,
        status: "draft",
        title: `${source.title ?? "BOQ"}${titleSuffix}`,
        notes: source.notes,
        createdById: actorId,
        updatedById: actorId,
      },
      select: { id: true },
    });

    for (const s of source.sections) {
      const section = await tx.boqSection.create({
        data: { boqId: boq.id, name: s.name, sortOrder: s.sortOrder },
        select: { id: true },
      });
      for (const c of s.categories) {
        const category = await tx.boqCategory.create({
          data: { sectionId: section.id, name: c.name, sortOrder: c.sortOrder },
          select: { id: true },
        });
        if (c.items.length > 0) {
          await tx.boqItem.createMany({
            data: c.items.map((i) => ({
              categoryId: category.id,
              materialId: i.materialId,
              supplierId: i.supplierId,
              itemCode: i.itemCode,
              description: i.description,
              unit: i.unit,
              quantity: i.quantity,
              materialCost: i.materialCost,
              laborCost: i.laborCost,
              equipmentCost: i.equipmentCost,
              overhead: i.overhead,
              sellingPrice: i.sellingPrice,
              notes: i.notes,
              sortOrder: i.sortOrder,
            })),
          });
        }
      }
    }

    return boq.id;
  });
}

export async function updateBoqMeta(
  boqId: string,
  data: { title?: string; notes?: string },
  actorId: string
): Promise<void> {
  await prisma.boq.update({
    where: { id: boqId },
    data: {
      ...(data.title !== undefined ? { title: data.title } : {}),
      ...(data.notes !== undefined ? { notes: data.notes } : {}),
      updatedById: actorId,
    },
  });
}

export async function setBoqStatus(
  boqId: string,
  status: BoqStatus,
  actorId: string
): Promise<void> {
  await prisma.boq.update({
    where: { id: boqId },
    data: {
      status,
      updatedById: actorId,
      submittedAt: status === "submitted" ? new Date() : undefined,
      approvedAt: status === "approved" ? new Date() : undefined,
      approvedById: status === "approved" ? actorId : undefined,
    },
  });
}

export async function softDeleteBoq(boqId: string, actorId: string): Promise<void> {
  await prisma.boq.update({
    where: { id: boqId },
    data: { status: "archived", deletedAt: new Date(), updatedById: actorId },
  });
}

// ---- Structure writes -------------------------------------------------------

async function nextSortOrder(
  tx: Prisma.TransactionClient | typeof prisma,
  table: "section" | "category" | "item",
  parentId: string
): Promise<number> {
  if (table === "section") {
    const r = await tx.boqSection.aggregate({
      where: { boqId: parentId },
      _max: { sortOrder: true },
    });
    return (r._max.sortOrder ?? -1) + 1;
  }
  if (table === "category") {
    const r = await tx.boqCategory.aggregate({
      where: { sectionId: parentId },
      _max: { sortOrder: true },
    });
    return (r._max.sortOrder ?? -1) + 1;
  }
  const r = await tx.boqItem.aggregate({
    where: { categoryId: parentId },
    _max: { sortOrder: true },
  });
  return (r._max.sortOrder ?? -1) + 1;
}

export async function addSection(boqId: string, name: string): Promise<string> {
  const sortOrder = await nextSortOrder(prisma, "section", boqId);
  const s = await prisma.boqSection.create({
    data: { boqId, name, sortOrder },
    select: { id: true },
  });
  return s.id;
}

export async function renameSection(id: string, name: string): Promise<void> {
  await prisma.boqSection.update({ where: { id }, data: { name } });
}

export async function deleteSection(id: string): Promise<void> {
  await prisma.boqSection.delete({ where: { id } });
}

export async function addCategory(sectionId: string, name: string): Promise<string> {
  const sortOrder = await nextSortOrder(prisma, "category", sectionId);
  const c = await prisma.boqCategory.create({
    data: { sectionId, name, sortOrder },
    select: { id: true },
  });
  return c.id;
}

export async function renameCategory(id: string, name: string): Promise<void> {
  await prisma.boqCategory.update({ where: { id }, data: { name } });
}

export async function deleteCategory(id: string): Promise<void> {
  await prisma.boqCategory.delete({ where: { id } });
}

export type ItemPatch = Partial<{
  itemCode: string | null;
  description: string;
  unit: string | null;
  quantity: number;
  materialCost: number;
  laborCost: number;
  equipmentCost: number;
  overhead: number;
  sellingPrice: number;
  supplierId: string | null;
  notes: string | null;
}>;

export async function addItem(categoryId: string): Promise<string> {
  const sortOrder = await nextSortOrder(prisma, "item", categoryId);
  const i = await prisma.boqItem.create({
    data: { categoryId, description: "New item", sortOrder },
    select: { id: true },
  });
  return i.id;
}

export async function updateItem(id: string, patch: ItemPatch): Promise<void> {
  await prisma.boqItem.update({ where: { id }, data: patch });
}

export async function deleteItem(id: string): Promise<void> {
  await prisma.boqItem.delete({ where: { id } });
}

export async function duplicateItem(id: string): Promise<string> {
  const src = await prisma.boqItem.findUnique({ where: { id } });
  if (!src) throw new Error("Item not found.");
  const sortOrder = await nextSortOrder(prisma, "item", src.categoryId);
  const copy = await prisma.boqItem.create({
    data: {
      categoryId: src.categoryId,
      materialId: src.materialId,
      supplierId: src.supplierId,
      itemCode: src.itemCode,
      description: `${src.description} (copy)`,
      unit: src.unit,
      quantity: src.quantity,
      materialCost: src.materialCost,
      laborCost: src.laborCost,
      equipmentCost: src.equipmentCost,
      overhead: src.overhead,
      sellingPrice: src.sellingPrice,
      notes: src.notes,
      sortOrder,
    },
    select: { id: true },
  });
  return copy.id;
}

/** Swap sort order with the adjacent sibling in the given direction. */
async function reorder(
  kind: "section" | "category" | "item",
  id: string,
  direction: "up" | "down"
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    if (kind === "section") {
      const cur = await tx.boqSection.findUnique({ where: { id } });
      if (!cur) return;
      const neighbor = await tx.boqSection.findFirst({
        where: {
          boqId: cur.boqId,
          sortOrder: direction === "up" ? { lt: cur.sortOrder } : { gt: cur.sortOrder },
        },
        orderBy: { sortOrder: direction === "up" ? "desc" : "asc" },
      });
      if (!neighbor) return;
      await tx.boqSection.update({ where: { id: cur.id }, data: { sortOrder: neighbor.sortOrder } });
      await tx.boqSection.update({ where: { id: neighbor.id }, data: { sortOrder: cur.sortOrder } });
    } else if (kind === "category") {
      const cur = await tx.boqCategory.findUnique({ where: { id } });
      if (!cur) return;
      const neighbor = await tx.boqCategory.findFirst({
        where: {
          sectionId: cur.sectionId,
          sortOrder: direction === "up" ? { lt: cur.sortOrder } : { gt: cur.sortOrder },
        },
        orderBy: { sortOrder: direction === "up" ? "desc" : "asc" },
      });
      if (!neighbor) return;
      await tx.boqCategory.update({ where: { id: cur.id }, data: { sortOrder: neighbor.sortOrder } });
      await tx.boqCategory.update({ where: { id: neighbor.id }, data: { sortOrder: cur.sortOrder } });
    } else {
      const cur = await tx.boqItem.findUnique({ where: { id } });
      if (!cur) return;
      const neighbor = await tx.boqItem.findFirst({
        where: {
          categoryId: cur.categoryId,
          sortOrder: direction === "up" ? { lt: cur.sortOrder } : { gt: cur.sortOrder },
        },
        orderBy: { sortOrder: direction === "up" ? "desc" : "asc" },
      });
      if (!neighbor) return;
      await tx.boqItem.update({ where: { id: cur.id }, data: { sortOrder: neighbor.sortOrder } });
      await tx.boqItem.update({ where: { id: neighbor.id }, data: { sortOrder: cur.sortOrder } });
    }
  });
}

export const moveSection = (id: string, dir: "up" | "down") => reorder("section", id, dir);
export const moveCategory = (id: string, dir: "up" | "down") => reorder("category", id, dir);
export const moveItem = (id: string, dir: "up" | "down") => reorder("item", id, dir);
