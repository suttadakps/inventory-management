import crypto from "crypto";

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

export type PendingReceiptItem = {
  id: string;
  amount: number | null;
  vendor: string | null;
  description: string | null;
  incurredAt: Date | null;
  storagePath: string;
};

export async function createPendingReceipt(input: {
  storagePath: string;
  amount: number | null;
  vendor: string | null;
  description: string | null;
  incurredAt: Date | null;
}): Promise<PendingReceiptItem> {
  return prisma.pendingReceipt.create({
    data: {
      storagePath: input.storagePath,
      amount: input.amount,
      vendor: input.vendor,
      description: input.description,
      incurredAt: input.incurredAt,
    },
    select: {
      id: true,
      amount: true,
      vendor: true,
      description: true,
      incurredAt: true,
      storagePath: true,
    },
  }).then((r) => ({ ...r, amount: r.amount?.toNumber() ?? null }));
}

/** The oldest receipt still waiting for a project name (FIFO, in case
 * several photos arrive before any get labelled). */
export async function getOldestPendingReceipt(): Promise<PendingReceiptItem | null> {
  const row = await prisma.pendingReceipt.findFirst({
    where: { status: "awaiting_project" },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      amount: true,
      vendor: true,
      description: true,
      incurredAt: true,
      storagePath: true,
    },
  });
  if (!row) return null;
  return { ...row, amount: row.amount?.toNumber() ?? null };
}

export type ProjectMatch = { id: string; name: string };

/** Active, non-deleted projects whose name contains the given text (case-insensitive). */
export async function matchProjectsByName(text: string): Promise<ProjectMatch[]> {
  const trimmed = text.trim();
  if (trimmed.length < 2) return [];
  return prisma.project.findMany({
    where: { deletedAt: null, name: { contains: trimmed, mode: "insensitive" } },
    select: { id: true, name: true },
    take: 5,
  });
}

export type ResolvedReceipt = { expenseId: string; projectName: string; amount: number };

/** Attach a project to a pending receipt, creating the real Expense entry. */
export async function resolvePendingReceipt(
  pendingId: string,
  project: ProjectMatch
): Promise<ResolvedReceipt> {
  const pending = await prisma.pendingReceipt.findUnique({
    where: { id: pendingId },
  });
  if (!pending) throw new Error("Pending receipt not found");

  const supabase = createSupabaseServiceRoleClient();
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(pending.storagePath);

  const expenseId = await createExpenseFromReceipt(
    {
      projectId: project.id,
      category: "อื่นๆ",
      description: pending.description ?? pending.vendor ?? "สลิปจากไลน์",
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
    projectName: project.name,
    amount: pending.amount?.toNumber() ?? 0,
  };
}
