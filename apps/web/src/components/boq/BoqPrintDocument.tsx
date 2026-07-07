import Image from "next/image";

import type { BoqFlatDoc } from "@/lib/boq/repository";
import { formatBaht } from "@/lib/format";
import { PrintButton } from "@/components/boq/PrintButton";

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

const DEFAULT_SCHEDULE = [
  { label: "งวดที่ 1", percent: 30 },
  { label: "งวดที่ 2", percent: 40 },
  { label: "งวดที่ 3", percent: 20 },
  { label: "งวดที่ 4", percent: 10 },
];

/** Printable BOQ / quotation document (works for project-bound or standalone). */
export function BoqPrintDocument({ doc }: { doc: BoqFlatDoc }) {
  const today = new Date().toLocaleDateString("en-GB");
  const projectName = doc.title || doc.project?.name || "—";
  const schedule = doc.milestones.length > 0 ? doc.milestones : DEFAULT_SCHEDULE;

  return (
    <div className="mx-auto max-w-3xl bg-white p-6 text-text-primary print:p-0">
      <div className="mb-5 flex items-start justify-between">
        <div>
          <Image
            src="/artiverges-next-logo.png"
            alt="ARTIVERGES NEXT"
            width={180}
            height={42}
            priority
            style={{ height: "auto", width: "170px" }}
          />
          <p className="mt-1 text-caption uppercase tracking-wide text-text-secondary">
            Contractor &amp; Interior Ops
          </p>
        </div>
        <PrintButton />
      </div>

      <h1 className="mb-3 text-h3 font-bold">ใบเสนอราคา / Bill of Quantities</h1>

      <div className="mb-4 grid grid-cols-2 gap-x-8 gap-y-1 text-body-sm">
        <div>
          <span className="text-text-secondary">Project: </span>
          {projectName}
        </div>
        <div>
          <span className="text-text-secondary">Date: </span>
          {today}
        </div>
        <div>
          <span className="text-text-secondary">Site: </span>
          {doc.project?.name ?? "—"}
        </div>
        <div>
          <span className="text-text-secondary">Client: </span>
          {doc.project?.clientName ?? "—"}
        </div>
      </div>

      <table className="w-full border-collapse text-body-sm">
        <thead>
          <tr className="border-y border-neutral/40 text-left text-caption uppercase text-text-secondary">
            <th className="py-2 pr-2">Section</th>
            <th className="py-2 pr-2">No.</th>
            <th className="py-2 pr-2">Description</th>
            <th className="py-2 pr-2 text-right">Qty</th>
            <th className="py-2 pr-2">Unit</th>
            <th className="py-2 pr-2 text-right">Unit Price</th>
            <th className="py-2 text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          {doc.lines.map((l, idx) => (
            <tr key={l.id} className="border-b border-neutral/15 align-top">
              <td className="py-1.5 pr-2">{l.sectionLabel || "—"}</td>
              <td className="py-1.5 pr-2">{idx + 1}</td>
              <td className="py-1.5 pr-2">
                {l.description || "—"}
                {l.size ? (
                  <span className="text-text-secondary"> ({l.size})</span>
                ) : null}
              </td>
              <td className="py-1.5 pr-2 text-right tabular-nums">
                {l.quantity}
              </td>
              <td className="py-1.5 pr-2">{l.unit || "—"}</td>
              <td className="py-1.5 pr-2 text-right tabular-nums">
                {formatBaht(l.unitPrice, true)}
              </td>
              <td className="py-1.5 text-right tabular-nums">
                {formatBaht(round2(l.quantity * l.unitPrice), true)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 flex justify-end">
        <div className="w-72 space-y-1 text-body-sm">
          <div className="flex justify-between">
            <span className="text-text-secondary">Subtotal</span>
            <span className="tabular-nums">{formatBaht(doc.subtotal, true)}</span>
          </div>
          {doc.vatEnabled && (
            <div className="flex justify-between">
              <span className="text-text-secondary">VAT 7%</span>
              <span className="tabular-nums">{formatBaht(doc.vat, true)}</span>
            </div>
          )}
          {doc.whtEnabled && (
            <div className="flex justify-between">
              <span className="text-text-secondary">หัก ณ ที่จ่าย 3%</span>
              <span className="tabular-nums">- {formatBaht(doc.wht, true)}</span>
            </div>
          )}
          <div className="flex justify-between border-t border-neutral/40 pt-1 text-body font-bold">
            <span>Grand Total</span>
            <span className="tabular-nums">
              {formatBaht(doc.grandTotal, true)}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <div className="mb-1 text-body-sm font-semibold">งวดการชำระเงิน</div>
        <table className="w-full max-w-sm text-body-sm">
          <tbody>
            {schedule.map((s, i) => (
              <tr key={i}>
                <td className="py-0.5 text-text-secondary">
                  {s.label} ({s.percent}%)
                </td>
                <td className="py-0.5 text-right tabular-nums">
                  {formatBaht(round2((doc.grandTotal * s.percent) / 100), true)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {doc.terms && doc.terms.trim() !== "" && (
        <div className="mt-6">
          <div className="mb-1 text-body-sm font-semibold">เงื่อนไขเพิ่มเติม</div>
          <p className="whitespace-pre-line text-body-sm text-text-secondary">
            {doc.terms}
          </p>
        </div>
      )}

      <div className="mt-12 grid grid-cols-2 gap-8 text-center text-body-sm">
        <div>
          <div className="mb-1 border-t border-neutral/50 pt-2">ผู้เสนอราคา</div>
          <div className="text-text-secondary">{doc.proposerName || ""}</div>
        </div>
        <div>
          <div className="mb-1 border-t border-neutral/50 pt-2">ผู้ว่าจ้าง</div>
          <div className="text-text-secondary">
            {doc.project?.clientName ?? ""}
          </div>
        </div>
      </div>
    </div>
  );
}
