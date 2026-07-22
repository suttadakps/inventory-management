"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Prisma, type ProjectStatus } from "@artiverges/database";

import { PROJECT_STATUSES } from "@/lib/validation/project";
import { sendLineMessage } from "@/lib/line/client";
import { formatDateBkk } from "@/lib/format";

import { requireUser } from "@/lib/auth/session";
import { projectBaseSchema, projectUpdateSchema } from "@/lib/validation/project";
import {
  canCreateProject,
  canArchiveProject,
  canEditProject,
} from "./permissions";
import * as repo from "./repository";

export type ProjectActionState = {
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

function isUniqueCodeViolation(e: unknown): boolean {
  return (
    e instanceof Prisma.PrismaClientKnownRequestError &&
    e.code === "P2002" &&
    (e.meta?.target as string[] | undefined)?.includes("code") === true
  );
}

export type InlineResult = { ok: true } | { ok: false; error: string };

async function ensureCanEditProject(
  user: Awaited<ReturnType<typeof requireUser>>,
  projectId: string
): Promise<boolean> {
  const authz = await repo.getProjectAuthz(user.id, projectId);
  return (
    authz.exists &&
    canEditProject(user.role, {
      isManager: authz.isManager,
      isAssignedEngineer: authz.isAssignedEngineer,
    })
  );
}

/** Inline update of a project's progress (%) from the detail page. */
export async function updateProjectProgressAction(
  projectId: string,
  progress: number
): Promise<InlineResult> {
  const user = await requireUser();
  if (!(await ensureCanEditProject(user, projectId)))
    return { ok: false, error: "ไม่มีสิทธิ์แก้ไขโปรเจคนี้" };
  await repo.setProjectProgress(projectId, progress, user.id);
  revalidatePath(`/projects/${projectId}`);
  return { ok: true };
}

/** Inline update of a project's status from the detail page. */
export async function updateProjectStatusAction(
  projectId: string,
  status: string
): Promise<InlineResult> {
  const user = await requireUser();
  if (!(await ensureCanEditProject(user, projectId)))
    return { ok: false, error: "ไม่มีสิทธิ์แก้ไขโปรเจคนี้" };
  if (!(PROJECT_STATUSES as readonly string[]).includes(status))
    return { ok: false, error: "สถานะไม่ถูกต้อง" };
  await repo.setProjectStatus(projectId, status as ProjectStatus, user.id);
  revalidatePath(`/projects/${projectId}`);
  return { ok: true };
}

/** Log a status/date to the timeline without changing the live status. */
export async function addStatusHistoryAction(
  projectId: string,
  input: { status: string; date: string }
): Promise<InlineResult> {
  const user = await requireUser();
  if (!(await ensureCanEditProject(user, projectId)))
    return { ok: false, error: "ไม่มีสิทธิ์แก้ไขโปรเจคนี้" };
  const status = input.status.trim();
  if (!status) return { ok: false, error: "กรุณากรอกสถานะ" };
  const date = new Date(input.date);
  if (Number.isNaN(date.getTime()))
    return { ok: false, error: "กรุณาเลือกวันที่ให้ถูกต้อง" };
  await repo.addStatusHistoryEntry(projectId, status, date, user.id);
  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/calendar");
  return { ok: true };
}

/** Edit a timeline entry's status/date. */
export async function updateStatusHistoryAction(
  projectId: string,
  entryId: string,
  input: { status: string; date: string }
): Promise<InlineResult> {
  const user = await requireUser();
  if (!(await ensureCanEditProject(user, projectId)))
    return { ok: false, error: "ไม่มีสิทธิ์แก้ไขโปรเจคนี้" };
  const status = input.status.trim();
  if (!status) return { ok: false, error: "กรุณากรอกสถานะ" };
  const date = new Date(input.date);
  if (Number.isNaN(date.getTime()))
    return { ok: false, error: "กรุณาเลือกวันที่ให้ถูกต้อง" };
  await repo.updateStatusHistoryEntry(entryId, projectId, status, date);
  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/calendar");
  return { ok: true };
}

/** Delete a timeline entry. */
export async function deleteStatusHistoryAction(
  projectId: string,
  entryId: string
): Promise<InlineResult> {
  const user = await requireUser();
  if (!(await ensureCanEditProject(user, projectId)))
    return { ok: false, error: "ไม่มีสิทธิ์แก้ไขโปรเจคนี้" };
  await repo.deleteStatusHistoryEntry(entryId, projectId);
  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/calendar");
  return { ok: true };
}

const PAYMENT_METHODS = [
  "cash",
  "bank_transfer",
  "cheque",
  "card",
  "upi",
  "other",
] as const;

/** Record an incoming payment (การรับเงิน) against a project. */
export async function addPaymentAction(
  projectId: string,
  input: { amount: number; method?: string; date?: string; note?: string }
): Promise<InlineResult> {
  const user = await requireUser();
  if (!(await ensureCanEditProject(user, projectId)))
    return { ok: false, error: "ไม่มีสิทธิ์แก้ไขโปรเจคนี้" };
  if (!(input.amount > 0))
    return { ok: false, error: "กรุณากรอกจำนวนเงินที่ถูกต้อง" };

  const project = await repo.getProjectForUser(user, projectId);
  if (!project) return { ok: false, error: "ไม่พบโปรเจค" };

  const method =
    input.method && (PAYMENT_METHODS as readonly string[]).includes(input.method)
      ? (input.method as (typeof PAYMENT_METHODS)[number])
      : undefined;

  await repo.addProjectPayment(
    projectId,
    {
      amount: input.amount,
      method,
      paidAt: input.date ? new Date(input.date) : undefined,
      note: input.note?.trim() || undefined,
      clientId: project.clientId,
    },
    user.id
  );
  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/my-projects");
  revalidatePath("/dashboard");
  return { ok: true };
}

/** Delete an incoming payment from a project. */
export async function deletePaymentAction(
  projectId: string,
  paymentId: string
): Promise<InlineResult> {
  const user = await requireUser();
  if (!(await ensureCanEditProject(user, projectId)))
    return { ok: false, error: "ไม่มีสิทธิ์แก้ไขโปรเจคนี้" };
  await repo.deleteProjectPayment(paymentId, projectId);
  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/my-projects");
  revalidatePath("/dashboard");
  return { ok: true };
}

/** Add a daily-log note to a project (text only). */
export async function addProjectNoteAction(
  projectId: string,
  body: string
): Promise<InlineResult> {
  const user = await requireUser();
  const text = body.trim();
  if (!text) return { ok: false, error: "กรุณากรอกข้อความ" };
  // Anyone who can view the project may add a note.
  const project = await repo.getProjectForUser(user, projectId);
  if (!project) return { ok: false, error: "ไม่พบโปรเจค" };
  await repo.addProjectNote(projectId, text, {
    id: user.id,
    name: user.fullName ?? user.email,
  });
  revalidatePath(`/projects/${projectId}`);
  return { ok: true };
}

/** Edit a daily-log note. */
export async function updateProjectNoteAction(
  projectId: string,
  noteId: string,
  body: string
): Promise<InlineResult> {
  const user = await requireUser();
  if (!(await ensureCanEditProject(user, projectId)))
    return { ok: false, error: "ไม่มีสิทธิ์แก้ไขโปรเจคนี้" };
  const text = body.trim();
  if (!text) return { ok: false, error: "กรุณากรอกข้อความ" };
  await repo.updateProjectNote(noteId, projectId, text);
  revalidatePath(`/projects/${projectId}`);
  return { ok: true };
}

/** Delete a daily-log note. */
export async function deleteProjectNoteAction(
  projectId: string,
  noteId: string
): Promise<InlineResult> {
  const user = await requireUser();
  if (!(await ensureCanEditProject(user, projectId)))
    return { ok: false, error: "ไม่มีสิทธิ์แก้ไขโปรเจคนี้" };
  await repo.deleteProjectNote(noteId, projectId);
  revalidatePath(`/projects/${projectId}`);
  return { ok: true };
}

/** Add a custom LINE reminder (message + date + time) to a project. */
export async function addProjectTriggerAction(
  projectId: string,
  input: { message: string; date: string; time: string }
): Promise<InlineResult> {
  const user = await requireUser();
  if (!(await ensureCanEditProject(user, projectId)))
    return { ok: false, error: "ไม่มีสิทธิ์แก้ไขโปรเจคนี้" };

  const message = input.message.trim();
  if (!message) return { ok: false, error: "กรุณากรอกข้อความแจ้งเตือน" };

  // Interpreted as Bangkok local time (UTC+7) regardless of server timezone.
  const time = input.time || "00:00";
  const triggerAt = new Date(`${input.date}T${time}:00+07:00`);
  if (Number.isNaN(triggerAt.getTime()))
    return { ok: false, error: "กรุณาเลือกวันที่และเวลาให้ถูกต้อง" };

  await repo.addProjectTrigger(projectId, message, triggerAt, user.id);
  revalidatePath(`/projects/${projectId}`);
  return { ok: true };
}

/** Delete a LINE reminder from a project. */
export async function deleteProjectTriggerAction(
  projectId: string,
  triggerId: string
): Promise<InlineResult> {
  const user = await requireUser();
  if (!(await ensureCanEditProject(user, projectId)))
    return { ok: false, error: "ไม่มีสิทธิ์แก้ไขโปรเจคนี้" };
  await repo.deleteProjectTrigger(triggerId, projectId);
  revalidatePath(`/projects/${projectId}`);
  return { ok: true };
}

/** Toggle a trigger's to-do completion from the web checkbox. */
export async function toggleTriggerDoneAction(
  projectId: string,
  triggerId: string,
  done: boolean
): Promise<InlineResult> {
  const user = await requireUser();
  if (!(await ensureCanEditProject(user, projectId)))
    return { ok: false, error: "ไม่มีสิทธิ์แก้ไขโปรเจคนี้" };

  const before = await repo.getProjectTrigger(triggerId);
  const now = new Date();
  await repo.markTriggerDone(triggerId, done);
  revalidatePath(`/projects/${projectId}`);

  // Only react to a fresh "not done" -> "done" transition made from the web
  // (avoids spamming the group / timeline on every re-check or un-checking).
  if (done && before && !before.doneAt) {
    await repo.addStatusHistoryEntry(
      projectId,
      `✅ ${before.message}`,
      now,
      user.id
    );
    revalidatePath("/calendar");
    try {
      await sendLineMessage(
        `[${before.projectName}] ${before.message} เรียบร้อยแล้ว ${formatDateBkk(now)}`
      );
    } catch {
      // Best-effort notification; the checkbox toggle itself already succeeded.
    }
  }

  return { ok: true };
}

/** Re-fetch a project's triggers (used by the client-side poll for LINE-side updates). */
export async function getProjectTriggersAction(
  projectId: string
): Promise<repo.ProjectTriggerItem[]> {
  const user = await requireUser();
  const project = await repo.getProjectForUser(user, projectId);
  if (!project) return [];
  return repo.listProjectTriggers(projectId);
}

/** Quick-create a project with just a name; details are added later on edit. */
export async function createProjectQuick(formData: FormData): Promise<void> {
  const user = await requireUser();
  if (!canCreateProject(user.role)) {
    throw new Error("You do not have permission to create projects.");
  }
  const name = String(formData.get("name") ?? "").trim();
  if (name.length < 2) throw new Error("กรุณากรอกชื่อโปรเจคอย่างน้อย 2 ตัวอักษร");

  const projectId = await repo.createProjectQuick(name, user.id);
  revalidatePath("/projects");
  redirect(`/projects/${projectId}/edit`);
}

/** Create a project. */
export async function createProject(
  _prev: ProjectActionState,
  formData: FormData
): Promise<ProjectActionState> {
  const user = await requireUser();
  if (!canCreateProject(user.role)) {
    return { error: "You do not have permission to create projects." };
  }

  const parsed = projectBaseSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      error: "Please correct the errors below.",
      fieldErrors: collectFieldErrors(parsed.error),
    };
  }

  let projectId: string;
  try {
    projectId = await repo.createProject(parsed.data, user.id);
  } catch (e) {
    if (isUniqueCodeViolation(e)) {
      return { fieldErrors: { code: "This project code is already in use." } };
    }
    throw e;
  }

  revalidatePath("/projects");
  redirect(`/projects/${projectId}`);
}

