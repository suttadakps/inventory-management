import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { requireUser } from "@/lib/auth/session";
import { getContract } from "@/lib/contract/repository";
import { formatMoney } from "@/lib/format";
import { PrintButton } from "@/components/boq/PrintButton";

export const metadata: Metadata = { title: "Contract — Print · ARTIVERGES NEXT" };

export default async function ContractPrintPage({
  params,
}: {
  params: Promise<{ contractId: string }>;
}) {
  const user = await requireUser();
  const { contractId } = await params;

  const c = await getContract(user, contractId);
  if (!c) notFound();

  return (
    <div className="mx-auto max-w-4xl bg-surface p-2 text-text-primary">
      {/* Company letterhead */}
      <div className="mb-6 flex items-start justify-between border-b-2 border-primary-700 pb-4">
        <div>
          <div className="text-h1 font-bold text-primary-700">
            ARTIVERGES <span className="text-accent-600">GROUP</span>
          </div>
          <p className="text-caption text-text-secondary">
            Construction · Renovation · Interior Turnkey
          </p>
        </div>
        <div className="text-right">
          <div className="text-h3 font-bold">CONTRACT</div>
          <div className="font-mono text-body-sm">{c.contractNo}</div>
          <div className="text-caption text-text-secondary">
            v{c.version} · {c.status}
          </div>
          <PrintButton />
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 text-body-sm">
        <div>
          <div className="text-caption uppercase text-text-secondary">Client</div>
          <div className="font-medium">{c.client.name}</div>
          {c.client.email && <div>{c.client.email}</div>}
        </div>
        <div className="text-right">
          <div>
            <span className="text-text-secondary">Project: </span>
            {c.project.name} ({c.project.code})
          </div>
          <div>
            <span className="text-text-secondary">Quotation: </span>
            {c.quotation.quotationNo}
          </div>
          <div>
            <span className="text-text-secondary">Start: </span>
            {c.startDate ?? "—"}
          </div>
          <div>
            <span className="text-text-secondary">End: </span>
            {c.endDate ?? "—"}
          </div>
        </div>
      </div>

      <div className="mb-6">
        <div className="text-caption uppercase text-text-secondary">
          Contract value
        </div>
        <div className="font-mono text-h2 font-bold">{formatMoney(c.value)}</div>
      </div>

      <h2 className="mb-2 border-b border-text-primary pb-1 text-h3 font-bold">
        Milestone payment schedule
      </h2>
      <table className="mb-6 w-full border-collapse text-body-sm">
        <thead>
          <tr className="border-b border-border text-left">
            <th className="py-1 pr-2">Milestone</th>
            <th className="py-1 pr-2 text-right">%</th>
            <th className="py-1 pr-2 text-right">Amount</th>
            <th className="py-1 pr-2">Due date</th>
            <th className="py-1 pr-2">Payment</th>
          </tr>
        </thead>
        <tbody>
          {c.milestones.map((m) => (
            <tr key={m.id} className="border-b border-border">
              <td className="py-1.5 pr-2">{m.title}</td>
              <td className="py-1.5 pr-2 text-right font-mono">{m.percentage}</td>
              <td className="py-1.5 pr-2 text-right font-mono">{formatMoney(m.amount)}</td>
              <td className="py-1.5 pr-2">{m.dueDate ?? "—"}</td>
              <td className="py-1.5 pr-2 capitalize">{m.paymentStatus}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="space-y-3 text-body-sm">
        <Term label="Scope" value={c.scope} />
        <Term label="Payment terms" value={c.paymentTerms} />
        <Term label="Warranty" value={c.warranty} />
        <Term label="Notes" value={c.notes} />
      </div>

      <div className="mt-12 grid grid-cols-2 gap-10 text-body-sm">
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
      <div className="h-16" />
      <div className="border-t border-text-primary pt-1 text-caption text-text-secondary">
        {role} — name, signature &amp; date
      </div>
    </div>
  );
}
