import { prisma } from "@/lib/db";

export type AttendanceMark = {
  workerId: string;
  markedAt: string;
};

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

/** Toggle a worker's presence for a project on a date. Returns the new state. */
export async function toggleAttendance(
  projectId: string,
  workerId: string,
  date: Date,
  actorId: string | null
): Promise<boolean> {
  const existing = await prisma.workerAttendance.findUnique({
    where: { projectId_workerId_date: { projectId, workerId, date } },
  });
  if (existing) {
    await prisma.workerAttendance.delete({ where: { id: existing.id } });
    return false;
  }
  await prisma.workerAttendance.create({
    data: { projectId, workerId, date, createdById: actorId },
  });
  return true;
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

export type RollCallProject = { id: string; name: string };

/** Projects currently under construction — the daily roll-call goes to these. */
export async function listActiveProjectsForRollCall(): Promise<RollCallProject[]> {
  const rows = await prisma.project.findMany({
    where: { deletedAt: null, status: { in: ["started", "active"] } },
    select: { id: true, name: true },
  });
  return rows;
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
