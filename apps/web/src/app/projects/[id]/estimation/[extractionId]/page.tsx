import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { requireUser } from "@/lib/auth/session";
import { getExtraction } from "@/lib/estimation/repository";
import { ContentCard } from "@/components/ui/ContentCard";
import { EstimationStatusPoller } from "@/components/estimation/EstimationStatusPoller";
import { EstimationReview } from "@/components/estimation/EstimationReview";

export const metadata: Metadata = { title: "ตรวจสอบ BOQ จาก AI · ARTIVERGES NEXT" };

export default async function EstimationDetailPage({
  params,
}: {
  params: Promise<{ id: string; extractionId: string }>;
}) {
  const user = await requireUser();
  const { id: projectId, extractionId } = await params;

  const extraction = await getExtraction(user, extractionId);
  if (!extraction || extraction.projectId !== projectId) notFound();

  return (
    <div className="space-y-5">
      <Link
        href={`/projects/${projectId}/boq`}
        className="text-body-sm text-text-secondary hover:underline"
      >
        ← กลับไปหน้า BOQ
      </Link>

      <ContentCard className="p-6">
        <h2 className="mb-4 text-h2 font-bold text-text-primary">
          สร้าง BOQ จาก AI
        </h2>

        {(extraction.status === "pending" || extraction.status === "processing") && (
          <EstimationStatusPoller
            extractionId={extractionId}
            status={extraction.status}
          />
        )}

        {extraction.status === "error" && (
          <div className="space-y-3">
            <p className="text-body-sm text-danger">
              เกิดข้อผิดพลาด: {extraction.errorMessage ?? "ไม่ทราบสาเหตุ"}
            </p>
            <Link
              href={`/projects/${projectId}/estimation/new`}
              className="inline-flex h-10 items-center rounded-md bg-primary-700 px-4 text-body-sm font-medium text-white hover:bg-primary-600"
            >
              ลองอัปโหลดใหม่
            </Link>
          </div>
        )}

        {extraction.status === "done" && extraction.result && (
          <EstimationReview
            projectId={projectId}
            extractionId={extractionId}
            fileName={extraction.fileName}
            initialLines={extraction.result}
          />
        )}
      </ContentCard>
    </div>
  );
}
