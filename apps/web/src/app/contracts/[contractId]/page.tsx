import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { requireUser } from "@/lib/auth/session";
import {
  canManageContracts,
  isContractEditable,
} from "@/lib/contract/permissions";
import { getContract } from "@/lib/contract/repository";
import { milestonesBalance } from "@/lib/contract/calc";
import {
  submitContractAction,
  approveContractAction,
  signContractAction,
  completeContractAction,
  cancelContractAction,
  reopenContractAction,
  createVersionAction,
  archiveContractAction,
  restoreContractAction,
} from "@/lib/contract/actions";
import { ContractStatusBadge } from "@/components/contract/ContractStatusBadge";
import { MilestonesPanel } from "@/components/contract/MilestonesPanel";
import { CommentsPanel } from "@/components/contract/CommentsPanel";
import { AttachmentsPanel } from "@/components/contract/AttachmentsPanel";
import { ContractTimeline } from "@/components/contract/ContractTimeline";
import { formatMoney } from "@/lib/format";

export const metadata: Metadata = { title: "Contract · ARTIVERGES NEXT" };

function WorkflowButton({
  action,
  id,
  label,
  variant = "secondary",
}: {
  action: (formData: FormData) => void | Promise<void>;
  id: string;
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
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className={`inline-flex h-9 items-center rounded-sm px-3 text-body-sm font-medium ${cls}`}
      >
        {label}
      </button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-caption font-medium uppercase tracking-wide text-text-secondary">
        {label}
      </dt>
      <dd className="mt-1 whitespace-pre-line text-body text-text-primary">
        {children}
      </dd>
    </div>
  );
}

