"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth/session";
import { getProjectForUser } from "@/lib/projects/repository";
import { canEditProject } from "@/lib/projects/permissions";
import { sendLineCheckinMessage } from "@/lib/line/client";
import * as repo from "./repository";

export type InlineResult = { ok: true } | { ok: false; error: string };

function parseDate(dateStr: string): Date | null {
  const d = new Date(`${dateStr}T00:00:00Z`);
  return Number.isNaN(d.getTime()) ? null : d;
}

async function ensureCanEdit(
  user: Awaited<ReturnType<typeof requireUser>>,
  projectId: string
): Promise<boolean> {
  const project = await getProjectForUser(user, projectId);
  if (!project) return false;
  const isManager = project.managerId === user.id;
  const isAssignedEngineer = project.siteEngineerId === user.id;
  return canEditProject(user.role, { isManager, isAssignedEngineer });
}

/** Re-fetch a project's attendance for a date (used by the client poll for LINE-side taps). */
export async function getAttendanceAction(
  projectId: string,
  dateStr: string
): Promise<repo.AttendanceMark[]> {
  const user = await requireUser();
  const project = await getProjectForUser(user, projectId);
  const date = parseDate(dateStr);
  if (!project || !date) return [];
  return repo.listAttendance(projectId, date);
}

/** Save the whole day's check-in from the web checklist in one go — the
 * ticked names are what gets recorded for that date. */
export async function saveAttendanceDayAction(
  projectId: string,
  dateStr: string,
  workerIds: string[]
): Promise<InlineResult> {
  const user = await requireUser();
  if (!(await ensureCanEdit(user, projectId)))
    return { ok: false, error: "ไม่มีสิทธิ์แก้ไขโปรเจคนี้" };

  const date = parseDate(dateStr);
  if (!date) return { ok: false, error: "วันที่ไม่ถูกต้อง" };

  await repo.setAttendanceDay(projectId, date, workerIds, user.id);
  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/wages");
  return { ok: true };
}

/** Delete an entire day's check-in from the history log, and its auto-synced wage entries. */
export async function deleteAttendanceDayAction(
  projectId: string,
  dateStr: string
): Promise<InlineResult> {
  const user = await requireUser();
  if (!(await ensureCanEdit(user, projectId)))
    return { ok: false, error: "ไม่มีสิทธิ์แก้ไขโปรเจคนี้" };

  const date = parseDate(dateStr);
  if (!date) return { ok: false, error: "วันที่ไม่ถูกต้อง" };

  await repo.deleteAttendanceDay(projectId, date);
  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/wages");
  return { ok: true };
}

/** Re-fetch whether the given date is currently marked "หยุดงาน" for this project. */
export async function getNoWorkDayAction(
  projectId: string,
  dateStr: string
): Promise<boolean> {
  const user = await requireUser();
  const project = await getProjectForUser(user, projectId);
  const date = parseDate(dateStr);
  if (!project || !date) return false;
  return repo.isNoWorkDay(projectId, date);
}

/** Mark/unmark a date as "หยุดงาน" — marking clears any attendance already
 * recorded for that date, since the two states are mutually exclusive. */
export async function setNoWorkDayAction(
  projectId: string,
  dateStr: string,
  noWork: boolean
): Promise<InlineResult> {
  const user = await requireUser();
  if (!(await ensureCanEdit(user, projectId)))
    return { ok: false, error: "ไม่มีสิทธิ์แก้ไขโปรเจคนี้" };

  const date = parseDate(dateStr);
  if (!date) return { ok: false, error: "วันที่ไม่ถูกต้อง" };

  if (noWork) {
    await repo.markNoWorkDay(projectId, date, user.id);
  } else {
    await repo.unmarkNoWorkDay(projectId, date);
  }
  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/wages");
  return { ok: true };
}

/** Re-fetch a project's check-in history (used after a toggle/add so the log stays current). */
export async function getAttendanceHistoryAction(
  projectId: string
): Promise<repo.AttendanceHistoryDay[]> {
  const user = await requireUser();
  const project = await getProjectForUser(user, projectId);
  if (!project) return [];
  return repo.listAttendanceHistory(projectId);
}

export type RenameWorkerResult =
  | { ok: true; worker: repo.CheckinWorkerItem }
  | { ok: false; error: string };

/** Rename a roster entry from the project checklist (e.g. fixing a typo). */
export async function renameCheckinWorkerAction(
  projectId: string,
  workerId: string,
  newName: string
): Promise<RenameWorkerResult> {
  const user = await requireUser();
  if (!(await ensureCanEdit(user, projectId)))
    return { ok: false, error: "ไม่มีสิทธิ์แก้ไขโปรเจคนี้" };

  const trimmed = newName.trim();
  if (!trimmed) return { ok: false, error: "กรุณากรอกชื่อ" };

  const worker = await repo.renameCheckinWorker(workerId, trimmed);
  if (!worker) return { ok: false, error: "ไม่พบคนงาน" };

  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/wages");
  return { ok: true, worker };
}

export type AddWorkerResult =
  | { ok: true; worker: repo.CheckinWorkerItem }
  | { ok: false; error: string };

/** Add a name typed into the "อื่นๆ" field and mark them present right away. */
export async function addCheckinWorkerAction(
  projectId: string,
  dateStr: string,
  name: string
): Promise<AddWorkerResult> {
  const user = await requireUser();
  if (!(await ensureCanEdit(user, projectId)))
    return { ok: false, error: "ไม่มีสิทธิ์แก้ไขโปรเจคนี้" };

  const trimmed = name.trim();
  if (!trimmed) return { ok: false, error: "กรุณากรอกชื่อ" };

  const date = parseDate(dateStr);
  if (!date) return { ok: false, error: "วันที่ไม่ถูกต้อง" };

  const worker = await repo.addCheckinWorker(trimmed);
  await repo.toggleAttendance(projectId, worker.id, date, user.id);
  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/wages");
  return { ok: true, worker };
}

/** Re-fetch the day-crew roster (used after adding a new "อื่นๆ" name). */
export async function listCheckinWorkersAction(): Promise<repo.CheckinWorkerItem[]> {
  await requireUser();
  return repo.listCheckinWorkers();
}

/** Push the worker roll-call (day-crew roster, as tap-to-check buttons) into the LINE group. */
export async function sendCheckinRollCallAction(
  projectId: string,
  dateStr: string
): Promise<InlineResult> {
  const user = await requireUser();
  if (!(await ensureCanEdit(user, projectId)))
    return { ok: false, error: "ไม่มีสิทธิ์แก้ไขโปรเจคนี้" };

  const date = parseDate(dateStr);
  if (!date) return { ok: false, error: "วันที่ไม่ถูกต้อง" };

  const project = await getProjectForUser(user, projectId);
  if (!project) return { ok: false, error: "ไม่พบโปรเจค" };

  const workers = await repo.listCheckinWorkers();
  if (workers.length === 0)
    return { ok: false, error: "ยังไม่มีรายชื่อคนงานในระบบ" };

  try {
    await sendLineCheckinMessage(
      { id: project.id, name: project.name },
      dateStr,
      workers
    );
    await repo.setLastRollCall(project.id, project.name, date);
  } catch {
    return { ok: false, error: "ส่งข้อความไปไลน์ไม่สำเร็จ (ตรวจสอบการตั้งค่า LINE)" };
  }
  return { ok: true };
}
