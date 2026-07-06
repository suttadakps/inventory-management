import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { requireUser } from "@/lib/auth/session";
import {
  isBoqEditable,
  canApproveBoq,
  canManageBoq,
} from "@/lib/boq/permissions";
import { getBoqFlat } from "@/lib/boq/repository";
import {
  submitBoqAction,
  approveBoqAction,
  reopenBoqAction,
  archiveBoqAction,
} from "@/lib/boq/actions";
import { BoqStatusBadge } from "@/components/boq/BoqStatusBadge";
import { BoqFlatEditor } from "@/components/boq/BoqFlatEditor";

export const metadata: Metadata = { title: "BOQ · ARTIVERGES NEXT" };

function WorkflowButton({
  action,
  boqId,
  label,
  variant = "secondary",
}: {
  action: (formData: FormData) => void | Promise<void>;
  boqId: string;
  label: string;
  variant?: "primary" | "secondary" | "danger";
}) {
  const cls =
    variant === "primary"
      ? "bg-primary-700 text-white hover:bg-primary-600"
      : variant === "danger"
        ? "border border-danger text-danger hover:bg-[#f7e0dc]"
        : "border border-[#e2ddd0] bg-white text-text-primary hover:bg-[#faf8f3]";
  return (
    <form action={action}>
      <input type="hidden" name="boqId" value={boqId} />
      <button
        type="submit"
        className={`inline-flex h-9 items-center rounded-md px-3 text-body-sm font-medium ${cls}`}
      >
        {label}
      </button>
    </form>
  );
}

export default async function BoqDetailPage({
  params,
}: {
  params: Promise<{ id: string; boqId: string }>;
}) {
  const user = await requireUser();
  const { id: projectId, boqId } = await params;

  const doc = await getBoqFlat(user, boqId);
  if (!doc) notFound();

  const editable = isBoqEditable(user.role, doc.status);
  const canApprove = canApproveBoq(user.role);
  const canManage = canManageBoq(user.role);

  // Remount the editor with fresh state only when the line set changes
  // (add/remove), leaving inline field edits undisturbed.
  const signature = `${doc.lines.length}:${doc.lines.map((l) => l.id).join(",")}`;

  return (
    <div className="space-y-5">
      <div>
        <Link
          href={`/projects/${projectId}/boq`}
          className="text-body-sm text-text-secondary hover:underline"
        >
          ← BOQ / ใบเสนอราคา
        </Link>
        <div className="mt-1 flex flex-wrap items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-h2 font-bold text-text-primary">
              {doc.title || `BOQ v${doc.version}`}
            </h2>
            <BoqStatusBadge status={doc.status} />
            <span className="text-body-sm text-text-secondary">
              v{doc.version} · {doc.project.code} · {doc.project.clientName}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {editable && (
              <WorkflowButton
                action={submitBoqAction}
                boqId={boqId}
                label="ส่งอนุมัติ"
                variant="primary"
              />
            )}
            {canApprove && doc.status === "submitted" && (
              <WorkflowButton
                action={approveBoqAction}
                boqId={boqId}
                label="อนุมัติ"
                variant="primary"
              />
            )}
            {canApprove &&
              (doc.status === "submitted" || doc.status === "approved") && (
                <WorkflowButton
                  action={reopenBoqAction}
                  boqId={boqId}
                  label="เปิดแก้ไข"
                />
              )}
            {canManage && doc.status !== "archived" && (
              <WorkflowButton
                action={archiveBoqAction}
                boqId={boqId}
                label="เก็บถาวร"
                variant="danger"
              />
            )}
          </div>
        </div>
      </div>

      <BoqFlatEditor
        key={signature}
        doc={doc}
        editable={editable}
        projectId={projectId}
      />
    </div>
  );
}