export default async function ContractDetailPage({
  params,
}: {
  params: Promise<{ contractId: string }>;
}) {
  const user = await requireUser();
  const { contractId } = await params;

  const contract = await getContract(user, contractId);
  if (!contract) notFound();

  const canManage = canManageContracts(user.role);
  const editable = isContractEditable(user.role, contract.status);
  const canEditMilestoneStatus =
    canManage && ["approved", "signed", "completed"].includes(contract.status);
  const balance = milestonesBalance(contract.milestones, contract.value);
  const milestoneKey = contract.milestones
    .map((m) => `${m.id}:${m.paymentStatus}:${m.invoiceStatus}`)
    .join("|");

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/contracts"
          className="text-body-sm text-text-secondary hover:underline"
        >
          ← Contracts
        </Link>
        <div className="mt-1 flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-h1 font-bold text-text-primary">
                {contract.contractNo}
              </h1>
              <ContractStatusBadge status={contract.status} />
              <span className="text-body-sm text-text-secondary">
                v{contract.version}
              </span>
              {contract.archived && (
                <span className="rounded-sm bg-neutral px-2 py-0.5 text-caption font-medium text-white">
                  Archived
                </span>
              )}
            </div>
            <p className="mt-1 text-body-sm text-text-secondary">
              {contract.title ?? "Contract"} · {contract.project.name} ·{" "}
              {contract.client.name} · from{" "}
              <Link
                href={`/projects/${contract.projectId}/quotations/${contract.quotationId}`}
                className="text-primary-600 hover:underline"
              >
                {contract.quotation.quotationNo}
              </Link>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/contracts/${contract.id}/print`}
              target="_blank"
              className="inline-flex h-9 items-center rounded-sm border border-border bg-surface px-3 text-body-sm font-medium text-text-primary hover:bg-primary-100"
            >
              PDF
            </Link>

            {contract.archived && canManage ? (
              <WorkflowButton action={restoreContractAction} id={contract.id} label="Restore" />
            ) : (
              <>
                {editable && (
                  <Link
                    href={`/contracts/${contract.id}/edit`}
                    className="inline-flex h-9 items-center rounded-sm border border-border bg-surface px-3 text-body-sm font-medium text-text-primary hover:bg-primary-100"
                  >
                    Edit
                  </Link>
                )}
                {editable && balance.balanced && (
                  <WorkflowButton action={submitContractAction} id={contract.id} label="Submit for approval" variant="primary" />
                )}
                {canManage && contract.status === "pending_approval" && (
                  <>
                    <WorkflowButton action={approveContractAction} id={contract.id} label="Approve" variant="primary" />
                    <WorkflowButton action={reopenContractAction} id={contract.id} label="Reopen" />
                  </>
                )}
                {canManage && contract.status === "approved" && (
                  <>
                    <WorkflowButton action={signContractAction} id={contract.id} label="Mark signed" variant="primary" />
                    <WorkflowButton action={reopenContractAction} id={contract.id} label="Reopen" />
                  </>
                )}
                {canManage && contract.status === "signed" && (
                  <WorkflowButton action={completeContractAction} id={contract.id} label="Mark completed" variant="primary" />
                )}
                {canManage &&
                  ["approved", "signed"].includes(contract.status) && (
                    <WorkflowButton action={createVersionAction} id={contract.id} label="New version" />
                  )}
                {canManage &&
                  !["cancelled", "completed"].includes(contract.status) && (
                    <WorkflowButton action={cancelContractAction} id={contract.id} label="Cancel" variant="danger" />
                  )}
                {canManage && (
                  <WorkflowButton action={archiveContractAction} id={contract.id} label="Archive" variant="danger" />
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {editable && !balance.balanced && (
        <div className="rounded-sm border border-l-4 border-warning bg-surface px-3 py-2 text-body-sm text-warning">
          Milestone amounts are {balance.delta > 0 ? "over" : "under"} the
          contract total by {formatMoney(Math.abs(balance.delta), true)}. Balance
          them to submit for approval.
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-md border border-border bg-surface p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-h3 font-semibold text-text-primary">Contract</h2>
              <span className="font-mono text-body font-semibold text-text-primary">
                {formatMoney(contract.value)}
              </span>
            </div>
            <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field label="Project">
                {contract.project.name} ({contract.project.code})
              </Field>
              <Field label="Client">{contract.client.name}</Field>
              <Field label="Start date">{contract.startDate ?? "—"}</Field>
              <Field label="End date">{contract.endDate ?? "—"}</Field>
              <div className="sm:col-span-2">
                <Field label="Scope">{contract.scope ?? "—"}</Field>
              </div>
              <div className="sm:col-span-2">
                <Field label="Payment terms">{contract.paymentTerms ?? "—"}</Field>
              </div>
              <div className="sm:col-span-2">
                <Field label="Warranty">{contract.warranty ?? "—"}</Field>
              </div>
              <div className="sm:col-span-2">
                <Field label="Notes">{contract.notes ?? "—"}</Field>
              </div>
            </dl>
          </section>

          <MilestonesPanel
            key={milestoneKey}
            contractId={contract.id}
            contractValue={contract.value}
            milestones={contract.milestones}
            editable={editable}
            canEditStatus={canEditMilestoneStatus}
          />

          <CommentsPanel
            contractId={contract.id}
            comments={contract.comments}
            canManage={canManage}
          />
        </div>

        <div className="space-y-6">
          <ContractTimeline contract={contract} />
          <AttachmentsPanel
            contractId={contract.id}
            files={contract.files}
            canManage={canManage}
          />
          {contract.versions.length > 0 && (
            <section className="rounded-md border border-border bg-surface p-6">
              <h2 className="mb-4 text-h3 font-semibold text-text-primary">
                Version history
              </h2>
              <ul className="space-y-3">
                {contract.versions.map((v) => (
                  <li key={v.id} className="text-body-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-text-primary">
                        Version {v.version}
                      </span>
                      <span className="text-caption text-text-secondary">
                        {new Date(v.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {v.note && (
                      <div className="text-caption text-text-secondary">
                        {v.note}
                        {v.createdByName ? ` · ${v.createdByName}` : ""}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
