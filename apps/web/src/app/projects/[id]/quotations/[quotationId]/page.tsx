import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { requireUser } from "@/lib/auth/session";
import {
  canManageQuotation,
  isQuotationEditable,
} from "@/lib/quotation/permissions";
import { getQuotation } from "@/lib/quotation/repository";
import {
  sendQuotationAction,
  markViewedAction,
  approveQuotationAction,
  rejectQuotationAction,
  expireQuotationAction,
  reopenQuotationAction,
  duplicateQuotationAction,
  archiveQuotationAction,
} from "@/lib/quotation/actions";
import { QuotationStatusBadge } from "@/components/quotation/QuotationStatusBadge";
import { EmailButton } from "@/components/quotation/EmailButton";
import { formatMoney } from "@/lib/format";

export const metadata: Metadata = { title: "Quotation · ARTIVERGES NEXT" };

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

export default async function QuotationDetailPage({
  params,
}: {
  params: Promise<{ id: string; quotationId: string }>;
}) {
  const user = await requireUser();
  const { id: projectId, quotationId } = await params;

  const q = await getQuotation(user, quotationId);
  if (!q) notFound();

  const canManage = canManageQuotation(user.role);
  const editable = isQuotationEditable(user.role, q.status);
  const base = `/projects/${projectId}/quotations/${quotationId}`;

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/projects/${projectId}/quotations`}
          className="text-body-sm text-text-secondary hover:underline"
        >
          ← Quotations
        </Link>
        <div className="mt-1 flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-h1 font-bold text-text-primary">
                {q.quotationNo}
              </h1>
              <QuotationStatusBadge status={q.status} expired={q.expired} />
              <span className="text-body-sm text-text-secondary">
                v{q.version}
              </span>
            </div>
            <p className="mt-1 text-body-sm text-text-secondary">
              {q.title ?? "Quotation"} · {q.project.name} · {q.client.name}
              {q.boq ? ` · BOQ v${q.boq.version}` : ""}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`${base}/print`}
              target="_blank"
              className="inline-flex h-9 items-center rounded-sm border border-border bg-surface px-3 text-body-sm font-medium text-text-primary hover:bg-primary-100"
            >
              PDF
            </Link>
            {canManage && (
              <EmailButton
                to={q.client.email}
                quotationNo={q.quotationNo}
                total={formatMoney(q.total)}
                path={base}
              />
            )}
            {editable && (
              <Link
                href={`${base}/edit`}
                className="inline-flex h-9 items-center rounded-sm border border-border bg-surface px-3 text-body-sm font-medium text-text-primary hover:bg-primary-100"
              >
                Edit
              </Link>
            )}
            {editable && (
              <WorkflowButton action={sendQuotationAction} id={q.id} label="Send" variant="primary" />
            )}
            {canManage && q.status === "sent" && (
              <WorkflowButton action={markViewedAction} id={q.id} label="Mark viewed" />
            )}
            {canManage && (q.status === "sent" || q.status === "viewed") && (
              <>
                <WorkflowButton action={approveQuotationAction} id={q.id} label="Approve" variant="primary" />
                <WorkflowButton action={rejectQuotationAction} id={q.id} label="Reject" variant="danger" />
                <WorkflowButton action={expireQuotationAction} id={q.id} label="Expire" />
              </>
            )}
            {canManage &&
              ["sent", "viewed", "rejected", "expired"].includes(q.status) && (
                <WorkflowButton action={reopenQuotationAction} id={q.id} label="Reopen" />
              )}
            {canManage && (
              <WorkflowButton action={duplicateQuotationAction} id={q.id} label="Duplicate" />
            )}
            {canManage && (
              <WorkflowButton action={archiveQuotationAction} id={q.id} label="Archive" variant="danger" />
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Line items + totals */}
        <div className="space-y-6 lg:col-span-2">
          <section className="overflow-hidden rounded-md border border-border bg-surface">
            <div className="border-b border-border px-4 py-3">
              <h2 className="text-h3 font-semibold text-text-primary">
                Line items
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-left text-body-sm">
                <thead className="bg-bg text-caption uppercase tracking-wide text-text-secondary">
                  <tr>
                    <th className="px-4 py-2 font-medium">Description</th>
                    <th className="px-4 py-2 font-medium">Unit</th>
                    <th className="px-4 py-2 text-right font-medium">Qty</th>
                    <th className="px-4 py-2 text-right font-medium">Unit price</th>
                    <th className="px-4 py-2 text-right font-medium">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {q.items.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-4 text-text-secondary">
                        No line items.
                      </td>
                    </tr>
                  )}
                  {q.items.map((i) => (
                    <tr key={i.id}>
                      <td className="px-4 py-2 text-text-primary">{i.description}</td>
                      <td className="px-4 py-2 text-text-secondary">{i.unit ?? "—"}</td>
                      <td className="px-4 py-2 text-right font-mono tabular-nums">{i.quantity}</td>
                      <td className="px-4 py-2 text-right font-mono tabular-nums">{formatMoney(i.unitPrice)}</td>
                      <td className="px-4 py-2 text-right font-mono tabular-nums">{formatMoney(i.lineTotal)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="border-t border-border">
                  <TotalRow label="Subtotal" value={formatMoney(q.subtotal)} />
                  <TotalRow label="Discount" value={`− ${formatMoney(q.discountAmount)}`} />
                  <TotalRow label={`VAT (${q.taxPct}%)`} value={formatMoney(q.taxAmount)} />
                  <tr className="font-semibold">
                    <td colSpan={4} className="px-4 py-2 text-right">Grand Total</td>
                    <td className="px-4 py-2 text-right font-mono tabular-nums">{formatMoney(q.total)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </section>

          {/* Digital signature placeholder */}
          <section className="rounded-md border border-border bg-surface p-6">
            <h2 className="mb-4 text-h3 font-semibold text-text-primary">
              Approval &amp; signature
            </h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <SignatureBox role="For ARTIVERGES GROUP" />
              <SignatureBox role="Client acceptance" />
            </div>
            <p className="mt-3 text-caption text-text-secondary">
              Digital signature capture is a future enhancement; this section is a
              placeholder for printed sign-off.
            </p>
          </section>
        </div>

        {/* Commercial details */}
        <section className="space-y-6">
          <div className="rounded-md border border-border bg-surface p-6">
            <h2 className="mb-4 text-h3 font-semibold text-text-primary">
              Details
            </h2>
            <dl className="space-y-4">
              <Field label="Issue date">{q.issueDate ?? "—"}</Field>
              <Field label="Expiration date">{q.expiryDate ?? "—"}</Field>
              <Field label="Payment terms">{q.paymentTerms ?? "—"}</Field>
              <Field label="Warranty">{q.warranty ?? "—"}</Field>
              <Field label="Scope">{q.scope ?? "—"}</Field>
              <Field label="Excluded items">{q.excludedItems ?? "—"}</Field>
              <Field label="Notes">{q.notes ?? "—"}</Field>
            </dl>
          </div>
        </section>
      </div>
    </div>
  );
}

function TotalRow({ label, value }: { label: string; value: string }) {
  return (
    <tr className="text-text-secondary">
      <td colSpan={4} className="px-4 py-1.5 text-right">{label}</td>
      <td className="px-4 py-1.5 text-right font-mono tabular-nums">{value}</td>
    </tr>
  );
}

function SignatureBox({ role }: { role: string }) {
  return (
    <div>
      <div className="h-16 rounded-sm border border-dashed border-border" />
      <div className="mt-2 border-t border-text-primary pt-1 text-caption text-text-secondary">
        {role} — name, signature &amp; date
      </div>
    </div>
  );
}
