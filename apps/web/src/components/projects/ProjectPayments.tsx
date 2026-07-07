"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import {
  addPaymentAction,
  deletePaymentAction,
} from "@/lib/projects/actions";
import type { ProjectPaymentItem } from "@/lib/projects/repository";
import { formatBaht } from "@/lib/format";

const dateFmt = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

const METHOD_TH: Record<string, string> = {
  cash: "เงินสด",
  bank_transfer: "โอนเงิน",
  cheque: "เช็ค",
  card: "บัตร",
  upi: "UPI",
  other: "อื่นๆ",
};

const todayStr = () => new Date().toISOString().slice(0, 10);

export function ProjectPayments({
  projectId,
  payments,
  canEdit,
}: {
  projectId: string;
  payments: ProjectPaymentItem[];
  canEdit: boolean;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(todayStr());
  const [method, setMethod] = useState("bank_transfer");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  const total = payments.reduce((s, p) => s + p.amount, 0);

  const submit = () => {
    const amt = Number(amount);
    if (!(amt > 0)) {
      setError("กรุณากรอกจำนวนเงิน");
      return;
    }
    setError(null);
    startTransition(async () => {
      const res = await addPaymentAction(projectId, {
        amount: amt,
        method,
        date,
        note,
      });
      if (res.ok) {
        setAmount("");
        setNote("");
        setDate(todayStr());
        router.refresh();
      } else {
        setError(res.error);
      }
    });
  };

  const remove = (paymentId: string) =>
    startTransition(async () => {
      await deletePaymentAction(projectId, paymentId);
      router.refresh();
    });

  const inputCls =
    "h-10 rounded-md border border-[#e2ddd0] bg-white px-3 text-body-sm text-text-primary focus:border-primary-600 focus:outline-none";

  return (
    <div className="space-y-4">
      {canEdit && (
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            <input
              type="number"
              min={0}
              step="0.01"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="จำนวนเงิน (฿)"
              className={`${inputCls} w-36`}
            />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={inputCls}
            />
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className={inputCls}
            >
              {Object.entries(METHOD_TH).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="หมายเหตุ (เช่น งวดที่ 1)"
              className={`${inputCls} min-w-40 flex-1`}
            />
            <button
              type="button"
              onClick={submit}
              className="inline-flex h-10 items-center rounded-md bg-primary-700 px-4 text-body-sm font-medium text-white hover:bg-primary-600"
            >
              บันทึกรับเงิน
            </button>
          </div>
          {error && <p className="text-caption text-danger">{error}</p>}
        </div>
      )}

      {payments.length === 0 ? (
        <p className="text-body-sm text-text-secondary">ยังไม่มีการรับเงิน</p>
      ) : (
        <>
          <ul className="divide-y divide-[#f0ece2]">
            {payments.map((p) => (
              <li
                key={p.id}
                className="flex items-center justify-between gap-3 py-2.5"
              >
                <div className="min-w-0">
                  <span className="font-semibold tabular-nums text-text-primary">
                    {formatBaht(p.amount, true)}
                  </span>
                  <span className="ml-2 text-caption text-text-secondary">
                    {dateFmt.format(new Date(p.date))}
                    {p.method ? ` · ${METHOD_TH[p.method] ?? p.method}` : ""}
                    {p.note ? ` · ${p.note}` : ""}
                  </span>
                </div>
                {canEdit && (
                  <button
                    type="button"
                    onClick={() => remove(p.id)}
                    aria-label="ลบรายการรับเงิน"
                    className="shrink-0 text-text-secondary hover:text-danger"
                  >
                    ×
                  </button>
                )}
              </li>
            ))}
          </ul>
          <div className="flex justify-between border-t border-[#f0ece2] pt-3 text-body-sm">
            <span className="font-medium text-text-secondary">รวมรับแล้ว</span>
            <span className="font-bold tabular-nums text-success">
              {formatBaht(total, true)}
            </span>
          </div>
        </>
      )}
    </div>
  );
}
