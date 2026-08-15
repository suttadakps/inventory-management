import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { requireUser } from "@/lib/auth/session";
import { canManageWorkers } from "@/lib/workers/permissions";
import { getWorker } from "@/lib/workers/repository";
import { ContentCard } from "@/components/ui/ContentCard";
import { WorkerForm } from "@/components/workers/WorkerForm";
import { DeleteWorkerButton } from "@/components/workers/DeleteWorkerButton";
import type { WorkerFormInput } from "@/lib/workers/actions";

export const metadata: Metadata = { title: "รายชื่อช่าง · ARTIVERGES NEXT" };

export default async function WorkerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  if (!canManageWorkers(user.role)) notFound();

  const { id } = await params;
  const worker = await getWorker(id);
  if (!worker) notFound();

  const initial: Partial<WorkerFormInput> = {
    name: worker.name,
    taxId: worker.taxId ?? "",
    position: worker.position ?? "",
    phone: worker.phone ?? "",
    address: worker.address ?? "",
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/workers"
          className="text-body-sm text-text-secondary hover:underline"
        >
          ← กลับไปหน้ารายชื่อช่าง
        </Link>
        <DeleteWorkerButton id={id} />
      </div>

      <ContentCard className="p-6">
        <h2 className="mb-4 text-h2 font-bold text-text-primary">
          {worker.name}
        </h2>
        <WorkerForm mode="edit" workerId={id} initial={initial} />
      </ContentCard>
    </div>
  );
}
