import crypto from "crypto";

import { prisma } from "@/lib/db";
import type { CurrentUser } from "@/lib/auth/session";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/serviceRole";
import { canViewAllProjects } from "@/lib/projects/permissions";

/**
 * Data access for the site portal (/site) — the only surface clients, site
 * engineers and workers ever see.
 *
 * Every selection here is deliberately narrow: no contractValue, budgetCost,
 * actualCost, BOQ, wage or payment field is ever read, so a price cannot leak
 * through this module even by accident. Milestones ride on the existing Task
 * model and site photos on Photo.
 */

const BUCKET = "site-photos";

/** The projects a portal user is attached to — assignment, or their client record. */
function scopeWhere(user: CurrentUser) {
  if (canViewAllProjects(user.role)) return {};
  if (user.role === "client") return { client: { portalUserId: user.id } };
  return {
    OR: [{ managerId: user.id }, { members: { some: { userId: user.id } } }],
  };
}

export type SiteProjectCard = {
  id: string;
  name: string;
  status: string;
  progress: number;
  photoCount: number;
  milestoneDone: number;
  milestoneTotal: number;
};

export async function listSiteProjects(
  user: CurrentUser
): Promise<SiteProjectCard[]> {
  const rows = await prisma.project.findMany({
    where: { deletedAt: null, ...scopeWhere(user) },
    orderBy: { updatedAt: "desc" },
    take: 100,
    select: {
      id: true,
      name: true,
      status: true,
      progressPct: true,
      _count: { select: { photos: { where: { deletedAt: null } } } },
      tasks: { where: { deletedAt: null }, select: { status: true } },
    },
  });

  return rows.map((p) => ({
    id: p.id,
    name: p.name,
    status: p.status,
    progress: p.progressPct.toNumber(),
    photoCount: p._count.photos,
    milestoneDone: p.tasks.filter((t) => t.status === "done").length,
    milestoneTotal: p.tasks.length,
  }));
}

export type SiteMilestone = {
  id: string;
  name: string;
  description: string | null;
  status: string;
  plannedStart: string | null;
  plannedEnd: string | null;
  sortOrder: number;
};

export type SitePhoto = {
  id: string;
  url: string;
  caption: string | null;
  takenAt: string;
  uploaderName: string | null;
};

export type SiteProjectDetail = {
  id: string;
  name: string;
  status: string;
  progress: number;
  address: string | null;
  startDate: string | null;
  endDate: string | null;
  milestones: SiteMilestone[];
  photos: SitePhoto[];
};

/** Null when the project does not exist or is out of this user's scope. */
export async function getSiteProject(
  user: CurrentUser,
  projectId: string
): Promise<SiteProjectDetail | null> {
  const p = await prisma.project.findFirst({
    where: { id: projectId, deletedAt: null, ...scopeWhere(user) },
    select: {
      id: true,
      name: true,
      status: true,
      progressPct: true,
      address: true,
      startDate: true,
      endDate: true,
      tasks: {
        where: { deletedAt: null },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        select: {
          id: true,
          name: true,
          description: true,
          status: true,
          plannedStart: true,
          plannedEnd: true,
          sortOrder: true,
        },
      },
      photos: {
        where: { deletedAt: null },
        orderBy: { createdAt: "desc" },
        take: 200,
        select: {
          id: true,
          fileUrl: true,
          caption: true,
          takenAt: true,
          createdAt: true,
          uploader: { select: { fullName: true, email: true } },
        },
      },
    },
  });
  if (!p) return null;

  return {
    id: p.id,
    name: p.name,
    status: p.status,
    progress: p.progressPct.toNumber(),
    address: p.address,
    startDate: p.startDate ? p.startDate.toISOString().slice(0, 10) : null,
    endDate: p.endDate ? p.endDate.toISOString().slice(0, 10) : null,
    milestones: p.tasks.map((t) => ({
      id: t.id,
      name: t.name,
      description: t.description,
      status: t.status,
      plannedStart: t.plannedStart
        ? t.plannedStart.toISOString().slice(0, 10)
        : null,
      plannedEnd: t.plannedEnd ? t.plannedEnd.toISOString().slice(0, 10) : null,
      sortOrder: t.sortOrder,
    })),
    photos: p.photos.map((ph) => ({
      id: ph.id,
      url: ph.fileUrl,
      caption: ph.caption,
      takenAt: (ph.takenAt ?? ph.createdAt).toISOString(),
      uploaderName: ph.uploader?.fullName ?? ph.uploader?.email ?? null,
    })),
  };
}

