"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { requireUser, type CurrentUser } from "@/lib/auth/session";
import {
  canManageBoq,
  canApproveBoq,
  isBoqEditable,
} from "./permissions";
import * as repo from "./repository";
import type { BoqContext } from "./repository";

export type BoqActionResult = { ok: true } | { ok: false; error: string };

const ok: BoqActionResult = { ok: true };
const fail = (error: string): BoqActionResult => ({ ok: false, error });

// ---- Authorization helpers --------------------------------------------------

async function ensureProjectScope(
  user: CurrentUser,
  projectId: string | null
): Promise<boolean> {
  if (["owner", "admin", "ae"].includes(user.role)) return true;
  // Standalone BOQ (no project): only internal staff (handled above) may edit.
  if (!projectId) return false;
  const scope = await repo.loadProjectScope(projectId);
  return !!scope && repo.canViewProject(user, scope);
}

async function authorizeEdit(
  user: CurrentUser,
  ctx: BoqContext | null
): Promise<BoqContext> {
  if (!ctx) throw new Error("BOQ not found.");
  if (!isBoqEditable(user.role, ctx.status)) {
    throw new Error("This BOQ is not editable in its current state.");
  }
  if (!(await ensureProjectScope(user, ctx.projectId))) {
    throw new Error("You do not have access to this project.");
  }
  return ctx;
}

function revalidateBoq(ctx: { projectId: string | null; boqId: string }) {
  if (ctx.projectId) {
    revalidatePath(`/projects/${ctx.projectId}/boq/${ctx.boqId}`);
  } else {
    revalidatePath(`/boq/${ctx.boqId}`);
  }
}

// ---- Lifecycle (managers) ---------------------------------------------------

export async function createBoqAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  if (!canManageBoq(user.role)) throw new Error("Not authorized.");

  const projectId = String(formData.get("projectId") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim() || undefined;

  // No project chosen → create a standalone (project-less) BOQ document.
  if (!projectId) {
    const standaloneId = await repo.createStandaloneBoq(title, user.id);
    revalidatePath("/boq");
    redirect(`/boq/${standaloneId}`);
  }

  if (!(await ensureProjectScope(user, projectId)))
    throw new Error("Not authorized for this project.");

  const id = await repo.createBoq(projectId, title, user.id);
  revalidatePath(`/projects/${projectId}/boq`);
  redirect(`/projects/${projectId}/boq/${id}`);
}

async function copyAndRedirect(
  formData: FormData,
  suffix: string
): Promise<void> {
  const user = await requireUser();
  const boqId = String(formData.get("boqId") ?? "");
  const ctx = await repo.getBoqContext(boqId);
  if (!ctx) throw new Error("BOQ not found.");
  if (!canManageBoq(user.role)) throw new Error("Not authorized.");
  if (!(await ensureProjectScope(user, ctx.projectId)))
    throw new Error("Not authorized for this project.");

  const id = await repo.copyBoq(boqId, user.id, suffix);
  revalidatePath(`/projects/${ctx.projectId}/boq`);
  redirect(`/projects/${ctx.projectId}/boq/${id}`);
}

export async function duplicateBoqAction(formData: FormData): Promise<void> {
  await copyAndRedirect(formData, " (copy)");
}

export async function newVersionBoqAction(formData: FormData): Promise<void> {
  await copyAndRedirect(formData, "");
}

async function transition(
  formData: FormData,
  to: "submitted" | "approved" | "draft" | "archived",
  allowedFrom: readonly string[],
  guard: (user: CurrentUser) => boolean
): Promise<void> {
  const user = await requireUser();
  const boqId = String(formData.get("boqId") ?? "");
  const ctx = await repo.getBoqContext(boqId);
  if (!ctx) throw new Error("BOQ not found.");
  if (!guard(user)) throw new Error("Not authorized.");
  if (!allowedFrom.includes(ctx.status)) {
    throw new Error(`A ${ctx.status} BOQ cannot move to ${to}.`);
  }
  if (!(await ensureProjectScope(user, ctx.projectId)))
    throw new Error("Not authorized for this project.");

  if (to === "archived") {
    await repo.softDeleteBoq(boqId, user.id);
    revalidatePath(`/projects/${ctx.projectId}/boq`);
    redirect(`/projects/${ctx.projectId}/boq`);
  }
  await repo.setBoqStatus(boqId, to, user.id);
  revalidateBoq({ projectId: ctx.projectId, boqId });
  redirect(`/projects/${ctx.projectId}/boq/${boqId}`);
}

