"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { QuotationStatus } from "@artiverges/database";

import { requireUser, type CurrentUser } from "@/lib/auth/session";
import { quotationSchema } from "@/lib/validation/quotation";
import { canManageQuotation, isQuotationEditable } from "./permissions";
import * as repo from "./repository";

export type QuotationActionState = {
  error?: string;
  fieldErrors?: Record<string, string>;
};

function collectFieldErrors(
  error: import("zod").ZodError
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !out[key]) out[key] = issue.message;
  }
  return out;
}

function requireManager(user: CurrentUser) {
  if (!canManageQuotation(user.role)) {
    throw new Error("You do not have permission to manage quotations.");
  }
}

// ---- Generate from an approved BOQ ------------------------------------------

export async function generateQuotationAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  requireManager(user);

  const projectId = String(formData.get("projectId") ?? "");
  const boqId = String(formData.get("boqId") ?? "");
  if (!projectId || !boqId) throw new Error("Select an approved BOQ.");

  const id = await repo.generateFromBoq(projectId, boqId, user.id);
  revalidatePath(`/projects/${projectId}/quotations`);
  redirect(`/projects/${projectId}/quotations/${id}`);
}

// ---- Update (draft only) ----------------------------------------------------

export async function updateQuotationAction(
  _prev: QuotationActionState,
  formData: FormData
): Promise<QuotationActionState> {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing quotation reference." };

  const ctx = await repo.getQuotationContext(id);
  if (!ctx) return { error: "Quotation not found." };
  if (!isQuotationEditable(user.role, ctx.status)) {
    return { error: "This quotation cannot be edited in its current state." };
  }

  const parsed = quotationSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      error: "Please correct the errors below.",
      fieldErrors: collectFieldErrors(parsed.error),
    };
  }

  await repo.updateQuotation(id, parsed.data, user.id);
  revalidatePath(`/projects/${ctx.projectId}/quotations/${id}`);
  redirect(`/projects/${ctx.projectId}/quotations/${id}`);
}

// ---- Duplicate / revise -----------------------------------------------------

export async function duplicateQuotationAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  requireManager(user);
  const id = String(formData.get("id") ?? "");
  const ctx = await repo.getQuotationContext(id);
  if (!ctx) throw new Error("Quotation not found.");

  const newId = await repo.duplicateQuotation(id, user.id);
  revalidatePath(`/projects/${ctx.projectId}/quotations`);
  redirect(`/projects/${ctx.projectId}/quotations/${newId}`);
}

// ---- Workflow transitions ---------------------------------------------------

async function transition(
  formData: FormData,
  to: QuotationStatus,
  allowedFrom: readonly QuotationStatus[]
): Promise<void> {
  const user = await requireUser();
  requireManager(user);
  const id = String(formData.get("id") ?? "");
  const ctx = await repo.getQuotationContext(id);
  if (!ctx) throw new Error("Quotation not found.");
  if (!allowedFrom.includes(ctx.status)) {
    throw new Error(`A ${ctx.status} quotation cannot move to ${to}.`);
  }
  await repo.setQuotationStatus(id, to, user.id);
  revalidatePath(`/projects/${ctx.projectId}/quotations/${id}`);
  redirect(`/projects/${ctx.projectId}/quotations/${id}`);
}

export async function sendQuotationAction(fd: FormData): Promise<void> {
  await transition(fd, "sent", ["draft"]);
}
export async function markViewedAction(fd: FormData): Promise<void> {
  await transition(fd, "viewed", ["sent"]);
}
export async function approveQuotationAction(fd: FormData): Promise<void> {
  await transition(fd, "approved", ["sent", "viewed"]);
}
export async function rejectQuotationAction(fd: FormData): Promise<void> {
  await transition(fd, "rejected", ["sent", "viewed"]);
}
export async function expireQuotationAction(fd: FormData): Promise<void> {
  await transition(fd, "expired", ["sent", "viewed"]);
}
export async function reopenQuotationAction(fd: FormData): Promise<void> {
  await transition(fd, "draft", ["sent", "viewed", "rejected", "expired"]);
}

// ---- Archive ----------------------------------------------------------------

export async function archiveQuotationAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  requireManager(user);
  const id = String(formData.get("id") ?? "");
  const ctx = await repo.getQuotationContext(id);
  if (!ctx) throw new Error("Quotation not found.");

  await repo.archiveQuotation(id, user.id);
  revalidatePath(`/projects/${ctx.projectId}/quotations`);
  redirect(`/projects/${ctx.projectId}/quotations`);
}
