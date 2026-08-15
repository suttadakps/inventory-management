import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { requireUser } from "@/lib/auth/session";
import { canManageWorkers } from "@/lib/workers/permissions";
import { ContentCard } from "@/components/ui/ContentCard";
import { WorkerForm } from "@/components/workers/WorkerForm";

export const metadata: Metadata = { title: "เพิ่มช่างใหม่ · ARTIVERGES NEXT" };

export default async function WorkerNewPage() {
  const user = await requireUser();
  if (!canManageWorkers(user.role)) notFound();

  return (
    <div className="space-y-5">
      <Link
        href="/workers"
        className="text-body-sm text-text-secondary hover:underline"
      >
        ← กลับไปหน้ารายชื่อช่าง
      </Link>

      <ContentCard className="p-6">
        <h2 className="mb-4 text-h2 font-bold text-text-primary">
          เพิ่มช่างใหม่
        </h2>
        <WorkerForm mode="create" initial={{}} />
      </ContentCard>
    </div>
  );
}
