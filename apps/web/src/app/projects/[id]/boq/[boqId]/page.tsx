import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { requireUser } from "@/lib/auth/session";
import {
  isBoqEditable,
  canApproveBoq,
  canManageBoq,
} from "@/lib/boq/permissions";
import { getBoqTree, listSupplierOptions } from "@/lib/boq/repository";
import {
  submitBoqAction,
  approveBoqAction,
  reopenBoqAction,
  archiveBoqAction,
} from "@/lib/boq/actions";
import { BoqStatusBadge } from "@/components/boq/BoqStatusBadge";
import { BoqEditor } from "@/components/boq/BoqEditor";

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
      ? "bg-primary-600 text-white hover:bg-primary-700"
      : variant === "danger"
        ? "bg-danger text-white hover:brightness-95"
        : "border border-border bg-surface text-text-primary hover:bg-primary-100";
  return (
    <form action={action}>
      <input type="hidden" name="boqId" value={boqId} />
      <button
        type="submit"
        className={`inline-flex h-9 items-center rounded-sm px-3 text-body-sm font-medium ${cls}`}
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

  const [tree, suppliers] = await Promise.all([
    getBoqTree(user, boqId),
    listSupplierOptions(),
  ]);
  if (!tree) notFound();

  const editable = isBoqEditable(user.role, tree.status);
  const canApprove = canApproveBoq(user.role);
  const canManage = canManageBoq(user.role);

  // Structural signature — remounts the editor (fresh state) after structural
  // changes, without disturbing in-progress inline field edits.
  const signature = tree.sections
    .map(
      (s) =>
        `${s.id}:${s.sortOrder}(${s.categories
          .map(
            (c) =>
              `${c.id}:${c.sortOrder}[${c.items
                .map((i) => `${i.id}:${i.sortOrder}`)
                .join(",")}]`
          )
          .join(",")})`
    )
    .join("|");

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/projects/${projectId}/boq`}
          className="text-body-sm text-text-secondary hover:underline"
        >
          ← Bills of Quantities
        </Link>
        <div className="mt-1 flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-h1 font-bold text-text-primary">
                {tree.title ?? `BOQ v${tree.version}`}
              </h1>
              <BoqStatusBadge status={tree.status} />
              <span className="text-body-sm text-text-secondary">
                v{tree.version}
              </span>
            </div>
            <p className="mt-1 font-mono text-body-sm text-text-secondary">
              {tree.project.code} · {tree.project.name}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/projects/${projectId}/boq/${boqId}/export`}
              className="inline-flex h-9 items-center rounded-sm border border-border bg-surface px-3 text-body-sm font-medium text-text-primary hover:bg-primary-100"
              prefetch={false}
            >
              Export CSV
            </Link>
            <Link
              href={`/projects/${projectId}/boq/${boqId}/print`}
              target="_blank"
              className="inline-flex h-9 items-center rounded-sm border border-border bg-surface px-3 text-body-sm font-medium text-text-primary hover:bg-primary-100"
            >
              Print / PDF
            </Link>

            {editable && (
              <WorkflowButton
                action={submitBoqAction}
                boqId={boqId}
                label="Submit"
                variant="primary"
              />
            )}
            {canApprove && tree.status === "submitted" && (
              <WorkflowButton
                action={approveBoqAction}
                boqId={boqId}
                label="Approve"
                variant="primary"
              />
            )}
            {canApprove &&
              (tree.status === "submitted" || tree.status === "approved") && (
                <WorkflowButton
                  action={reopenBoqAction}
                  boqId={boqId}
                  label="Reopen"
                />
              )}
            {canManage && tree.status !== "archived" && (
              <WorkflowButton
                action={archiveBoqAction}
                boqId={boqId}
                label="Archive"
                variant="danger"
              />
            )}
          </div>
        </div>
      </div>

      <BoqEditor
        key={signature}
        tree={tree}
        editable={editable}
        suppliers={suppliers}
      />
    </div>
  );
}