export async function submitBoqAction(formData: FormData): Promise<void> {
  await transition(formData, "submitted", ["draft"], (u) => isBoqEditableRole(u));
}

export async function approveBoqAction(formData: FormData): Promise<void> {
  await transition(formData, "approved", ["submitted"], (u) =>
    canApproveBoq(u.role)
  );
}

export async function reopenBoqAction(formData: FormData): Promise<void> {
  await transition(formData, "draft", ["submitted", "approved"], (u) =>
    canApproveBoq(u.role)
  );
}

export async function archiveBoqAction(formData: FormData): Promise<void> {
  await transition(formData, "archived", ["draft", "submitted", "approved"], (u) =>
    canManageBoq(u.role)
  );
}

function isBoqEditableRole(user: CurrentUser): boolean {
  return ["owner", "admin", "ae", "site_engineer"].includes(user.role);
}

// ---- Content edits (typed args, called from the client editor) --------------

export async function updateBoqMetaAction(
  boqId: string,
  data: { title?: string; notes?: string }
): Promise<BoqActionResult> {
  try {
    const user = await requireUser();
    const ctx = await authorizeEdit(user, await repo.getBoqContext(boqId));
    await repo.updateBoqMeta(boqId, data, user.id);
    revalidateBoq(ctx);
    return ok;
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Failed to save.");
  }
}

export async function addSectionAction(
  boqId: string,
  name: string
): Promise<BoqActionResult> {
  try {
    const user = await requireUser();
    const ctx = await authorizeEdit(user, await repo.getBoqContext(boqId));
    await repo.addSection(boqId, name.trim() || "New section");
    revalidateBoq(ctx);
    return ok;
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Failed.");
  }
}

export async function renameSectionAction(
  sectionId: string,
  name: string
): Promise<BoqActionResult> {
  try {
    const user = await requireUser();
    const ctx = await authorizeEdit(user, await repo.contextFromSection(sectionId));
    await repo.renameSection(sectionId, name.trim() || "Untitled section");
    revalidateBoq(ctx);
    return ok;
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Failed.");
  }
}

export async function deleteSectionAction(
  sectionId: string
): Promise<BoqActionResult> {
  try {
    const user = await requireUser();
    const ctx = await authorizeEdit(user, await repo.contextFromSection(sectionId));
    await repo.deleteSection(sectionId);
    revalidateBoq(ctx);
    return ok;
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Failed.");
  }
}

export async function moveSectionAction(
  sectionId: string,
  dir: "up" | "down"
): Promise<BoqActionResult> {
  try {
    const user = await requireUser();
    const ctx = await authorizeEdit(user, await repo.contextFromSection(sectionId));
    await repo.moveSection(sectionId, dir);
    revalidateBoq(ctx);
    return ok;
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Failed.");
  }
}

export async function addCategoryAction(
  sectionId: string,
  name: string
): Promise<BoqActionResult> {
  try {
    const user = await requireUser();
    const ctx = await authorizeEdit(user, await repo.contextFromSection(sectionId));
    await repo.addCategory(sectionId, name.trim() || "New category");
    revalidateBoq(ctx);
    return ok;
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Failed.");
  }
}

export async function renameCategoryAction(
  categoryId: string,
  name: string
): Promise<BoqActionResult> {
  try {
    const user = await requireUser();
    const ctx = await authorizeEdit(user, await repo.contextFromCategory(categoryId));
    await repo.renameCategory(categoryId, name.trim() || "Untitled category");
    revalidateBoq(ctx);
    return ok;
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Failed.");
  }
}

