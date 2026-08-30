"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth/session";
import { getProjectForUser } from "@/lib/projects/repository";
import { canEditProject } from "@/lib/projects/permissions";
import { sendLineCheckinMessage } from "@/lib/line/client";
import { listWorkers } from "@/lib/workers/repository";
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

/** Push the worker roll-call (all workers, as tap-to-check buttons) into the LINE group. */
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

  const workers = await listWorkers();
  if (workers.length === 0)
    return { ok: false, error: "ยังไม่มีรายชื่อคนงานในระบบ" };

  try {
    await sendLineCheckinMessage(
      { id: project.id, name: project.name },
      dateStr,
      workers.map((w) => ({ id: w.id, name: w.name }))
    );
  } catch {
    return { ok: false, error: "ส่งข้อความไปไลน์ไม่สำเร็จ (ตรวจสอบการตั้งค่า LINE)" };
  }
  return { ok: true };
}
