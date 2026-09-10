"use client";

import { useState } from "react";
import Link from "next/link";

import { WageActions } from "@/components/wages/WageActions";
import { StatusBadge, type StatusTone } from "@/components/ui/StatusBadge";
import { formatBaht } from "@/lib/format";
import type { WageRow } from "@/lib/wages/repository";

const dateFmt = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

const STATUS_TH: Record<string, { label: string; tone: StatusTone }> = {
  unpaid: { label: "ค้างจ่าย", tone: "amber" },
  paid: { label: "จ่ายแล้ว", tone: "green" },
  cancelled: { label: "ยกเลิก", tone: "gray" },
  overpaid: { label: "จ่ายเกิน", tone: "red" },
};

export function WageWorkerGroup({
  workerName,
  rows,
  canManage,
  canIssueWht,
  projects,
}: {
  workerName: string;
  rows: WageRow[];
  canManage: boolean;
  canIssueWht: boolean;
  projects: { id: string; name: string }[];
}) {
  const [open, setOpen] = useState(false);

  const roleLabel = rows.find((r) => r.roleLabel)?.roleLabel ?? null;
  // Cancelled and overpaid rows stay listed underneath but are left out of
  // the summary row's wage figures.
  const counted = rows.filter(
    (r) => r.status !== "cancelled" && r.status !== "overpaid"
  );
  const cancelledCount = rows.filter((r) => r.status === "cancelled").length;
  const overpaidAmount = rows
    .filter((r) => r.status === "overpaid")
    .reduce((s, r) => s + r.amount, 0);
  const totalDays = counted.reduce((s, r) => s + r.daysWorked, 0);
  const totalAmount = counted.reduce((s, r) => s + r.amount, 0);
  const paidCount = counted.filter((r) => r.status === "paid").length;

  const projectNames = Array.from(
    new Set(rows.map((r) => r.projectName ?? "—"))
  );
  const projectLabel =
    projectNames.length === 1
      ? (projectNames[0] ?? "—")
      : `หลายโปรเจค (${projectNames.length})`;

  const aggStatus =
    counted.length === 0
      ? overpaidAmount > 0
        ? { label: "จ่ายเกิน", tone: "red" as StatusTone }
        : { label: "ยกเลิกทั้งหมด", tone: "gray" as StatusTone }
      : paidCount === counted.length
        ? { label: "จ่ายแล้ว", tone: "green" as StatusTone }
        : paidCount === 0
          ? { label: "ค้างจ่าย", tone: "amber" as StatusTone }
          : {
              label: `จ่ายแล้ว ${paidCount}/${counted.length}`,
              tone: "navy" as StatusTone,
            };

  return (
    <>
      <tr
        className="cursor-pointer hover:bg-[#faf8f3]"
        onClick={() => setOpen((v) => !v)}
      >
        <td className="px-6 py-4 align-top">
          <div className="flex items-center gap-1.5 font-semibold text-text-primary">
            <span className={`inline-block transition-transform ${open ? "rotate-90" : ""}`}>
              ›
            </span>
            {workerName}
            {rows.length > 1 && (
              <span className="text-caption font-normal text-text-secondary">
                ({rows.length} รายการ
                {cancelledCount > 0 ? `, ยกเลิก ${cancelledCount}` : ""})
              </span>
            )}
          </div>
          {roleLabel && (
            <div className="ml-4 text-caption text-text-secondary">{roleLabel}</div>
          )}
          {overpaidAmount > 0 && (
            <div className="ml-4 text-caption text-danger">
              จ่ายเกิน {formatBaht(overpaidAmount, true)} — หักคืนเดือนถัดไป
            </div>
          )}
        </td>
        <td className="px-6 py-4 align-top text-text-secondary">{projectLabel}</td>
        <td className="px-6 py-4 text-right align-top tabular-nums text-text-primary">
          {totalDays || "—"}
        </td>
        <td className="px-6 py-4 text-right align-top font-semibold tabular-nums text-text-primary">
          {formatBaht(totalAmount, true)}
        </td>
        <td className="px-6 py-4 align-top text-text-secondary">
          {rows.length === 1 && rows[0]?.date
            ? dateFmt.format(new Date(rows[0].date as string))
            : "—"}
        </td>
        <td className="px-6 py-4 align-top">
          <StatusBadge tone={aggStatus.tone}>{aggStatus.label}</StatusBadge>
        </td>
        {canManage && <td className="px-6 py-4 align-top" />}
      </tr>

      {open &&
        rows.map((w) => {
          const st = STATUS_TH[w.status] ?? {
            label: w.status,
            tone: "gray" as StatusTone,
          };
          return (
            <tr key={w.id} className="bg-[#faf8f3]/60 hover:bg-[#faf8f3]">
              <td className="px-6 py-3 pl-12 align-top text-text-secondary">
                รายการย่อย
              </td>
              <td className="px-6 py-3 align-top text-text-secondary">
                {w.projectName ?? "—"}
              </td>
              <td className="px-6 py-3 text-right align-top tabular-nums text-text-secondary">
                {w.daysWorked || "—"}
              </td>
              <td className="px-6 py-3 text-right align-top tabular-nums text-text-primary">
                {formatBaht(w.amount, true)}
              </td>
              <td className="px-6 py-3 align-top text-text-secondary">
                {w.date ? dateFmt.format(new Date(w.date)) : "—"}
              </td>
              <td className="px-6 py-3 align-top">
                <StatusBadge tone={st.tone}>{st.label}</StatusBadge>
              </td>
              {canManage && (
                <td className="px-6 py-3 align-top">
                  <div className="flex items-center justify-end gap-3">
                    {canIssueWht && (
                      <Link
                        href={`/wht/new?source=wage&id=${w.id}`}
                        className="text-body-sm text-primary-600 hover:underline"
                      >
                        ใบทวิ 50
                      </Link>
                    )}
                    <WageActions
                      id={w.id}
                      status={w.status}
                      amount={w.amount}
                      projectId={w.projectId}
                      projects={projects}
                    />
                  </div>
                </td>
              )}
            </tr>
          );
        })}
    </>
  );
}
