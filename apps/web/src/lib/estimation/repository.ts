import { prisma } from "@/lib/db";
import type { CurrentUser } from "@/lib/auth/session";
import { getProjectForUser } from "@/lib/projects/repository";
import { createBoq, addFlatLine, updateFlatLine } from "@/lib/boq/repository";
import type { ExtractedLine } from "./claude";

export type ExtractionStatus = "pending" | "processing" | "done" | "error";

export type ExtractionDetail = {
  id: string;
  projectId: string;
  fileName: string;
  status: ExtractionStatus;
  result: ExtractedLine[] | null;
  errorMessage: string | null;
  boqId: string | null;
};

function toDetail(row: {
  id: string;
  projectId: string;
  fileName: string;
  status: string;
  result: unknown;
  errorMessage: string | null;
  boqId: string | null;
}): ExtractionDetail {
  return {
    id: row.id,
    projectId: row.projectId,
    fileName: row.fileName,
    status: row.status as ExtractionStatus,
    result: (row.result as ExtractedLine[] | null) ?? null,
    errorMessage: row.errorMessage,
    boqId: row.boqId,
  };
}

export async function createExtraction(
  projectId: string,
  input: { fileName: string; storagePath: string; mimeType: string },
  actorId: string
): Promise<string> {
  const created = await prisma.boqExtraction.create({
    data: {
      projectId,
      fileName: input.fileName,
      storagePath: input.storagePath,
      mimeType: input.mimeType,
      status: "pending",
      createdById: actorId,
    },
    select: { id: true },
  });
  return created.id;
}

export async function setExtractionStatus(
  id: string,
  status: ExtractionStatus
): Promise<void> {
  await prisma.boqExtraction.update({ where: { id }, data: { status } });
}

export async function setExtractionResult(
  id: string,
  result: ExtractedLine[]
): Promise<void> {
  await prisma.boqExtraction.update({
    where: { id },
    data: { status: "done", result },
  });
}

export async function setExtractionError(
  id: string,
  message: string
): Promise<void> {
  await prisma.boqExtraction.update({
    where: { id },
    data: { status: "error", errorMessage: message },
  });
}

/** Fetch an extraction, scoped through the same view-check as project pages. */
export async function getExtraction(
  user: CurrentUser,
  id: string
): Promise<ExtractionDetail | null> {
  const row = await prisma.boqExtraction.findUnique({ where: { id } });
  if (!row) return null;
  const project = await getProjectForUser(user, row.projectId);
  if (!project) return null;
  return toDetail(row);
}

export async function listExtractionsForProject(
  projectId: string
): Promise<ExtractionDetail[]> {
  const rows = await prisma.boqExtraction.findMany({
    where: { projectId },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
  return rows.map(toDetail);
}

/** Commit reviewed/edited extraction lines into a brand-new BOQ version. */
export async function commitExtractionToBoq(
  extractionId: string,
  projectId: string,
  lines: ExtractedLine[],
  actorId: string
): Promise<string> {
  const extraction = await prisma.boqExtraction.findFirst({
    where: { id: extractionId, projectId },
  });
  if (!extraction) throw new Error("Extraction not found");

  const boqId = await createBoq(projectId, `BOQ (AI) - ${extraction.fileName}`, actorId);

  for (const line of lines) {
    const itemId = await addFlatLine(boqId);
    await updateFlatLine(itemId, {
      sectionLabel: line.sectionLabel,
      description: line.description,
      size: line.size,
      quantity: line.quantity,
      unit: line.unit,
      unitPrice: line.unitPrice,
    });
  }

  await prisma.boqExtraction.update({
    where: { id: extractionId },
    data: { boqId },
  });

  return boqId;
}