export async function deleteCategoryAction(
  categoryId: string
): Promise<BoqActionResult> {
  try {
    const user = await requireUser();
    const ctx = await authorizeEdit(user, await repo.contextFromCategory(categoryId));
    await repo.deleteCategory(categoryId);
    revalidateBoq(ctx);
    return ok;
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Failed.");
  }
}

export async function moveCategoryAction(
  categoryId: string,
  dir: "up" | "down"
): Promise<BoqActionResult> {
  try {
    const user = await requireUser();
    const ctx = await authorizeEdit(user, await repo.contextFromCategory(categoryId));
    await repo.moveCategory(categoryId, dir);
    revalidateBoq(ctx);
    return ok;
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Failed.");
  }
}

export async function addItemAction(
  categoryId: string
): Promise<BoqActionResult> {
  try {
    const user = await requireUser();
    const ctx = await authorizeEdit(user, await repo.contextFromCategory(categoryId));
    await repo.addItem(categoryId);
    revalidateBoq(ctx);
    return ok;
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Failed.");
  }
}

export async function updateItemAction(
  itemId: string,
  patch: repo.ItemPatch
): Promise<BoqActionResult> {
  try {
    const user = await requireUser();
    const ctx = await authorizeEdit(user, await repo.contextFromItem(itemId));
    await repo.updateItem(itemId, patch);
    revalidateBoq(ctx);
    return ok;
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Failed.");
  }
}

export async function deleteItemAction(itemId: string): Promise<BoqActionResult> {
  try {
    const user = await requireUser();
    const ctx = await authorizeEdit(user, await repo.contextFromItem(itemId));
    await repo.deleteItem(itemId);
    revalidateBoq(ctx);
    return ok;
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Failed.");
  }
}

export async function duplicateItemAction(
  itemId: string
): Promise<BoqActionResult> {
  try {
    const user = await requireUser();
    const ctx = await authorizeEdit(user, await repo.contextFromItem(itemId));
    await repo.duplicateItem(itemId);
    revalidateBoq(ctx);
    return ok;
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Failed.");
  }
}

export async function moveItemAction(
  itemId: string,
  dir: "up" | "down"
): Promise<BoqActionResult> {
  try {
    const user = await requireUser();
    const ctx = await authorizeEdit(user, await repo.contextFromItem(itemId));
    await repo.moveItem(itemId, dir);
    revalidateBoq(ctx);
    return ok;
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Failed.");
  }
}

// ---- Flat single-price BOQ (document editor) --------------------------------

export async function addBoqLineAction(boqId: string): Promise<BoqActionResult> {
  try {
    const user = await requireUser();
    const ctx = await authorizeEdit(user, await repo.getBoqContext(boqId));
    await repo.addFlatLine(boqId);
    revalidateBoq(ctx);
    return ok;
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Failed.");
  }
}

export async function updateBoqLineAction(
  lineId: string,
  patch: repo.FlatLinePatch
): Promise<BoqActionResult> {
  try {
    const user = await requireUser();
    const ctx = await authorizeEdit(user, await repo.flatLineContext(lineId));
    await repo.updateFlatLine(lineId, patch);
    revalidateBoq(ctx);
    return ok;
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Failed.");
  }
}

export async function deleteBoqLineAction(
  lineId: string
): Promise<BoqActionResult> {
  try {
    const user = await requireUser();
    const ctx = await authorizeEdit(user, await repo.flatLineContext(lineId));
    await repo.deleteFlatLine(lineId);
    revalidateBoq(ctx);
    return ok;
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Failed.");
  }
}

export async function updateBoqHeaderAction(
  boqId: string,
  patch: repo.BoqHeaderPatch
): Promise<BoqActionResult> {
  try {
    const user = await requireUser();
    const ctx = await authorizeEdit(user, await repo.getBoqContext(boqId));
    await repo.updateBoqHeader(boqId, patch);
    revalidateBoq(ctx);
    return ok;
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Failed.");
  }
}
