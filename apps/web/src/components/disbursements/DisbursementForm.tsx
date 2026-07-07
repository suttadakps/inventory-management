"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { submitDisbursementAction } from "@/lib/disbursements/actions";
import { ContentCard } from "@/components/ui/ContentCard";

type ProjectOption = { id: string; name: string };

const inputCls =
  "h-11 rounded-md border border-[#e2ddd0] bg-white px-3 text-body-sm text-text-primary focus:border-primary-600 focus:outline-none";

export function DisbursementForm({
  projects,
  defaultName,
}: {
  projects: ProjectOption[];
  defaultName: string;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [name, setName] = useState(defaultName);
  const [projectId, setProjectId] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    if (!name.trim()) return setError("กรุณากรอกชื่อผู้เบิก");
    const amt = Number(amount);
    if (!(amt > 0)) return setError("กรุณากรอกจำนวนเงิน");
    setError(null);
    startTransition(async () => {
      const res = await submitDisbursementAction({
        requesterName: name.trim(),
        projectId: projectId || undefined,
        amount: amt,
        neededDate: date || undefined,
        reason: reason.trim() || undefined,
      });
      if (res.ok) {
        setAmount("");
        setDate("");
        setReason("");
        router.refresh();
      } else {
        setError(res.error);
      }
    });
  };

  return (
    <ContentCard className="p-6">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="ชื่อผู้เบิก"
          className={inputCls}
        />
        <select
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
          className={inputCls}
        >
          <option value="">— เลือกโปรเจค (ไม่บังคับ) —</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <input
          type="number"
          min={0}
          step="0.01"
          inputMode="decimal"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="จำนวนเงิน (บาท)"
          className={inputCls}
        />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className={inputCls}
        />
        <input
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="เหตุผลในการเบิก"
          className={`${inputCls} sm:col-span-2`}
        />
      </div>

      {error && <p className="mt-2 text-caption text-danger">{error}</p>}

      <button
        type="button"
        onClick={submit}
        className="mt-4 h-11 w-full rounded-md bg-primary-700 text-body-sm font-medium text-white transition-colors hover:bg-primary-600"
      >
        ยื่นคำขอเบิกเงิน
      </button>
    </ContentCard>
  );
}
