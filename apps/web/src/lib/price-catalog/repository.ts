import { prisma } from "@/lib/db";

export type PriceCatalogItem = {
  id: string;
  name: string;
  unit: string | null;
  materialCost: number;
  laborCost: number;
  category: string | null;
  note: string | null;
  createdAt: string;
};

function toItem(row: {
  id: string;
  name: string;
  unit: string | null;
  materialCost: { toNumber(): number };
  laborCost: { toNumber(): number };
  category: string | null;
  note: string | null;
  createdAt: Date;
}): PriceCatalogItem {
  return {
    id: row.id,
    name: row.name,
    unit: row.unit,
    materialCost: row.materialCost.toNumber(),
    laborCost: row.laborCost.toNumber(),
    category: row.category,
    note: row.note,
    createdAt: row.createdAt.toISOString(),
  };
}

export type PriceCatalogInput = {
  name: string;
  unit: string | null;
  materialCost: number;
  laborCost: number;
  category: string | null;
  note: string | null;
};

export async function listPriceCatalogItems(): Promise<PriceCatalogItem[]> {
  const rows = await prisma.priceCatalogItem.findMany({
    orderBy: { name: "asc" },
  });
  return rows.map(toItem);
}

export async function getPriceCatalogItem(
  id: string
): Promise<PriceCatalogItem | null> {
  const row = await prisma.priceCatalogItem.findUnique({ where: { id } });
  return row ? toItem(row) : null;
}

export async function createPriceCatalogItem(
  input: PriceCatalogInput,
  actorId: string
): Promise<string> {
  const created = await prisma.priceCatalogItem.create({
    data: {
      name: input.name,
      unit: input.unit,
      materialCost: input.materialCost,
      laborCost: input.laborCost,
      category: input.category,
      note: input.note,
      createdById: actorId,
    },
    select: { id: true },
  });
  return created.id;
}

export async function updatePriceCatalogItem(
  id: string,
  input: PriceCatalogInput
): Promise<void> {
  await prisma.priceCatalogItem.update({
    where: { id },
    data: {
      name: input.name,
      unit: input.unit,
      materialCost: input.materialCost,
      laborCost: input.laborCost,
      category: input.category,
      note: input.note,
    },
  });
}

export async function deletePriceCatalogItem(id: string): Promise<void> {
  await prisma.priceCatalogItem.delete({ where: { id } });
}
