"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import {
  markWagePaidAction,
  unmarkWagePaidAction,
  deleteWageAction,
} from "@/lib/wages/actions";

const todayStr = () => new Date().toISOString().slice(0, 10);

const inputCls =
  "h-8 rounded-md border border-[#e2ddd0] bg-white px-2 text-caption text-text-primary focus:border-primary-600 focus:outline-none";

export function WageActions({
  id,
  status,
  amount,
  projectId,
  projects,
}: {
  id: string;
  status: string;
  amount: number;
  projectId: string | null;
  projects: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [paidAt, setPaidAt] = useState(todayStr());
  const [paidAmount, setPaidAmount] = useState(String(amount));
  const [paidProjectId, setPaidProjectId] = useState(projectId ?? "");
  const [error, setError] = useState<string | null>(null);

  const run = (fn: () => Promise<unknown>) =>
    startTransition(async () => {
      await fn();
      router.refresh();
    });

  const confirmPaid = () => {
    const amt = Number(paidAmount);
    if (!(amt > 0)) {
      setError("กรุณากรอกจำนวนที่จ่าย");
      return;
    }
    setError(null);
    run(() =>
      markWagePaidAction(id, {
        paidAt,
        amount: amt,
        projectId: paidProjectId || null,
      })
    );
  };

  if (status === "unpaid") {
    return (
      <div className="space-y-1.5">
        <div className="flex flex-wrap items-center gap-1.5">
          <input
            type="date"
            value={paidAt}
            onChange={(e) => setPaidAt(e.target.value)}
            className={`${inputCls} w-32`}
          />
          <input
            type="number"
            min={0}
            step="0.01"
            value={paidAmount}
            onChange={(e) => setPaidAmount(e.target.value)}
            placeholder="จำนวนที่จ่าย"
            className={`${inputCls} w-24`}
          />
          <select
            value={paidProjectId}
            onChange={(e) => setPaidProjectId(e.target.value)}
            className={inputCls}
          >
            <option value="">— ไม่ระบุโปรเจค —</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            disabled={pending}
            onClick={confirmPaid}
            className="inline-flex h-8 items-center rounded-md bg-success px-2.5 text-caption font-medium text-white hover:brightness-95 disabled:opacity-60"
          >
            จ่ายแล้ว
          </button>
          <button
            type="button"
            disabled={pending}
            aria-label="ลบ"
            onClick={() => run(() => deleteWageAction(id))}
            className="text-text-secondary hover:text-danger disabled:opacity-50"
          >
            ×
          </button>
        </div>
        {error && <p className="text-caption text-danger">{error}</p>}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-end gap-2">
      <button
        type="button"
        disabled={pending}
        onClick={() => run(() => unmarkWagePaidAction(id))}
        className="inline-flex h-8 items-center rounded-md border border-[#e2ddd0] px-2.5 text-caption font-medium text-text-secondary hover:bg-[#faf8f3] disabled:opacity-60"
      >
        ยกเลิกจ่าย
      </button>
      <button
        type="button"
        disabled={pending}
        aria-label="ลบ"
        onClick={() => run(() => deleteWageAction(id))}
        className="text-text-secondary hover:text-danger disabled:opacity-50"
      >
        ×
      </button>
    </div>
  );
}
