"use server";

import { revalidatePath } from "next/cache";

import { requireUser, type CurrentUser } from "@/lib/auth/session";
import { canSeeMoney } from "@/lib/auth/roles";
import { canAnswerApproval, canUpdateSite } from "./permissions";
import * as repo from "./repository";

export type SiteResult = { ok: true } | { ok: false; error: string };

/**
 * Vercel caps a serverless request body near 4.5MB and next.config sets the
 * server-action limit to 5MB, so anything larger is rejected before this code
 * runs. The browser downscales before sending; this is the backstop.
 */
const MAX_PHOTO_BYTES = 4 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

type Authorized =
  | { ok: true; user: CurrentUser }
  | { ok: false; error: string };

/** Everything here is gated on both the role and the project assignment. */
async function authorize(projectId: string): Promise<Authorized> {
  const user = await requireUser();
  if (!canUpdateSite(user.role))
    return { ok: false, error: "ไม่มีสิทธิ์แก้ไข" };
  if (!(await repo.canAccessProject(user, projectId)))
    return { ok: false, error: "ไม่พบโปรเจคนี้" };
  return { ok: true, user };
}

export async function addMilestoneAction(
  projectId: string,
  name: string,
  plannedEnd: string
): Promise<SiteResult> {
  const auth = await authorize(projectId);
  if (!auth.ok) return auth;

  const trimmed = name.trim();
  if (!trimmed) return { ok: false, error: "กรุณากรอกชื่อขั้นตอน" };

  await repo.addMilestone(projectId, trimmed, plannedEnd || null, auth.user.id);
  revalidatePath(`/site/${projectId}`);
  return { ok: true };
}

export async function setMilestoneStatusAction(
  projectId: string,
  milestoneId: string,
  status: "todo" | "in_progress" | "done"
): Promise<SiteResult> {
  const auth = await authorize(projectId);
  if (!auth.ok) return auth;

  await repo.setMilestoneStatus(milestoneId, status, auth.user.id);
  revalidatePath(`/site/${projectId}`);
  return { ok: true };
}

export async function deleteMilestoneAction(
  projectId: string,
  milestoneId: string
): Promise<SiteResult> {
  const auth = await authorize(projectId);
  if (!auth.ok) return auth;

  await repo.deleteMilestone(milestoneId);
  revalidatePath(`/site/${projectId}`);
  return { ok: true };
}

/** Takes the file as FormData so the bytes never pass through a JSON payload. */
export async function uploadSitePhotoAction(
  formData: FormData
): Promise<SiteResult> {
  const projectId = String(formData.get("projectId") ?? "");
  const auth = await authorize(projectId);
  if (!auth.ok) return auth;

  const file = formData.get("photo");
  if (!(file instanceof File) || file.size === 0)
    return { ok: false, error: "กรุณาเลือกรูปภาพ" };
  if (!ALLOWED_TYPES.includes(file.type))
    return { ok: false, error: "รองรับเฉพาะไฟล์ JPG, PNG หรือ WebP" };
  if (file.size > MAX_PHOTO_BYTES)
    return { ok: false, error: "ไฟล์ใหญ่เกินไป ลองถ่ายใหม่หรือย่อรูปก่อน" };

  const caption = String(formData.get("caption") ?? "").trim() || null;
  const takenRaw = String(formData.get("takenAt") ?? "");
  const taken = takenRaw ? new Date(`${takenRaw}T00:00:00`) : new Date();
  const takenAt = Number.isNaN(taken.getTime()) ? new Date() : taken;
  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    await repo.uploadSitePhoto(
      projectId,
      { buffer, contentType: file.type },
      caption,
      takenAt,
      auth.user.id
    );
  } catch {
    return { ok: false, error: "อัพโหลดรูปไม่สำเร็จ ลองใหม่อีกครั้ง" };
  }

  revalidatePath(`/site/${projectId}`);
  return { ok: true };
}

export async function deleteSitePhotoAction(
  projectId: string,
  photoId: string
): Promise<SiteResult> {
  const auth = await authorize(projectId);
  if (!auth.ok) return auth;

  await repo.deleteSitePhoto(photoId);
  revalidatePath(`/site/${projectId}`);
  return { ok: true };
}

// ---- Milestone detail -------------------------------------------------------

/** Resolves the milestone's project first, then runs the usual check on it. */
async function authorizeMilestone(milestoneId: string) {
  const projectId = await repo.milestoneProject(milestoneId);
  if (!projectId)
    return { ok: false as const, error: "ไม่พบขั้นตอนนี้", projectId: "" };
  const auth = await authorize(projectId);
  if (!auth.ok) return { ...auth, projectId };
  return { ...auth, projectId };
}

