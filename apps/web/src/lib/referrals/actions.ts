"use server";

import { revalidatePath } from "next/cache";
import { type ReferralStatus } from "@artiverges/database";

import { requireUser } from "@/lib/auth/session";
import * as repo from "./repository";

export type ReferralResult = { ok: true } | { ok: false; error: string };

/**
 * Public intake from the marketing site's "Refer a Project" form
 * (no auth — this is meant to be called by anonymous visitors).
 * `honeypot` is a hidden field real users never fill in; bots that do
 * are silently dropped without revealing the check.
 */
export async function submitPublicReferralAction(input: {
  referrerName: string;
  referrerContact?: string;
  projectTitle: string;
  details?: string;
  prospectName?: string;
  budget?: number;
  honeypot?: string;
}): Promise<ReferralResult> {
  if (input.honeypot) return { ok: true };
  if (!input.referrerName.trim())
    return { ok: false, error: "กรุณากรอกชื่อผู้แนะนำ" };
  if (!input.projectTitle.trim())
    return { ok: false, error: "กรุณากรอกงานที่แนะนำ" };

  await repo.createReferral({
    referrerName: input.referrerName.trim().slice(0, 200),
    referrerContact: input.referrerContact?.trim().slice(0, 200) || undefined,
    projectTitle: input.projectTitle.trim().slice(0, 300),
    details: input.details?.trim().slice(0, 2000) || undefined,
    prospectName: input.prospectName?.trim().slice(0, 200) || undefined,
    budget: input.budget && input.budget > 0 ? input.budget : undefined,
    source: "website",
  });
  return { ok: true };
}

const STATUSES: readonly string[] = [
  "new",
  "contacted",
  "in_progress",
  "won",
  "lost",
];

async function requireManager() {
  const user = await requireUser();
  return repo.canManageReferrals(user.role) ? user : null;
}

export async function addReferralAction(input: {
  referrerName: string;
  referrerContact?: string;
  projectTitle: string;
  details?: string;
  prospectName?: string;
  budget?: number;
}): Promise<ReferralResult> {
  const user = await requireManager();
  if (!user) return { ok: false, error: "ไม่มีสิทธิ์" };
  if (!input.referrerName.trim())
    return { ok: false, error: "กรุณากรอกชื่อผู้แนะนำ" };
  if (!input.projectTitle.trim())
    return { ok: false, error: "กรุณากรอกงานที่แนะนำ" };

  await repo.createReferral({
    referrerName: input.referrerName.trim(),
    referrerContact: input.referrerContact?.trim() || undefined,
    projectTitle: input.projectTitle.trim(),
    details: input.details?.trim() || undefined,
    prospectName: input.prospectName?.trim() || undefined,
    budget: input.budget && input.budget > 0 ? input.budget : undefined,
    source: "manual",
  });
  revalidatePath("/referrals");
  return { ok: true };
}

export async function updateReferralStatusAction(
  id: string,
  status: string
): Promise<ReferralResult> {
  const user = await requireManager();
  if (!user) return { ok: false, error: "ไม่มีสิทธิ์" };
  if (!STATUSES.includes(status))
    return { ok: false, error: "สถานะไม่ถูกต้อง" };
  await repo.setReferralStatus(id, status as ReferralStatus, user.id);
  revalidatePath("/referrals");
  return { ok: true };
}

export async function updateReferralNoteAction(
  id: string,
  note: string
): Promise<ReferralResult> {
  const user = await requireManager();
  if (!user) return { ok: false, error: "ไม่มีสิทธิ์" };
  await repo.setReferralNote(id, note.trim());
  revalidatePath("/referrals");
  return { ok: true };
}

export async function deleteReferralAction(
  id: string
): Promise<ReferralResult> {
  const user = await requireManager();
  if (!user) return { ok: false, error: "ไม่มีสิทธิ์" };
  await repo.deleteReferral(id);
  revalidatePath("/referrals");
  return { ok: true };
}
