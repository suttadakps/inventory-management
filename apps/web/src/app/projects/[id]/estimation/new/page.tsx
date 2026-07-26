import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { requireUser } from "@/lib/auth/session";
import { canManageBoq } from "@/lib/boq/permissions";
import { getProjectForUser } from "@/lib/projects/repository";
import { ContentCard } from "@/components/ui/ContentCard";
import { EstimationUploadForm } from "@/components/estimation/EstimationUploadForm";

export const metadata: Metadata = { title: "สร้าง BOQ จาก AI · ARTIVERGES NEXT" };
export const maxDuration = 60;

export default async function EstimationNewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id: projectId } = await params;

  const project = await getProjectForUser(user, projectId);
  if (!project || !canManageBoq(user.role)) notFound();

  return (
    <div className="space-y-5">
      <Link
        href={`/projects/${projectId}/boq`}
        className="text-body-sm text-text-secondary hover:underline"
      >
        ← กลับไปหน้า BOQ
      </Link>

      <ContentCard className="p-6">
        <h2 className="mb-1 text-h2 font-bold text-text-primary">
          สร้าง BOQ จาก AI
        </h2>
        <p className="mb-5 text-body-sm text-text-secondary">
          อัปโหลดแบบก่อสร้าง, PDF, BOQ หรือใบเสนอราคาซัพพลายเออร์ — AI จะอ่าน
          แล้วดึงรายการออกมาเป็น BOQ ที่แก้ไขได้ (รองรับ PDF, PNG, JPG, WEBP
          ขนาดไม่เกิน 4MB)
        </p>
        <EstimationUploadForm projectId={projectId} />
      </ContentCard>
    </div>
  );
}
