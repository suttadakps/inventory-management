import { prisma } from "@/lib/db";

export type WorkerItem = {
  id: string;
  name: string;
  taxId: string | null;
  position: string | null;
  phone: string | null;
  address: string | null;
  createdAt: string;
};

function toItem(row: {
  id: string;
  name: string;
  taxId: string | null;
  position: string | null;
  phone: string | null;
  address: string | null;
  createdAt: Date;
}): WorkerItem {
  return {
    id: row.id,
    name: row.name,
    taxId: row.taxId,
    position: row.position,
    phone: row.phone,
    address: row.address,
    createdAt: row.createdAt.toISOString(),
  };
}

export type WorkerInput = {
  name: string;
  taxId: string | null;
  position: string | null;
  phone: string | null;
  address: string | null;
};

export async function listWorkers(): Promise<WorkerItem[]> {
  const rows = await prisma.worker.findMany({ orderBy: { name: "asc" } });
  return rows.map(toItem);
}

export async function getWorker(id: string): Promise<WorkerItem | null> {
  const row = await prisma.worker.findUnique({ where: { id } });
  return row ? toItem(row) : null;
}

export async function createWorker(
  input: WorkerInput,
  actorId: string
): Promise<string> {
  const created = await prisma.worker.create({
    data: {
      name: input.name,
      taxId: input.taxId,
      position: input.position,
      phone: input.phone,
      address: input.address,
      createdById: actorId,
    },
    select: { id: true },
  });
  return created.id;
}

export async function updateWorker(
  id: string,
  input: WorkerInput
): Promise<void> {
  await prisma.worker.update({
    where: { id },
    data: {
      name: input.name,
      taxId: input.taxId,
      position: input.position,
      phone: input.phone,
      address: input.address,
    },
  });
}

export async function deleteWorker(id: string): Promise<void> {
  await prisma.worker.delete({ where: { id } });
}