/** True when the user is attached to the project (or sees everything). */
export async function canAccessProject(
  user: CurrentUser,
  projectId: string
): Promise<boolean> {
  const hit = await prisma.project.findFirst({
    where: { id: projectId, deletedAt: null, ...scopeWhere(user) },
    select: { id: true },
  });
  return hit !== null;
}

// ---- Milestones -------------------------------------------------------------

export async function addMilestone(
  projectId: string,
  name: string,
  plannedEnd: string | null,
  actorId: string
): Promise<void> {
  const last = await prisma.task.findFirst({
    where: { projectId, deletedAt: null },
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  });
  await prisma.task.create({
    data: {
      projectId,
      name,
      plannedEnd: plannedEnd ? new Date(plannedEnd) : null,
      sortOrder: (last?.sortOrder ?? 0) + 1,
      createdById: actorId,
    },
  });
  await syncProgress(projectId);
}

export async function setMilestoneStatus(
  milestoneId: string,
  status: "todo" | "in_progress" | "done",
  actorId: string
): Promise<string | null> {
  const task = await prisma.task.update({
    where: { id: milestoneId },
    data: {
      status,
      progressPct: status === "done" ? 100 : status === "in_progress" ? 50 : 0,
      updatedById: actorId,
    },
    select: { projectId: true },
  });
  await syncProgress(task.projectId);
  return task.projectId;
}

export async function deleteMilestone(milestoneId: string): Promise<string> {
  const task = await prisma.task.update({
    where: { id: milestoneId },
    data: { deletedAt: new Date() },
    select: { projectId: true },
  });
  await syncProgress(task.projectId);
  return task.projectId;
}

/**
 * Keeps the project's headline percentage in step with its milestones, so the
 * bar the client sees cannot drift from the list underneath it. A project with
 * no milestones keeps whatever the back office set by hand.
 */
async function syncProgress(projectId: string): Promise<void> {
  const tasks = await prisma.task.findMany({
    where: { projectId, deletedAt: null },
    select: { status: true },
  });
  if (tasks.length === 0) return;
  const done = tasks.filter((t) => t.status === "done").length;
  const pct = Math.round((done / tasks.length) * 100);
  await prisma.project.update({
    where: { id: projectId },
    data: { progressPct: pct },
  });
}

// ---- Photos -----------------------------------------------------------------

export async function uploadSitePhoto(
  projectId: string,
  file: { buffer: Buffer; contentType: string },
  caption: string | null,
  actorId: string
): Promise<void> {
  const ext = file.contentType === "image/png" ? "png" : "jpg";
  const storagePath = `${projectId}/${crypto.randomUUID()}.${ext}`;

  const supabase = createSupabaseServiceRoleClient();
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, file.buffer, { contentType: file.contentType });
  if (error) throw error;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);

  await prisma.photo.create({
    data: {
      projectId,
      fileUrl: data.publicUrl,
      caption,
      takenAt: new Date(),
      uploadedById: actorId,
    },
  });
}

export async function deleteSitePhoto(photoId: string): Promise<string> {
  const photo = await prisma.photo.update({
    where: { id: photoId },
    data: { deletedAt: new Date() },
    select: { projectId: true },
  });
  return photo.projectId;
}
