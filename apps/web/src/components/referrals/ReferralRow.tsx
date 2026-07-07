"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import {
  updateReferralStatusAction,
  updateReferralNoteAction,
  deleteReferralAction,
} from "@/lib/referrals/actions";
import type { ReferralRow as Row } from "@/lib/referrals/repository";
import { formatBaht } from "@/lib/format";

const dateFmt = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "new", label: "ใหม่" },
  { value: "contacted", label: "ติดต่อกลับแล้ว" },
  { value: "in_progress", label: "กำลังดำเนินการ" },
  { value: "won", label: "ปิดการขาย" },
  { value: "lost", label: "ไม่สำเร็จ" },
];

const SOURCE_TH: Record<string, string> = {
  website: "เว็บไซต์",
  manual: "เพิ่มเอง",
};

export function ReferralRow({ row }: { row: Row }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [status, setStatus] = useState(row.status as string);
  const [note, setNote] = useState(row.adminNote ?? "");

  const saveStatus = (val: string) => {
    setStatus(val);
    startTransition(async () => {
      await updateReferralStatusAction(row.id, val);
      router.refresh();
    });
  };

  const saveNote = () =>
    startTransition(async () => {
      await updateReferralNoteAction(row.id, note);
    });

  const remove = () =>
    startTransition(async () => {
      await deleteReferralAction(row.id);
      router.refresh();
    });

  const selectCls =
    "h-9 rounded-md border border-[#e2ddd0] bg-white px-2 text-body-sm text-text-primary focus:border-primary-600 focus:outline-none";

  return (
    <tr className="align-top hover:bg-[#faf8f3]">
      <td className="px-6 py-4">
        <div className="font-semibold text-text-primary">{row.referrerName}</div>
        {row.referrerContact && (
          <div className="text-caption text-text-secondary">
            {row.referrerContact}
          </div>
        )}
        <div className="mt-0.5 text-caption text-text-secondary">
          {SOURCE_TH[row.source] ?? row.source} ·{" "}
          {dateFmt.format(new Date(row.createdAt))}
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="font-medium text-text-primary">{row.projectTitle}</div>
        {row.prospectName && (
          <div className="text-caption text-text-secondary">
            ลูกค้า: {row.prospectName}
          </div>
        )}
        {row.details && (
          <div className="text-caption text-text-secondary">{row.details}</div>
        )}
      </td>
      <td className="px-6 py-4 text-right tabular-nums text-text-primary">
        {row.budget !== null ? formatBaht(row.budget, true) : "—"}
      </td>
      <td className="px-6 py-4">
        <select
          value={status}
          onChange={(e) => saveStatus(e.target.value)}
          className={selectCls}
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </td>
      <td className="px-6 py-4">
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          onBlur={saveNote}
          placeholder="บันทึกการติดต่อ…"
          className="h-9 w-full min-w-40 rounded-md border border-[#e2ddd0] bg-white px-2.5 text-body-sm text-text-primary focus:border-primary-600 focus:outline-none"
        />
      </td>
      <td className="px-6 py-4 text-right">
        <button
          type="button"
          onClick={remove}
          aria-label="ลบ"
          className="text-text-secondary hover:text-danger"
        >
          ×
        </button>
      </td>
    </tr>
  );
}
