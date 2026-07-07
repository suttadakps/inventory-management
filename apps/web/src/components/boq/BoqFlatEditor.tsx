"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import type {
  BoqFlatDoc,
  BoqFlatLine,
  BoqMilestone,
} from "@/lib/boq/repository";
import {
  addBoqLineAction,
  updateBoqLineAction,
  deleteBoqLineAction,
  updateBoqHeaderAction,
} from "@/lib/boq/actions";
import { formatBaht } from "@/lib/format";
import { Textarea } from "@/components/ui/Textarea";

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
  const [terms, setTerms] = useState(doc.terms ?? "");
  const [milestones, setMilestones] = useState<BoqMilestone[]>(doc.milestones);

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

  const milestonePct = milestones.reduce((s, m) => s + (m.percent || 0), 0);

  // Milestones are auto-numbered "งวดที่ N"; the user only enters the percent.
  const saveMilestones = (next: BoqMilestone[]) => {
    const normalized = next.map((m, i) => ({
      label: `งวดที่ ${i + 1}`,
      percent: m.percent || 0,
    }));
    startTransition(() => {
      void updateBoqHeaderAction(doc.id, { milestones: normalized });
    });
  };

  const setMilestone = (idx: number, patch: Partial<BoqMilestone>) =>
    setMilestones((ms) =>
      ms.map((m, i) => (i === idx ? { ...m, ...patch } : m))
    );

  const addMilestone = () => {
    const next = [
      ...milestones,
      { label: `งวดที่ ${milestones.length + 1}`, percent: 0 },
    ];
    setMilestones(next);
    saveMilestones(next);
  };

  const removeMilestone = (idx: number) => {
    const next = milestones.filter((_, i) => i !== idx);
    setMilestones(next);
    saveMilestones(next);
  };

  const seedDefaultMilestones = () => {
    const next: BoqMilestone[] = [
      { label: "งวดที่ 1", percent: 30 },
      { label: "งวดที่ 2", percent: 40 },
      { label: "งวดที่ 3", percent: 20 },
      { label: "งวดที่ 4", percent: 10 },
    ];
    setMilestones(next);
    saveMilestones(next);
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

      {/* Left: payment milestones + conditions · Right: totals */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="space-y-4">
          {/* Payment milestones (งวดงาน) */}
          <div className="rounded-lg border border-[#ece7db] bg-white p-5 shadow-1">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-body font-semibold text-text-primary">
                งวดการชำระเงิน
              </h3>
              <span
                className={`text-caption tabular-nums ${
                  milestonePct === 100
                    ? "text-success"
                    : milestones.length
                      ? "text-accent-600"
                      : "text-text-secondary"
                }`}
              >
                รวม {milestonePct}%
              </span>
            </div>

            {milestones.length === 0 ? (
              <p className="text-caption text-text-secondary">
                ยังไม่มีงวดงาน
              </p>
            ) : (
              <div className="space-y-2">
                {milestones.map((m, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="w-16 shrink-0 text-body-sm text-text-primary">
                      งวดที่ {idx + 1}
                    </span>
                    <div className="flex items-center gap-1">
                      <input
                        inputMode="decimal"
                        value={m.percent}
                        disabled={!editable}
                        onChange={(e) =>
                          setMilestone(idx, {
                            percent: Number(e.target.value) || 0,
                          })
                        }
                        onBlur={() => saveMilestones(milestones)}
                        className="h-9 w-20 rounded-md border border-[#e2ddd0] bg-[#f6f3ec] px-2 text-right text-body-sm tabular-nums focus:border-primary-600 focus:bg-white focus:outline-none"
                      />
                      <span className="text-caption text-text-secondary">%</span>
                    </div>
                    <span className="flex-1 text-right text-body-sm tabular-nums text-text-primary">
                      {formatBaht(
                        round2((grandTotal * (m.percent || 0)) / 100),
                        true
                      )}
                    </span>
                    {editable && (
                      <button
                        type="button"
                        onClick={() => removeMilestone(idx)}
                        aria-label="ลบงวด"
                        className="shrink-0 text-text-secondary hover:text-danger"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {editable && (
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={addMilestone}
                  className="inline-flex h-9 items-center rounded-md border border-[#e2ddd0] bg-white px-3 text-body-sm font-medium text-text-primary hover:bg-[#faf8f3]"
                >
                  + เพิ่มงวด
                </button>
                {milestones.length === 0 && (
                  <button
                    type="button"
                    onClick={seedDefaultMilestones}
                    className="inline-flex h-9 items-center rounded-md px-3 text-body-sm font-medium text-primary-700 hover:underline"
                  >
                    ใช้ค่าเริ่มต้น 30/40/20/10
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Additional conditions (เงื่อนไขเพิ่มเติม) */}
          <div className="rounded-lg border border-[#ece7db] bg-white p-5 shadow-1">
            <label
              htmlFor="terms"
              className="mb-2 block text-body font-semibold text-text-primary"
            >
              เงื่อนไขเพิ่มเติม
            </label>
            <Textarea
              id="terms"
              value={terms}
              disabled={!editable}
              onChange={(e) => setTerms(e.target.value)}
              onBlur={() => saveHeader({ terms: terms.trim() })}
              rows={4}
              placeholder="เช่น ราคานี้ยืนราคา 30 วัน / รวมค่าขนส่ง / ไม่รวมงานรื้อถอน …"
            />
          </div>
        </div>

        <div className="w-full rounded-lg border border-[#ece7db] bg-white p-5 shadow-1 lg:max-w-sm lg:justify-self-end">
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