/** Update a project. `id` is supplied via a hidden form field. */
export async function updateProject(
  _prev: ProjectActionState,
  formData: FormData
): Promise<ProjectActionState> {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing project reference." };

  const authz = await repo.getProjectAuthz(user.id, id);
  if (!authz.exists) return { error: "Project not found." };
  if (
    !canEditProject(user.role, {
      isManager: authz.isManager,
      isAssignedEngineer: authz.isAssignedEngineer,
    })
  ) {
    return { error: "You do not have permission to edit this project." };
  }

  const parsed = projectUpdateSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      error: "Please correct the errors below.",
      fieldErrors: collectFieldErrors(parsed.error),
    };
  }

  await repo.updateProject(id, parsed.data, user.id);

  revalidatePath("/projects");
  revalidatePath(`/projects/${id}`);
  redirect(`/projects/${id}`);
}

/** Archive (soft-delete) a project. */
export async function archiveProject(formData: FormData): Promise<void> {
  const user = await requireUser();
  if (!canArchiveProject(user.role)) {
    throw new Error("Not authorized to archive projects.");
  }
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Missing project reference.");

  const authz = await repo.getProjectAuthz(user.id, id);
  if (!authz.exists) throw new Error("Project not found.");

  await repo.archiveProject(id, user.id);
  revalidatePath("/projects");
  revalidatePath(`/projects/${id}`);
  redirect(`/projects/${id}`);
}

/** Restore an archived project. */
export async function restoreProject(formData: FormData): Promise<void> {
  const user = await requireUser();
  if (!canArchiveProject(user.role)) {
    throw new Error("Not authorized to restore projects.");
  }
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Missing project reference.");

  await repo.restoreProject(id, user.id);
  revalidatePath("/projects");
  revalidatePath(`/projects/${id}`);
  redirect(`/projects/${id}`);
}
