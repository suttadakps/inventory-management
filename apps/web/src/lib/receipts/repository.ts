import crypto from "crypto";

import type { PendingReceipt } from "@artiverges/database";
import { prisma } from "@/lib/db";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/serviceRole";
import { createExpenseFromReceipt } from "@/lib/costs/repository";

const BUCKET = "expense-receipts";

/** Upload a receipt photo's bytes to Storage and return its public URL. */
export async function uploadReceiptImage(
  buffer: Buffer,
  contentType: string
): Promise<{ storagePath: string; publicUrl: string }> {
  const ext = contentType === "image/png" ? "png" : "jpg";
  const storagePath = `${crypto.randomUUID()}.${ext}`;

  const supabase = createSupabaseServiceRoleClient();
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, buffer, { contentType });
  if (error) throw error;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
  return { storagePath, publicUrl: data.publicUrl };
}

export type PendingReceiptStatus = "awaiting_project" | "awaiting_description";

export type PendingReceiptItem = {
  id: string;
  amount: number | null;
  vendor: string | null;
  description: string | null;
  incurredAt: Date | null;
  storagePath: string;
  status: PendingReceiptStatus;
  projectId: string | null;
  projectName: string | null;
};

function toItem(row: PendingReceipt): PendingReceiptItem {
  return {
    id: row.id,
    amount: row.amount?.toNumber() ?? null,
    vendor: row.vendor,
    description: row.description,
    incurredAt: row.incurredAt,
    storagePath: row.storagePath,
    status: row.status as PendingReceiptStatus,
    projectId: row.projectId,
    projectName: row.projectName,
  };
}

export async function createPendingReceipt(input: {
  storagePath: string;
  amount: number | null;
  vendor: string | null;
  description: string | null;
  incurredAt: Date | null;
}): Promise<PendingReceiptItem> {
  const row = await prisma.pendingReceipt.create({
    data: {
      storagePath: input.storagePath,
      amount: input.amount,
      vendor: input.vendor,
      description: input.description,
      incurredAt: input.incurredAt,
    },
  });
  return toItem(row);
}

/** The oldest receipt still waiting on a reply (project name, then
 * description) — FIFO, in case several photos arrive before any get labelled. */
export async function getOldestPendingReceipt(): Promise<PendingReceiptItem | null> {
  const row = await prisma.pendingReceipt.findFirst({
    where: { status: { in: ["awaiting_project", "awaiting_description"] } },
    orderBy: { createdAt: "asc" },
  });
  return row ? toItem(row) : null;
}

export type ProjectMatch = { id: string; name: string };

/** Non-deleted projects whose name contains the given text (case-insensitive). */
export async function matchProjectsByName(text: string): Promise<ProjectMatch[]> {
  const trimmed = text.trim();
  if (trimmed.length < 2) return [];
  return prisma.project.findMany({
    where: { deletedAt: null, name: { contains: trimmed, mode: "insensitive" } },
    select: { id: true, name: true },
    take: 5,
  });
}

/** Step 1 -> 2: attach the project, then ask for the paid-for description. */
export async function setPendingReceiptProject(
  pendingId: string,
  project: ProjectMatch
): Promise<void> {
  await prisma.pendingReceipt.update({
    where: { id: pendingId },
    data: {
      projectId: project.id,
      projectName: project.name,
      status: "awaiting_description",
    },
  });
}

export type ResolvedReceipt = { expenseId: string; projectName: string; amount: number };

/** Step 2 -> done: the typed description finalizes the pending receipt into
 * a real Expense (the AI-guessed description is only ever a fallback). */
export async function finalizePendingReceipt(
  pendingId: string,
  typedDescription: string
): Promise<ResolvedReceipt> {
  const pending = await prisma.pendingReceipt.findUnique({
    where: { id: pendingId },
  });
  if (!pending) throw new Error("Pending receipt not found");
  if (!pending.projectId || !pending.projectName)
    throw new Error("Pending receipt has no project yet");

  const supabase = createSupabaseServiceRoleClient();
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(pending.storagePath);

  const description =
    typedDescription.trim() ||
    pending.description ||
    pending.vendor ||
    "สลิปจากไลน์";

  const expenseId = await createExpenseFromReceipt(
    {
      projectId: pending.projectId,
      category: "อื่นๆ",
      description,
      amount: pending.amount?.toNumber() ?? 0,
      incurredAt: pending.incurredAt ?? new Date(),
      receiptUrl: data.publicUrl,
    },
    null
  );

  await prisma.pendingReceipt.update({
    where: { id: pendingId },
    data: { status: "done", expenseId },
  });

  return {
    expenseId,
    projectName: pending.projectName,
    amount: pending.amount?.toNumber() ?? 0,
  };
}
