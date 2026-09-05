import { prisma } from "@/lib/db";

export type AttendanceMark = {
  workerId: string;
  markedAt: string;
};

/** Marks a wage entry as auto-generated from check-in, so un-checking someone
 * can safely remove it again without touching a manually entered/paid row. */
const AUTO_WAGE_NOTE = "สร้างจากระบบเช็คชื่อ";

async function createAutoWage(
  projectId: string,
  workerId: string,
  date: Date,
  actorId: string | null
): Promise<void> {
  const worker = await prisma.checkinWorker.findUnique({
    where: { id: workerId },
    select: { name: true, dailyRate: true },
  });
  if (!worker) return;

  const existing = await prisma.wageEntry.findFirst({
    where: {
      projectId,
      workerName: worker.name,
      workDate: date,
      note: AUTO_WAGE_NOTE,
    },
    select: { id: true },
  });
  if (existing) return;

  await prisma.wageEntry.create({
    data: {
      projectId,
      workerName: worker.name,
      daysWorked: 1,
      amount: worker.dailyRate ?? 0,
      workDate: date,
      status: "unpaid",
      note: AUTO_WAGE_NOTE,
      createdById: actorId,
    },
  });
}

async function removeAutoWage(
  projectId: string,
  workerId: string,
  date: Date
): Promise<void> {
  const worker = await prisma.checkinWorker.findUnique({
    where: { id: workerId },
    select: { name: true },
  });
  if (!worker) return;

  // Never touch a wage row already marked paid, even if it was auto-created.
  await prisma.wageEntry.deleteMany({
    where: {
      projectId,
      workerName: worker.name,
      workDate: date,
      note: AUTO_WAGE_NOTE,
      status: "unpaid",
    },
  });
}

/** Delete an entire day's check-in (every worker marked present that day,
 * or a "หยุดงาน" marker), removing auto-synced wage entries too (already-paid
 * ones are kept). */
export async function deleteAttendanceDay(
  projectId: string,
  date: Date
): Promise<void> {
  const rows = await prisma.workerAttendance.findMany({
    where: { projectId, date },
    select: { workerId: true },
  });
  for (const r of rows) {
    await removeAutoWage(projectId, r.workerId, date);
  }
  await prisma.workerAttendance.deleteMany({ where: { projectId, date } });
  await prisma.noWorkDay.deleteMany({ where: { projectId, date } });
}

/** Mark a day as "หยุดงาน" (no work at all) — clears any attendance already
 * recorded for it first, since the two are mutually exclusive. */
export async function markNoWorkDay(
  projectId: string,
  date: Date,
  actorId: string | null
): Promise<void> {
  await deleteAttendanceDay(projectId, date);
  await prisma.noWorkDay.upsert({
    where: { projectId_date: { projectId, date } },
    create: { projectId, date, createdById: actorId },
    update: {},
  });
}

export async function unmarkNoWorkDay(
  projectId: string,
  date: Date
): Promise<void> {
  await prisma.noWorkDay.deleteMany({ where: { projectId, date } });
}

export async function isNoWorkDay(
  projectId: string,
  date: Date
): Promise<boolean> {
  const row = await prisma.noWorkDay.findUnique({
    where: { projectId_date: { projectId, date } },
    select: { id: true },
  });
  return row !== null;
}

/** Workers marked present for a project on a given date. */
export async function listAttendance(
  projectId: string,
  date: Date
): Promise<AttendanceMark[]> {
  const rows = await prisma.workerAttendance.findMany({
    where: { projectId, date },
    select: { workerId: true, markedAt: true },
  });
  return rows.map((r) => ({
    workerId: r.workerId,
    markedAt: r.markedAt.toISOString(),
  }));
}

/** Set a worker's presence to exactly `present`, syncing a matching wage
 * entry (สรุปค่าแรง) at the worker's daily rate. Idempotent — safe to call
 * again with the same value (e.g. an explicit "บันทึก" confirm click)
 * without accidentally flipping an already-correct state. */
export async function setAttendance(
  projectId: string,
  workerId: string,
  date: Date,
  present: boolean,
  actorId: string | null
): Promise<void> {
  const existing = await prisma.workerAttendance.findUnique({
    where: { projectId_workerId_date: { projectId, workerId, date } },
  });
  if (present) {
    if (!existing) {
      await prisma.workerAttendance.create({
        data: { projectId, workerId, date, createdById: actorId },
      });
      await createAutoWage(projectId, workerId, date, actorId);
    }
    await unmarkNoWorkDay(projectId, date);
  } else if (existing) {
    await prisma.workerAttendance.delete({ where: { id: existing.id } });
    await removeAutoWage(projectId, workerId, date);
  }
}

/** Toggle a worker's presence for a project on a date. Returns the new state.
 * Used by LINE, where a button tap has no "current checkbox" to read from. */
export async function toggleAttendance(
  projectId: string,
  workerId: string,
  date: Date,
  actorId: string | null
): Promise<boolean> {
  const existing = await prisma.workerAttendance.findUnique({
    where: { projectId_workerId_date: { projectId, workerId, date } },
  });
  await setAttendance(projectId, workerId, date, !existing, actorId);
  return !existing;
}

/** Mark a worker present without toggling — used by the LINE text-command
 * add flow, where typing the same name twice shouldn't un-check them. */
