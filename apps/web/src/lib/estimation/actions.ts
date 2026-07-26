"use server";

import crypto from "crypto";
import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth/session";
import { canManageBoq } from "@/lib/boq/permissions";
import { getProjectForUser } from "@/lib/projects/repository";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/serviceRole";
import { extractBoqFromDocument, type ExtractedLine } from "./claude";
import * as repo from "./repository";

const ACCEPTED_TYPES = new Set([
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
]);
const MAX_BYTES = 4 * 1024 * 1024; // 4MB — Vercel Hobby's practical request-body ceiling

export type UploadResult =
  | { ok: true; extractionId: string }
  | { ok: false; error: string };

export async function uploadEstimationFileAction(
  projectId: string,
  formData: FormData
): Promise<UploadResult> {
  const user = await requireUser();
  if (!canManageBoq(user.role))
    return { ok: false, error: "ไม่มีสิทธิ์สร้าง BOQ ในโปรเจคนี้" };

  const project = await getProjectForUser(user, projectId);
  if (!project) return { ok: false, error: "ไม่พบโปรเจค" };

  const file = formData.get("file");
  if (!(file instanceof File)) return { ok: false, error: "กรุณาเลือกไฟล์" };
  if (!ACCEPTED_TYPES.has(file.type))
    return { ok: false, error: "รองรับเฉพาะไฟล์ PDF, PNG, JPG, WEBP" };
  if (file.size > MAX_BYTES)
    return { ok: false, error: "ไฟล์ใหญ่เกิน 4MB กรุณาลดขนาดไฟล์" };

  const buffer = Buffer.from(await file.arrayBuffer());
  const storagePath = `estimation/${projectId}/${crypto.randomUUID()}-${file.name}`;

  const supabase = createSupabaseServiceRoleClient();
  const { error: uploadError } = await supabase.storage
    .from("estimation-uploads")
    .upload(storagePath, buffer, { contentType: file.type });
  if (uploadError) return { ok: false, error: `อัปโหลดไฟล์ไม่สำเร็จ: ${uploadError.message}` };

  const extractionId = await repo.createExtraction(
    projectId,
    { fileName: file.name, storagePath, mimeType: file.type },
    user.id
  );

  await repo.setExtractionStatus(extractionId, "processing");
  try {
    const result = await extractBoqFromDocument({
      base64: buffer.toString("base64"),
      mimeType: file.type,
    });
    await repo.setExtractionResult(extractionId, result);
  } catch (e) {
    await repo.setExtractionError(
      extractionId,
      e instanceof Error ? e.message : "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ"
    );
  }

  return { ok: true, extractionId };
}

/** Thin read wrapper for the client-side status poll. */
export async function getExtractionStatusAction(
  extractionId: string
): Promise<repo.ExtractionStatus | null> {
  const user = await requireUser();
  const extraction = await repo.getExtraction(user, extractionId);
  return extraction?.status ?? null;
}

export type CommitResult =
  | { ok: true; boqId: string }
  | { ok: false; error: string };

export async function commitExtractionAction(
  projectId: string,
  extractionId: string,
  lines: ExtractedLine[]
): Promise<CommitResult> {
  const user = await requireUser();
  if (!canManageBoq(user.role))
    return { ok: false, error: "ไม่มีสิทธิ์สร้าง BOQ ในโปรเจคนี้" };

  const project = await getProjectForUser(user, projectId);
  if (!project) return { ok: false, error: "ไม่พบโปรเจค" };
  if (lines.length === 0)
    return { ok: false, error: "ไม่มีรายการให้นำเข้า" };

  const boqId = await repo.commitExtractionToBoq(
    extractionId,
    projectId,
    lines,
    user.id
  );
  revalidatePath(`/projects/${projectId}/boq`);
  return { ok: true, boqId };
}
