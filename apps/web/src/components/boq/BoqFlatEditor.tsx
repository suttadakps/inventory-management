"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import type { BoqFlatDoc, BoqFlatLine } from "@/lib/boq/repository";
import {
  addBoqLineAction,
  updateBoqLineAction,
  deleteBoqLineAction,
  updateBoqHeaderAction,
} from "@/lib/boq/actions";
import { formatBaht } from "@/lib/format";

const VAT_RATE = 0.07;
const WHT_RATE = 0.03;
const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

const cellInput =
  "w-full rounded-md border border-[#e2ddd0] bg-[#f6f3ec] px-3 py-2 text-body-sm text-text-primary focus:border-primary-600 focus:bg-white focus:outline-none";

export function BoqFlatEditor({
  doc,
  editable,
  printHref,
}: {
  doc: BoqFlatDoc;
  editable: boolean;
  printHref: string;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const [title, setTitle] = useState(doc.title ?? "");
  const [proposer, setProposer] = useState(doc.proposerName ?? "");
  const [vat, setVat] = useState(doc.vatEnabled);
  const [wht, setWht] = useState(doc.whtEnabled);
  const [rows, setRows] = useState<BoqFlatLine[]>(doc.lines);

  const subtotal = round2(
    rows.reduce((s, r) => s + r.quantity * r.unitPrice, 0)
  );
  const vatAmount = vat ? round2(subtotal * VAT_RATE) : 0;
  const whtAmount = wht ? round2(subtotal * WHT_RATE) : 0;
  const grandTotal = round2(subtotal + vatAmount - whtAmount);

  const patchRow = (id: string, patch: Partial<BoqFlatLine>) =>
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  const saveLine = (id: string, patch: Parameters<typeof updateBoqLineAction>[1]) =>
    startTransition(() => {
      void updateBoqLineAction(id, patch);
    });

  const saveHeader = (patch: Parameters<typeof updateBoqHeaderAction>[1]) =>
    startTransition(() => {
      void updateBoqHeaderAction(doc.id, patch);
    });

  const addRow = () =>
    startTransition(async () => {
      await addBoqLineAction(doc.id);
      router.refresh();
    });

  const removeRow = (id: string) => {
    setRows((rs) => rs.filter((r) => r.id !== id));
    startTransition(async () => {
      await deleteBoqLineAction(id);
      router.refresh();
    });
  };

  return (
    <div className="space-y-5">
      {/* Top bar: project name + export */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <input
          value={title}
          disabled={!editable}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={() => saveHeader({ title: title.trim() })}
          placeholder="ชื่อโปรเจค"
          className="h-11 w-full max-w-md rounded-md border border-[#e2ddd0] bg-white px-3 text-body font-medium text-text-primary focus:border-primary-600 focus:outline-none"
        />
        <Link
          href={printHref}
          target="_blank"
          className="inline-flex h-10 items-center justify-center rounded-md bg-primary-700 px-4 text-body-sm font-medium text-white transition-colors hover:bg-primary-600"
        >
          Export PDF
        </Link>
      </div>

      {/* Line-item table */}
      <div className="overflow-x-auto rounded-lg border border-[#ece7db] bg-white shadow-1">
        <table className="w-full min-w-[900px] text-left text-body-sm">
          <thead className="border-b border-[#f0ece2] text-caption font-medium uppercase tracking-wide text-text-secondary">
            <tr>
              <th className="px-4 py-3 w-40">Section</th>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3 w-28">Size</th>
              <th className="px-4 py-3 w-24">Qty</th>
              <th className="px-4 py-3 w-24">Unit</th>
              <th className="px-4 py-3 w-32">Unit Price</th>
              <th className="px-4 py-3 w-32 text-right">Total</th>
              {editable && <th className="px-2 py-3 w-8" />}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f0ece2]">
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={editable ? 8 : 7}
                  className="px-4 py-8 text-center text-text-secondary"
                >
                  ยังไม่มีรายการ — กด “+ เพิ่มรายการ” เพื่อเริ่ม
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-2">
                    <input
                      value={r.sectionLabel}
                      disabled={!editable}
                      onChange={(e) =>
                        patchRow(r.id, { sectionLabel: e.target.value })
                      }
                      onBlur={() =>
                        saveLine(r.id, { sectionLabel: r.sectionLabel })
                      }
                      className={cellInput}
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      value={r.description}
                      disabled={!editable}
                      onChange={(e) =>
                        patchRow(r.id, { description: e.target.value })
                      }
                      onBlur={() =>
                        saveLine(r.id, { description: r.description })
                      }
                      className={cellInput}
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      value={r.size}
                      disabled={!editable}
                      onChange={(e) => patchRow(r.id, { size: e.target.value })}
                      onBlur={() => saveLine(r.id, { size: r.size })}
                      className={cellInput}
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      inputMode="decimal"
                      value={r.quantity}
                      disabled={!editable}
                      onChange={(e) =>
                        patchRow(r.id, {
                          quantity: Number(e.target.value) || 0,
                        })
                      }
                      onBlur={() => saveLine(r.id, { quantity: r.quantity })}
                      className={cellInput}
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      value={r.unit}
                      disabled={!editable}
                      onChange={(e) => patchRow(r.id, { unit: e.target.value })}
                      onBlur={() => saveLine(r.id, { unit: r.unit })}
                      className={cellInput}
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      inputMode="decimal"
                      value={r.unitPrice}
                      disabled={!editable}
                      onChange={(e) =>
                        patchRow(r.id, {
                          unitPrice: Number(e.target.value) || 0,
                        })
                      }
                      onBlur={() => saveLine(r.id, { unitPrice: r.unitPrice })}
                      className={cellInput}
                    />
                  </td>
                  <td className="px-4 py-2 text-right font-semibold tabular-nums text-text-primary">
                    {formatBaht(round2(r.quantity * r.unitPrice), true)}
                  </td>
                  {editable && (
                    <td className="px-2 py-2 text-center">
                      <button
                        type="button"
                        onClick={() => removeRow(r.id)}
                        aria-label="ลบรายการ"
                        className="text-text-secondary hover:text-danger"
                      >
                        ×
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {editable && (
        <button
          type="button"
          onClick={addRow}
          className="inline-flex h-10 items-center justify-center rounded-md border border-[#e2ddd0] bg-white px-4 text-body-sm font-medium text-text-primary transition-colors hover:bg-[#faf8f3]"
        >
          + เพิ่มรายการ
        </button>
      )}

      {/* Summary + proposer */}
      <div className="flex flex-col gap-4 lg:flex-row lg:justify-end">
        <div className="w-full max-w-sm rounded-lg border border-[#ece7db] bg-white p-5 shadow-1">
          <label className="flex items-center justify-between py-1.5 text-body-sm text-text-primary">
            คิด VAT 7%
            <input
              type="checkbox"
              checked={vat}
              disabled={!editable}
              onChange={(e) => {
                setVat(e.target.checked);
                saveHeader({ vatEnabled: e.target.checked });
              }}
              className="h-4 w-4 rounded border-border text-primary-700"
            />
          </label>
          <label className="flex items-center justify-between py-1.5 text-body-sm text-text-primary">
            หัก WHT 3%
            <input
              type="checkbox"
              checked={wht}
              disabled={!editable}
              onChange={(e) => {
                setWht(e.target.checked);
                saveHeader({ whtEnabled: e.target.checked });
              }}
              className="h-4 w-4 rounded border-border text-primary-700"
            />
          </label>

          <div className="mt-3 space-y-1.5 border-t border-[#f0ece2] pt-3">
            <div className="flex justify-between text-body-sm text-text-secondary">
              <span>Subtotal</span>
              <span className="tabular-nums text-text-primary">
                {formatBaht(subtotal, true)}
              </span>
            </div>
            {vat && (
              <div className="flex justify-between text-body-sm text-text-secondary">
                <span>VAT 7%</span>
                <span className="tabular-nums text-text-primary">
                  {formatBaht(vatAmount, true)}
                </span>
              </div>
            )}
            {wht && (
              <div className="flex justify-between text-body-sm text-text-secondary">
                <span>หัก WHT 3%</span>
                <span className="tabular-nums text-danger">
                  - {formatBaht(whtAmount, true)}
                </span>
              </div>
            )}
            <div className="flex justify-between border-t border-[#f0ece2] pt-2 text-body font-bold text-text-primary">
              <span>Grand Total</span>
              <span className="tabular-nums">{formatBaht(grandTotal, true)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md">
        <label
          htmlFor="proposer"
          className="mb-1.5 block text-body-sm font-medium text-text-primary"
        >
          ผู้เสนอราคา
        </label>
        <input
          id="proposer"
          value={proposer}
          disabled={!editable}
          onChange={(e) => setProposer(e.target.value)}
          onBlur={() => saveHeader({ proposerName: proposer.trim() })}
          placeholder="ชื่อผู้เสนอราคา"
          className="h-11 w-full rounded-md border border-[#e2ddd0] bg-white px-3 text-body text-text-primary focus:border-primary-600 focus:outline-none"
        />
      </div>
    </div>
  );
}