export async function ensurePresent(
  projectId: string,
  workerId: string,
  date: Date,
  actorId: string | null
): Promise<boolean> {
  const existing = await prisma.workerAttendance.findUnique({
    where: { projectId_workerId_date: { projectId, workerId, date } },
  });
  if (existing) return false;
  await prisma.workerAttendance.create({
    data: { projectId, workerId, date, createdById: actorId },
  });
  await createAutoWage(projectId, workerId, date, actorId);
  await unmarkNoWorkDay(projectId, date);
  return true;
}

export type CheckinWorkerItem = { id: string; name: string };

/** The day-crew roster shown as check-in buttons/checkboxes (not the WHT worker roster). */
export async function listCheckinWorkers(): Promise<CheckinWorkerItem[]> {
  return prisma.checkinWorker.findMany({
    where: { active: true },
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true },
  });
}

/** Add a one-off name typed into the "อื่นๆ" field. Reuses an existing entry if the name already exists. */
export async function addCheckinWorker(name: string): Promise<CheckinWorkerItem> {
  const existing = await prisma.checkinWorker.findFirst({
    where: { name, active: true },
    select: { id: true, name: true },
  });
  if (existing) return existing;
  return prisma.checkinWorker.create({
    data: { name },
    select: { id: true, name: true },
  });
}

export type AttendanceHistoryDay = {
  date: string;
  workerNames: string[];
  noWork?: boolean;
};

/** Past check-in days for a project, most recent first, for the history log
 * — includes both worker check-ins and "หยุดงาน" no-work days. */
export async function listAttendanceHistory(
  projectId: string,
  limit = 30
): Promise<AttendanceHistoryDay[]> {
  const [rows, noWorkRows] = await Promise.all([
    prisma.workerAttendance.findMany({
      where: { projectId },
      orderBy: { date: "desc" },
      include: { worker: { select: { name: true } } },
      take: 500,
    }),
    prisma.noWorkDay.findMany({
      where: { projectId },
      orderBy: { date: "desc" },
      take: 500,
      select: { date: true },
    }),
  ]);

  const byDate = new Map<string, string[]>();
  for (const r of rows) {
    const dateStr = r.date.toISOString().slice(0, 10);
    const names = byDate.get(dateStr);
    if (names) names.push(r.worker.name);
    else byDate.set(dateStr, [r.worker.name]);
  }

  const days: AttendanceHistoryDay[] = Array.from(byDate.entries()).map(
    ([date, workerNames]) => ({ date, workerNames })
  );
  for (const n of noWorkRows) {
    days.push({ date: n.date.toISOString().slice(0, 10), workerNames: [], noWork: true });
  }

  return days.sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, limit);
}

/** Rename a roster entry and relabel their auto-synced wage entries to match
 * (never touches manually entered wage rows under the same old name). */
export async function renameCheckinWorker(
  workerId: string,
  newName: string
): Promise<CheckinWorkerItem | null> {
  const worker = await prisma.checkinWorker.findUnique({
    where: { id: workerId },
    select: { id: true, name: true },
  });
  if (!worker) return null;
  if (worker.name === newName) return worker;

  const updated = await prisma.checkinWorker.update({
    where: { id: workerId },
    data: { name: newName },
    select: { id: true, name: true },
  });
  await prisma.wageEntry.updateMany({
    where: { workerName: worker.name, note: AUTO_WAGE_NOTE },
    data: { workerName: newName },
  });
  return updated;
}

export type RollCallProject = { id: string; name: string };

/** Projects currently under construction — the daily roll-call goes to these. */
export async function listActiveProjectsForRollCall(): Promise<RollCallProject[]> {
  const rows = await prisma.project.findMany({
    where: { deletedAt: null, status: { in: ["started", "active"] } },
    select: { id: true, name: true },
  });
  return rows;
}

/** Project name for a check-in-related postback that has no worker involved
 * (e.g. the "หยุดงาน" button). */
export async function getProjectName(projectId: string): Promise<string | null> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { name: true },
  });
  return project?.name ?? null;
}

const ROLL_CALL_STATE_ID = "global";

/** Record which project's roll-call was just pushed to LINE, for the free-text add command. */
export async function setLastRollCall(
  projectId: string,
  projectName: string,
  date: Date
): Promise<void> {
  await prisma.rollCallState.upsert({
    where: { id: ROLL_CALL_STATE_ID },
    create: { id: ROLL_CALL_STATE_ID, projectId, projectName, date },
    update: { projectId, projectName, date, sentAt: new Date() },
  });
}

export type LastRollCall = { projectId: string; projectName: string; date: string };

/** The most recent roll-call, only if it was for today (Bangkok) — otherwise stale/none. */
export async function getLastRollCall(todayStr: string): Promise<LastRollCall | null> {
  const row = await prisma.rollCallState.findUnique({
    where: { id: ROLL_CALL_STATE_ID },
  });
  if (!row) return null;
  const rowDateStr = row.date.toISOString().slice(0, 10);
  if (rowDateStr !== todayStr) return null;
  return { projectId: row.projectId, projectName: row.projectName, date: rowDateStr };
}

export type AttendanceContext = {
  projectId: string;
  projectName: string;
  workerId: string;
  workerName: string;
};

/** Project + worker names for a check-in postback, so the LINE reply can name both. */
export async function getAttendanceContext(
  projectId: string,
  workerId: string
): Promise<AttendanceContext | null> {
  const [project, worker] = await Promise.all([
    prisma.project.findUnique({
      where: { id: projectId },
      select: { name: true },
    }),
    prisma.checkinWorker.findUnique({
      where: { id: workerId },
      select: { name: true },
    }),
  ]);
  if (!project || !worker) return null;
  return {
    projectId,
    projectName: project.name,
    workerId,
    workerName: worker.name,
  };
}
