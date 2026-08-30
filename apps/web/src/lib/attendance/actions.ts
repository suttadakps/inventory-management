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

/** Toggle a worker's presence from the web checklist. */
export async function toggleAttendanceAction(
  projectId: string,
  workerId: string,
  dateStr: string
): Promise<InlineResult> {
  const user = await requireUser();
  if (!(await ensureCanEdit(user, projectId)))
    return { ok: false, error: "ไม่มีสิทธิ์แก้ไขโปรเจคนี้" };

  const date = parseDate(dateStr);
  if (!date) return { ok: false, error: "วันที่ไม่ถูกต้อง" };

  await repo.toggleAttendance(projectId, workerId, date, user.id);
  revalidatePath(`/projects/${projectId}`);
  return { ok: true };
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
  } catch {
    return { ok: false, error: "ส่งข้อความไปไลน์ไม่สำเร็จ (ตรวจสอบการตั้งค่า LINE)" };
  }
  return { ok: true };
}
