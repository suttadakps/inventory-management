import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { requireUser } from "@/lib/auth/session";
import { getQuotation } from "@/lib/quotation/repository";
import { formatMoney } from "@/lib/format";
import { PrintButton } from "@/components/boq/PrintButton";

export const metadata: Metadata = { title: "Quotation — Print · ARTIVERGES NEXT" };

export default async function QuotationPrintPage({
  params,
}: {
  params: Promise<{ quotationId: string }>;
}) {
  const user = await requireUser();
  const { quotationId } = await params;

  const q = await getQuotation(user, quotationId);
  if (!q) notFound();

  return (
    <div className="mx-auto max-w-4xl bg-surface p-2 text-text-primary">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-h1 font-bold">QUOTATION</h1>
          <p className="text-body-sm text-text-secondary">ARTIVERGES GROUP</p>
        </div>
        <div className="text-right">
          <div className="font-mono text-body font-semibold">{q.quotationNo}</div>
          <div className="text-body-sm text-text-secondary">
            Rev v{q.version} · {q.status}
          </div>
          <PrintButton />
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 text-body-sm">
        <div>
          <div className="text-caption uppercase text-text-secondary">To</div>
          <div className="font-medium">{q.client.name}</div>
          {q.client.email && <div>{q.client.email}</div>}
        </div>
        <div className="text-right">
          <div>
            <span className="text-text-secondary">Project: </span>
            {q.project.name} ({q.project.code})
          </div>
          {q.boq && (
            <div>
              <span className="text-text-secondary">BOQ version: </span>v
              {q.boq.version}
            </div>
          )}
          <div>
            <span className="text-text-secondary">Issued: </span>
            {q.issueDate ?? "—"}
          </div>
          <div>
            <span className="text-text-secondary">Valid until: </span>
            {q.expiryDate ?? "—"}
          </div>
        </div>
      </div>

      <table className="mb-4 w-full border-collapse text-body-sm">
        <thead>
          <tr className="border-b-2 border-text-primary text-left">
            <th className="py-2 pr-2">Description</th>
            <th className="py-2 pr-2">Unit</th>
            <th className="py-2 pr-2 text-right">Qty</th>
            <th className="py-2 pr-2 text-right">Unit price</th>
            <th className="py-2 pr-2 text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          {q.items.map((i) => (
            <tr key={i.id} className="border-b border-border">
              <td className="py-1.5 pr-2">{i.description}</td>
              <td className="py-1.5 pr-2">{i.unit ?? ""}</td>
              <td className="py-1.5 pr-2 text-right font-mono">{i.quantity}</td>
              <td className="py-1.5 pr-2 text-right font-mono">{formatMoney(i.unitPrice)}</td>
              <td className="py-1.5 pr-2 text-right font-mono">{formatMoney(i.lineTotal)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mb-6 flex justify-end">
        <table className="text-body-sm">
          <tbody>
            <tr>
              <td className="py-1 pr-6 text-text-secondary">Subtotal</td>
              <td className="py-1 text-right font-mono">{formatMoney(q.subtotal)}</td>
            </tr>
            <tr>
              <td className="py-1 pr-6 text-text-secondary">Discount</td>
              <td className="py-1 text-right font-mono">− {formatMoney(q.discountAmount)}</td>
            </tr>
            <tr>
              <td className="py-1 pr-6 text-text-secondary">VAT ({q.taxPct}%)</td>
              <td className="py-1 text-right font-mono">{formatMoney(q.taxAmount)}</td>
            </tr>
            <tr className="border-t border-text-primary font-semibold">
              <td className="py-1 pr-6">Grand Total</td>
              <td className="py-1 text-right font-mono">{formatMoney(q.total)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="space-y-3 text-body-sm">
        <Term label="Payment terms" value={q.paymentTerms} />
        <Term label="Warranty" value={q.warranty} />
        <Term label="Scope" value={q.scope} />
        <Term label="Excluded items" value={q.excludedItems} />
        <Term label="Notes" value={q.notes} />
      </div>

      <div className="mt-10 grid grid-cols-2 gap-10 text-body-sm">
        <Signature role="For ARTIVERGES GROUP" />
        <Signature role="Client acceptance" />
      </div>
    </div>
  );
}

function Term({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div>
      <span className="font-semibold">{label}: </span>
      <span className="whitespace-pre-line">{value}</span>
    </div>
  );
}

function Signature({ role }: { role: string }) {
  return (
    <div>
      <div className="h-14" />
      <div className="border-t border-text-primary pt-1 text-caption text-text-secondary">
        {role} — name, signature &amp; date
      </div>
    </div>
  );
}