export async function setMilestoneProgressAction(
  milestoneId: string,
  input: {
    quantityDone: string;
    quantityTotal: string;
    quantityUnit: string;
    location: string;
    forecastEnd: string;
  }
): Promise<SiteResult> {
  const auth = await authorizeMilestone(milestoneId);
  if (!auth.ok) return { ok: false, error: auth.error };

  const num = (v: string) => {
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : null;
  };

  await repo.setMilestoneProgress(
    milestoneId,
    {
      quantityDone: num(input.quantityDone),
      quantityTotal: num(input.quantityTotal),
      quantityUnit: input.quantityUnit.trim() || null,
      location: input.location.trim() || null,
      forecastEnd: input.forecastEnd || null,
    },
    auth.user.id
  );
  revalidatePath(`/site/${auth.projectId}`);
  return { ok: true };
}

export async function setMilestoneInspectionAction(
  milestoneId: string,
  inspection: "not_required" | "pending" | "passed" | "failed"
): Promise<SiteResult> {
  const auth = await authorizeMilestone(milestoneId);
  if (!auth.ok) return { ok: false, error: auth.error };

  await repo.setMilestoneInspection(milestoneId, inspection, auth.user.id);
  revalidatePath(`/site/${auth.projectId}`);
  return { ok: true };
}

// ---- Site log ---------------------------------------------------------------

export type SiteLogFormInput = {
  kind: repo.SiteLogKind;
  title: string;
  detail: string;
  ownerName: string;
  dueDate: string;
  milestoneId: string;
  daysImpact: string;
  costImpact: string;
  refDoc: string;
  revision: string;
  approvedAt: string;
  orderedAt: string;
  etaAt: string;
  arrivedAt: string;
};

export async function addSiteLogAction(
  projectId: string,
  input: SiteLogFormInput
): Promise<SiteResult> {
  const auth = await authorize(projectId);
  if (!auth.ok) return auth;

  const title = input.title.trim();
  if (!title) return { ok: false, error: "กรุณากรอกหัวข้อ" };

  const int = (v: string) => {
    const n = parseInt(v, 10);
    return Number.isFinite(n) ? n : null;
  };
  const dec = (v: string) => {
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : null;
  };

  await repo.addSiteLogEntry(
    projectId,
    {
      kind: input.kind,
      title,
      detail: input.detail.trim() || null,
      ownerName: input.ownerName.trim() || null,
      dueDate: input.dueDate || null,
      milestoneId: input.milestoneId || null,
      daysImpact: int(input.daysImpact),
      // A portal role cannot set a price even by posting one.
      costImpact: canSeeMoney(auth.user.role) ? dec(input.costImpact) : null,
      refDoc: input.refDoc.trim() || null,
      revision: input.revision.trim() || null,
      approvedAt: input.approvedAt || null,
      orderedAt: input.orderedAt || null,
      etaAt: input.etaAt || null,
      arrivedAt: input.arrivedAt || null,
    },
    auth.user.id
  );
  revalidatePath(`/site/${projectId}`);
  return { ok: true };
}

/**
 * Status changes split two ways: anyone who may edit the site can move any
 * entry, and a client may additionally answer an item that is waiting on
 * them — which is the only write a client role has anywhere in the app.
 */
export async function setSiteLogStatusAction(
  entryId: string,
  status: repo.SiteLogStatus,
  note: string
): Promise<SiteResult> {
  const user = await requireUser();
  const projectId = await repo.siteLogEntryProject(entryId);
  if (!projectId) return { ok: false, error: "ไม่พบรายการนี้" };
  if (!(await repo.canAccessProject(user, projectId)))
    return { ok: false, error: "ไม่พบโปรเจคนี้" };

  if (!canUpdateSite(user.role) && !canAnswerApproval(user.role))
    return { ok: false, error: "ไม่มีสิทธิ์แก้ไข" };

  await repo.setSiteLogStatus(entryId, status, note.trim() || null, user.id);
  revalidatePath(`/site/${projectId}`);
  return { ok: true };
}

export async function deleteSiteLogAction(
  entryId: string
): Promise<SiteResult> {
  const projectId = await repo.siteLogEntryProject(entryId);
  if (!projectId) return { ok: false, error: "ไม่พบรายการนี้" };
  const auth = await authorize(projectId);
  if (!auth.ok) return auth;

  await repo.deleteSiteLogEntry(entryId);
  revalidatePath(`/site/${projectId}`);
  return { ok: true };
}
