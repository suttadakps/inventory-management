import { Prisma } from "@artiverges/database";
import { prisma } from "@/lib/db";

/**
 * Clients repository (repository pattern, docs/03 §4, docs/08 §6).
 * Sole data-access point for clients; access is gated by the app layer since
 * Prisma bypasses RLS. Prisma values are mapped to plain primitives so results
 * are safe to serialize to Client Components.
 */

export type ClientListItem = {
  id: string;
  name: string;
  type: string;
  contactPerson: string | null;
  email: string | null;
  phone: string | null;
  taxId: string | null;
  projectCount: number;
  archived: boolean;
};

export type ClientProjectRef = {
  id: string;
  code: string;
  name: string;
  status: string;
};

export type ClientDetail = ClientListItem & {
  address: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  projects: ClientProjectRef[];
};

export type ClientWriteInput = {
  name: string;
  type: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  taxId?: string;
  address?: string;
  notes?: string;
};

export type Paginated<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 100;

const listSelect = {
  id: true,
  name: true,
  type: true,
  contactPerson: true,
  primaryEmail: true,
  primaryPhone: true,
  taxId: true,
  deletedAt: true,
  // Count only active (non-archived) projects, to match the detail view.
  _count: { select: { projects: { where: { deletedAt: null } } } },
} satisfies Prisma.ClientSelect;

type ClientListRow = Prisma.ClientGetPayload<{ select: typeof listSelect }>;

function toListItem(c: ClientListRow): ClientListItem {
  return {
    id: c.id,
    name: c.name,
    type: c.type,
    contactPerson: c.contactPerson,
    email: c.primaryEmail,
    phone: c.primaryPhone,
    taxId: c.taxId,
    projectCount: c._count.projects,
    archived: c.deletedAt !== null,
  };
}

// ---- Reads ------------------------------------------------------------------

export async function listClients(opts: {
  q?: string;
  page?: number;
  pageSize?: number;
  includeArchived?: boolean;
}): Promise<Paginated<ClientListItem>> {
  const pageSize = Math.min(
    Math.max(1, opts.pageSize ?? DEFAULT_PAGE_SIZE),
    MAX_PAGE_SIZE
  );
  const page = Math.max(1, opts.page ?? 1);

  const filters: Prisma.ClientWhereInput[] = [];
  if (!opts.includeArchived) filters.push({ deletedAt: null });
  if (opts.q) {
    filters.push({
      OR: [
        { name: { contains: opts.q, mode: "insensitive" } },
        { contactPerson: { contains: opts.q, mode: "insensitive" } },
        { primaryEmail: { contains: opts.q, mode: "insensitive" } },
        { taxId: { contains: opts.q, mode: "insensitive" } },
      ],
    });
  }
  const where: Prisma.ClientWhereInput = { AND: filters };

  const [total, rows] = await Promise.all([
    prisma.client.count({ where }),
    prisma.client.findMany({
      where,
      select: listSelect,
      orderBy: { name: "asc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return {
    items: rows.map(toListItem),
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function getClientById(id: string): Promise<ClientDetail | null> {
  const c = await prisma.client.findUnique({
    where: { id },
    select: {
      ...listSelect,
      billingAddress: true,
      notes: true,
      createdAt: true,
      updatedAt: true,
      projects: {
        where: { deletedAt: null },
        select: { id: true, code: true, name: true, status: true },
        orderBy: { createdAt: "desc" },
        take: 50,
      },
    },
  });
  if (!c) return null;

  return {
    ...toListItem(c),
    address: c.billingAddress,
    notes: c.notes,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
    projects: c.projects.map((p) => ({
      id: p.id,
      code: p.code,
      name: p.name,
      status: p.status,
    })),
  };
}

// ---- Writes -----------------------------------------------------------------

function editableData(input: ClientWriteInput, actorId: string) {
  return {
    name: input.name,
    type: input.type,
    contactPerson: input.contactPerson ?? null,
    primaryEmail: input.email ?? null,
    primaryPhone: input.phone ?? null,
    taxId: input.taxId ?? null,
    billingAddress: input.address ?? null,
    notes: input.notes ?? null,
    updatedById: actorId,
  };
}

export async function createClient(
  input: ClientWriteInput,
  actorId: string
): Promise<string> {
  const client = await prisma.client.create({
    data: { createdById: actorId, ...editableData(input, actorId) },
    select: { id: true },
  });
  return client.id;
}

export async function updateClient(
  id: string,
  input: ClientWriteInput,
  actorId: string
): Promise<void> {
  await prisma.client.update({
    where: { id },
    data: editableData(input, actorId),
  });
}

export async function archiveClient(
  id: string,
  actorId: string
): Promise<void> {
  await prisma.client.update({
    where: { id },
    data: { deletedAt: new Date(), updatedById: actorId },
  });
}

export async function restoreClient(
  id: string,
  actorId: string
): Promise<void> {
  await prisma.client.update({
    where: { id },
    data: { deletedAt: null, updatedById: actorId },
  });
}

export async function clientExists(id: string): Promise<boolean> {
  const c = await prisma.client.findUnique({
    where: { id },
    select: { id: true },
  });
  return c !== null;
}
