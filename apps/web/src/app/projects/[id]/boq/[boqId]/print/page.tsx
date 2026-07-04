import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { requireUser } from "@/lib/auth/session";
import { getBoqTree } from "@/lib/boq/repository";
import { computeItem } from "@/lib/boq/calc";
import { formatMoney, formatPct } from "@/lib/format";
import { PrintButton } from "@/components/boq/PrintButton";

export const metadata: Metadata = { title: "BOQ — Print · ARTIVERGES NEXT" };

export default async function BoqPrintPage({
  params,
}: {
  params: Promise<{ boqId: string }>;
}) {
  const user = await requireUser();
  const { boqId } = await params;

  const tree = await getBoqTree(user, boqId);
  if (!tree) notFound();

  const t = tree.totals;

  return (
    <div className="mx-auto max-w-4xl bg-surface p-2 text-text-primary">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h1 className="text-h1 font-bold">ARTIVERGES NEXT — Bill of Quantities</h1>
          <p className="text-body-sm text-text-secondary">
            {tree.project.name} ({tree.project.code}) · {tree.project.clientName}
          </p>
          <p className="text-body-sm text-text-secondary">
            {tree.title ?? `BOQ v${tree.version}`} · v{tree.version} ·{" "}
            {tree.status}
          </p>
        </div>
        <PrintButton />
      </div>

      <table className="mb-6 w-full border-collapse text-body-sm">
        <tbody>
          <tr>
            <SumCell label="Material" value={formatMoney(t.materialTotal)} />
            <SumCell label="Labor" value={formatMoney(t.laborTotal)} />
            <SumCell label="Equipment" value={formatMoney(t.equipmentTotal)} />
          </tr>
          <tr>
            <SumCell label="Cost Total" value={formatMoney(t.costTotal)} />
            <SumCell label="Selling Total" value={formatMoney(t.sellingTotal)} />
            <SumCell
              label="Gross Profit / Margin"
              value={`${formatMoney(t.grossProfit)} · ${formatPct(t.marginPct)}`}
            />
          </tr>
        </tbody>
      </table>

      {tree.sections.map((section) => (
        <div key={section.id} className="mb-6">
          <h2 className="mb-1 border-b border-text-primary pb-1 text-h3 font-bold">
            {section.name}
          </h2>
          {section.categories.map((category) => (
            <div key={category.id} className="mb-3">
              <h3 className="mt-2 text-body font-semibold">{category.name}</h3>
              <table className="w-full border-collapse text-caption">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="py-1 pr-2">Code</th>
                    <th className="py-1 pr-2">Description</th>
                    <th className="py-1 pr-2">Unit</th>
                    <th className="py-1 pr-2 text-right">Qty</th>
                    <th className="py-1 pr-2 text-right">Unit cost</th>
                    <th className="py-1 pr-2 text-right">Line cost</th>
                    <th className="py-1 pr-2 text-right">Line sell</th>
                    <th className="py-1 pr-2 text-right">Margin</th>
                  </tr>
                </thead>
                <tbody>
                  {category.items.map((item) => {
                    const c = computeItem(item);
                    return (
                      <tr key={item.id} className="border-b border-border">
                        <td className="py-1 pr-2 font-mono">{item.itemCode ?? ""}</td>
                        <td className="py-1 pr-2">{item.description}</td>
                        <td className="py-1 pr-2">{item.unit ?? ""}</td>
                        <td className="py-1 pr-2 text-right font-mono">{item.quantity}</td>
                        <td className="py-1 pr-2 text-right font-mono">{formatMoney(c.unitCost)}</td>
                        <td className="py-1 pr-2 text-right font-mono">{formatMoney(c.lineCost)}</td>
                        <td className="py-1 pr-2 text-right font-mono">{formatMoney(c.lineSelling)}</td>
                        <td className="py-1 pr-2 text-right font-mono">{formatPct(c.marginPct)}</td>
                      </tr>
                    );
                  })}
                  {category.items.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-1 text-text-secondary">
                        No items.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function SumCell({ label, value }: { label: string; value: string }) {
  return (
    <td className="border border-border p-2">
      <div className="text-caption uppercase text-text-secondary">{label}</div>
      <div className="font-mono font-semibold">{value}</div>
    </td>
  );
}
