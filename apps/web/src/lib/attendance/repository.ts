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

export type RollCallProject = { id: string; name: string };

/** Projects currently under construction — the daily roll-call goes to these. */
export async function listActiveProjectsForRollCall(): Promise<RollCallProject[]> {
  const rows = await prisma.project.findMany({
    where: { deletedAt: null, status: { in: ["started", "active"] } },
    select: { id: true, name: true },
  });
  return rows;
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
    prisma.worker.findUnique({
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
