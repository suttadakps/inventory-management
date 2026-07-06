"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Prisma, type ContractStatus } from "@artiverges/database";

import { requireUser, type CurrentUser } from "@/lib/auth/session";
import {
  contractHeaderSchema,
  milestoneSchema,
  commentSchema,
  fileSchema,
} from "@/lib/validation/contract";
import { canManageContracts, isContractEditable } from "./permissions";
import { milestonesBalance } from "./calc";
import * as repo from "./repository";

export type ContractActionState = {
  error?: string;
  fieldErrors?: Record<string, string>;
};
export type ContractResult = { ok: true } | { ok: false; error: string };

const okResult: ContractResult = { ok: true };
const failResult = (error: string): ContractResult => ({ ok: false, error });

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
  if (!canManageContracts(user.role)) {
    throw new Error("You do not have permission to manage contracts.");
  }
}

function revalidateContract(id: string) {
  revalidatePath("/contracts");
  revalidatePath(`/contracts/${id}`);
}

// ---- Create from an approved quotation --------------------------------------

export async function generateContractAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  requireManager(user);
  const quotationId = String(formData.get("quotationId") ?? "");
  if (!quotationId) throw new Error("Select an approved quotation.");

  let id: string;
  try {
    id = await repo.generateContract(quotationId, user.id);
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      throw new Error("An active contract already exists for this quotation.");
    }
    throw e;
  }
  revalidatePath("/contracts");
  redirect(`/contracts/${id}`);
}

// ---- Header edit (draft only) ----------------------------------------------

export async function updateContractAction(
  _prev: ContractActionState,
  formData: FormData
): Promise<ContractActionState> {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing contract reference." };

  const ctx = await repo.getContractContext(id);
  if (!ctx) return { error: "Contract not found." };
  if (!isContractEditable(user.role, ctx.status)) {
    return { error: "This contract cannot be edited in its current state." };
  }

  const parsed = contractHeaderSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      error: "Please correct the errors below.",
      fieldErrors: collectFieldErrors(parsed.error),
    };
  }

  await repo.updateContractHeader(id, parsed.data, user.id);
  revalidateContract(id);
  redirect(`/contracts/${id}`);
}

// ---- Workflow transitions ---------------------------------------------------

async function transition(
  formData: FormData,
  to: ContractStatus,
  allowedFrom: readonly ContractStatus[]
): Promise<void> {
  const user = await requireUser();
  requireManager(user);
  const id = String(formData.get("id") ?? "");
  const ctx = await repo.getContractContext(id);
  if (!ctx) throw new Error("Contract not found.");
  if (!allowedFrom.includes(ctx.status)) {
    throw new Error(`A ${ctx.status} contract cannot move to ${to}.`);
  }

  // Business rule: milestone amounts must equal the contract value before it
  // leaves draft for approval.
  if (to === "pending_approval") {
    const detail = await repo.getContract(user, id);
    const balance = milestonesBalance(detail?.milestones ?? [], ctx.value);
    if (!balance.balanced) {
      throw new Error(
        "Milestone amounts must equal the contract total before submitting."
      );
    }
  }

  await repo.setContractStatus(id, to, user.id);
  revalidateContract(id);
  redirect(`/contracts/${id}`);
}

export async function submitContractAction(fd: FormData): Promise<void> {
  await transition(fd, "pending_approval", ["draft"]);
}
export async function approveContractAction(fd: FormData): Promise<void> {
  await transition(fd, "approved", ["pending_approval"]);
}
export async function signContractAction(fd: FormData): Promise<void> {
  await transition(fd, "signed", ["approved"]);
}
export async function completeContractAction(fd: FormData): Promise<void> {
  await transition(fd, "completed", ["signed"]);
}
export async function cancelContractAction(fd: FormData): Promise<void> {
  await transition(fd, "cancelled", [
    "draft",
    "pending_approval",
    "approved",
    "signed",
  ]);
}
export async function reopenContractAction(fd: FormData): Promise<void> {
  await transition(fd, "draft", ["pending_approval", "approved"]);
}

// ---- Version / archive ------------------------------------------------------

export async function createVersionAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  requireManager(user);
  const id = String(formData.get("id") ?? "");
  const ctx = await repo.getContractContext(id);
  if (!ctx) throw new Error("Contract not found.");
  const note = String(formData.get("note") ?? "").trim() || undefined;
  await repo.createContractVersion(id, note, user.id);
  revalidateContract(id);
  redirect(`/contracts/${id}`);
}

export async function archiveContractAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  requireManager(user);
  const id = String(formData.get("id") ?? "");
  const ctx = await repo.getContractContext(id);
  if (!ctx) throw new Error("Contract not found.");
  await repo.archiveContract(id, user.id);
  revalidatePath("/contracts");
  redirect(`/contracts/${id}`);
}

