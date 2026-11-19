"use server";

import { revalidatePath } from "next/cache";

import { requireUser, type CurrentUser } from "@/lib/auth/session";
import { canUpdateSite } from "./permissions";
import * as repo from "./repository";

export type SiteResult = { ok: true } | { ok: false; error: string };

const MAX_PHOTO_BYTES = 10 * 1024 * 1024;
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
    return { ok: false, error: "ไฟล์ใหญ่เกิน 10MB" };

  const caption = String(formData.get("caption") ?? "").trim() || null;
  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    await repo.uploadSitePhoto(
      projectId,
      { buffer, contentType: file.type },
      caption,
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
