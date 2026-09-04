"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { commitExtractionAction } from "@/lib/estimation/actions";
import type { ExtractedLine } from "@/lib/estimation/shared";
import { formatBaht } from "@/lib/format";
import { DecimalInput } from "@/components/ui/DecimalInput";

const cellInput =
  "w-full rounded-md border border-[#e2ddd0] bg-[#f6f3ec] px-3 py-2 text-body-sm text-text-primary focus:border-primary-600 focus:bg-white focus:outline-none";

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

export function EstimationReview({
  projectId,
  extractionId,
  fileName,
  initialLines,
}: {
  projectId: string;
  extractionId: string;
  fileName: string;
  initialLines: ExtractedLine[];
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [rows, setRows] = useState<ExtractedLine[]>(initialLines);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const total = round2(rows.reduce((s, r) => s + r.quantity * r.unitPrice, 0));

  const patchRow = (idx: number, patch: Partial<ExtractedLine>) =>
    setRows((rs) => rs.map((r, i) => (i === idx ? { ...r, ...patch } : r)));

  const removeRow = (idx: number) =>
    setRows((rs) => rs.filter((_, i) => i !== idx));

  const addRow = () =>
    setRows((rs) => [
      ...rs,
      { sectionLabel: "", description: "", size: "", quantity: 1, unit: "", unitPrice: 0 },
    ]);

  const commit = () => {
    setError(null);
    setPending(true);
    startTransition(async () => {
      const res = await commitExtractionAction(projectId, extractionId, rows);
      setPending(false);
      if (res.ok) {
        router.push(`/projects/${projectId}/boq/${res.boqId}`);
      } else {
        setError(res.error);
      }
    });
  };

  return (
    <div className="space-y-4">
      <p className="text-body-sm text-text-secondary">
        ดึงจากไฟล์: <span className="font-medium text-text-primary">{fileName}</span> —
        ตรวจสอบ/แก้ไขรายการก่อนนำเข้าเป็น BOQ
      </p>

      <div className="overflow-x-auto rounded-lg border border-[#ece7db]">
        <table className="w-full min-w-[900px] text-left text-body-sm">
          <thead className="border-b border-[#f0ece2] text-caption font-medium uppercase tracking-wide text-text-secondary">
            <tr>
              <th className="px-3 py-2">หมวด</th>
              <th className="px-3 py-2">รายการ</th>
              <th className="px-3 py-2">ขนาด</th>
              <th className="px-3 py-2 text-right">จำนวน</th>
              <th className="px-3 py-2">หน่วย</th>
              <th className="px-3 py-2 text-right">ราคาต่อหน่วย</th>
              <th className="px-3 py-2 text-right">รวม</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f0ece2] bg-white">
            {rows.map((r, idx) => (
              <tr key={idx}>
                <td className="p-1.5 align-top">
                  <input
                    value={r.sectionLabel}
                    onChange={(e) => patchRow(idx, { sectionLabel: e.target.value })}
                    className={cellInput}
                  />
                </td>
                <td className="p-1.5 align-top">
                  <input
                    value={r.description}
                    onChange={(e) => patchRow(idx, { description: e.target.value })}
                    className={cellInput}
                  />
                </td>
                <td className="p-1.5 align-top">
                  <input
                    value={r.size}
                    onChange={(e) => patchRow(idx, { size: e.target.value })}
                    className={cellInput}
                  />
                </td>
                <td className="p-1.5 align-top">
                  <DecimalInput
                    value={r.quantity}
                    onCommit={(quantity) => patchRow(idx, { quantity })}
                    className={`${cellInput} text-right`}
                  />
                </td>
                <td className="p-1.5 align-top">
                  <input
                    value={r.unit}
                    onChange={(e) => patchRow(idx, { unit: e.target.value })}
                    className={cellInput}
                  />
                </td>
                <td className="p-1.5 align-top">
                  <DecimalInput
                    value={r.unitPrice}
                    onCommit={(unitPrice) => patchRow(idx, { unitPrice })}
                    className={`${cellInput} text-right`}
                  />
                </td>
                <td className="p-1.5 text-right align-top tabular-nums text-text-primary">
                  {formatBaht(round2(r.quantity * r.unitPrice), true)}
                </td>
                <td className="p-1.5 text-right align-top">
                  <button
                    type="button"
                    onClick={() => removeRow(idx)}
                    aria-label="ลบรายการ"
                    className="text-text-secondary hover:text-danger"
                  >
                    ×
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={addRow}
          className="inline-flex h-9 items-center rounded-md border border-[#e2ddd0] bg-white px-3 text-body-sm font-medium text-text-primary hover:bg-[#faf8f3]"
        >
          + เพิ่มรายการ
        </button>
        <div className="text-body font-bold text-text-primary">
          รวม {formatBaht(total, true)}
        </div>
      </div>

      {error && <p className="text-caption text-danger">{error}</p>}

      <button
        type="button"
        onClick={commit}
        disabled={pending}
        className="inline-flex h-10 items-center rounded-md bg-primary-700 px-4 text-body-sm font-medium text-white hover:bg-primary-600 disabled:opacity-50"
      >
        {pending ? "กำลังนำเข้า…" : "นำเข้าเป็น BOQ"}
      </button>
    </div>
  );
}