export async function restoreContractAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  requireManager(user);
  const id = String(formData.get("id") ?? "");
  const ctx = await repo.getContractContext(id);
  if (!ctx) throw new Error("Contract not found.");
  await repo.restoreContract(id, user.id);
  revalidateContract(id);
  redirect(`/contracts/${id}`);
}

// ---- Milestones (typed, called from the client editor) ----------------------

async function managerContext(itemContractId: string | null) {
  const user = await requireUser();
  if (!canManageContracts(user.role)) throw new Error("Not authorized.");
  if (!itemContractId) throw new Error("Contract not found.");
  const ctx = await repo.getContractContext(itemContractId);
  if (!ctx) throw new Error("Contract not found.");
  return { user, ctx };
}

export async function addMilestoneAction(
  contractId: string
): Promise<ContractResult> {
  try {
    const { user, ctx } = await managerContext(contractId);
    if (ctx.status !== "draft") return failResult("Contract is not editable.");
    await repo.addMilestone(contractId, user.id);
    revalidateContract(contractId);
    return okResult;
  } catch (e) {
    return failResult(e instanceof Error ? e.message : "Failed.");
  }
}

export async function updateMilestoneAction(
  milestoneId: string,
  input: { title: string; percentage: number; amount: number; dueDate: string | null }
): Promise<ContractResult> {
  try {
    const contractId = await repo.getMilestoneContractId(milestoneId);
    const { user, ctx } = await managerContext(contractId);
    if (ctx.status !== "draft") return failResult("Contract is not editable.");

    const parsed = milestoneSchema.safeParse(input);
    if (!parsed.success) {
      return failResult(parsed.error.issues[0]?.message ?? "Invalid milestone.");
    }
    await repo.updateMilestone(milestoneId, ctx.id, parsed.data, user.id);
    revalidateContract(ctx.id);
    return okResult;
  } catch (e) {
    return failResult(e instanceof Error ? e.message : "Failed.");
  }
}

export async function updateMilestoneStatusAction(
  milestoneId: string,
  data: { paymentStatus?: string; invoiceStatus?: string }
): Promise<ContractResult> {
  try {
    const contractId = await repo.getMilestoneContractId(milestoneId);
    const { user, ctx } = await managerContext(contractId);
    if (!["approved", "signed", "completed"].includes(ctx.status)) {
      return failResult(
        "Payment status can only change once the contract is approved."
      );
    }
    await repo.updateMilestoneStatus(milestoneId, ctx.id, data, user.id);
    revalidateContract(ctx.id);
    return okResult;
  } catch (e) {
    return failResult(e instanceof Error ? e.message : "Failed.");
  }
}

export async function deleteMilestoneAction(
  milestoneId: string
): Promise<ContractResult> {
  try {
    const contractId = await repo.getMilestoneContractId(milestoneId);
    const { user, ctx } = await managerContext(contractId);
    if (ctx.status !== "draft") return failResult("Contract is not editable.");
    await repo.deleteMilestone(milestoneId, ctx.id, user.id);
    revalidateContract(ctx.id);
    return okResult;
  } catch (e) {
    return failResult(e instanceof Error ? e.message : "Failed.");
  }
}

// ---- Comments ---------------------------------------------------------------

export async function addCommentAction(
  contractId: string,
  body: string
): Promise<ContractResult> {
  try {
    const { user } = await managerContext(contractId);
    const parsed = commentSchema.safeParse({ body });
    if (!parsed.success) {
      return failResult(parsed.error.issues[0]?.message ?? "Invalid comment.");
    }
    await repo.addComment(contractId, user.id, parsed.data.body);
    revalidateContract(contractId);
    return okResult;
  } catch (e) {
    return failResult(e instanceof Error ? e.message : "Failed.");
  }
}

export async function deleteCommentAction(
  commentId: string,
  contractId: string
): Promise<ContractResult> {
  try {
    const { user } = await managerContext(contractId);
    await repo.deleteComment(commentId, contractId, user.id);
    revalidateContract(contractId);
    return okResult;
  } catch (e) {
    return failResult(e instanceof Error ? e.message : "Failed.");
  }
}

// ---- Files (attachment links) -----------------------------------------------

export async function addFileAction(
  contractId: string,
  data: { fileName: string; fileUrl: string }
): Promise<ContractResult> {
  try {
    const { user } = await managerContext(contractId);
    const parsed = fileSchema.safeParse(data);
    if (!parsed.success) {
      return failResult(parsed.error.issues[0]?.message ?? "Invalid file.");
    }
    await repo.addFile(contractId, parsed.data, user.id);
    revalidateContract(contractId);
    return okResult;
  } catch (e) {
    return failResult(e instanceof Error ? e.message : "Failed.");
  }
}

export async function deleteFileAction(
  fileId: string,
  contractId: string
): Promise<ContractResult> {
  try {
    const { user } = await managerContext(contractId);
    await repo.deleteFile(fileId, contractId, user.id);
    revalidateContract(contractId);
    return okResult;
  } catch (e) {
    return failResult(e instanceof Error ? e.message : "Failed.");
  }
}
