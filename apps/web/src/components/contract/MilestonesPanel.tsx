"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import type { MilestoneDto } from "@/lib/contract/repository";
import {
  addMilestoneAction,
  updateMilestoneAction,
  updateMilestoneStatusAction,
  deleteMilestoneAction,
  type ContractResult,
} from "@/lib/contract/actions";
import { milestonesBalance } from "@/lib/contract/calc";
import { formatMoney } from "@/lib/format";
import { Button } from "@/components/ui/Button";

const PAYMENT = ["unpaid", "partial", "paid"];
const INVOICE = ["not_invoiced", "invoiced", "paid"];
const INVOICE_LABEL: Record<string, string> = {
  not_invoiced: "Not invoiced",
  invoiced: "Invoiced",
  paid: "Paid",
};

export function MilestonesPanel({
  contractId,
  contractValue,
  milestones,
  editable,
  canEditStatus,
}: {
  contractId: string;
  contractValue: number;
  milestones: MilestoneDto[];
  editable: boolean;
  canEditStatus: boolean;
}) {
  const router = useRouter();
  const [rows, setRows] = useState<MilestoneDto[]>(milestones);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const balance = useMemo(
    () => milestonesBalance(rows, contractValue),
    [rows, contractValue]
  );

  function run(fn: () => Promise<ContractResult>) {
    setError(null);
    startTransition(async () => {
      const res = await fn();
      if (!res.ok) setError(res.error);
      else router.refresh();
    });
  }

  function patch(id: string, p: Partial<MilestoneDto>) {
    setRows((prev) => prev.map((m) => (m.id === id ? { ...m, ...p } : m)));
  }

  async function saveRow(m: MilestoneDto) {
    setError(null);
    const res = await updateMilestoneAction(m.id, {
      title: m.title,
      percentage: m.percentage,
      amount: m.amount,
      dueDate: m.dueDate,
    });
    if (!res.ok) setError(res.error);
  }

  return (
    <section className="rounded-md border border-border bg-surface">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3">
        <h2 className="text-h3 font-semibold text-text-primary">
          Milestone payment schedule
        </h2>
        <div className="flex items-center gap-3 text-body-sm">
          <span className="text-text-secondary">
            Scheduled{" "}
            <span className="font-mono text-text-primary">
              {formatMoney(balance.total, true)}
            </span>{" "}
            / {formatMoney(contractValue, true)}
          </span>
          <span
            className={
              balance.balanced
                ? "font-medium text-success"
                : "font-medium text-danger"
            }
          >
            {balance.balanced
              ? "Balanced"
              : `${balance.delta > 0 ? "Over" : "Short"} ${formatMoney(
                  Math.abs(balance.delta),
                  true
                )}`}
          </span>
        </div>
      </div>

      {error && (
        <div className="border-b border-border px-4 py-2 text-body-sm text-danger">
          {error}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-body-sm">
          <thead className="bg-bg text-caption uppercase tracking-wide text-text-secondary">
            <tr>
              <th className="px-3 py-2 font-medium">Milestone</th>
              <th className="px-3 py-2 text-right font-medium">%</th>
              <th className="px-3 py-2 text-right font-medium">Amount</th>
              <th className="px-3 py-2 font-medium">Due date</th>
              <th className="px-3 py-2 font-medium">Payment</th>
              <th className="px-3 py-2 font-medium">Invoice</th>
              {editable && <th className="px-3 py-2" />}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="px-3 py-4 text-text-secondary">
                  No milestones yet.
                </td>
              </tr>
            )}
            {rows.map((m) => (
              <tr key={m.id} className="align-top">
                <td className="px-3 py-2">
                  <input
                    disabled={!editable}
                    value={m.title}
                    onChange={(e) => patch(m.id, { title: e.target.value })}
                    onBlur={() => editable && saveRow(m)}
                    className="w-48 rounded-sm border border-border bg-surface px-2 py-1 disabled:opacity-70"
                  />
                </td>
                <td className="px-3 py-2 text-right">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step="0.001"
                    disabled={!editable}
                    value={m.percentage}
                    onChange={(e) =>
                      patch(m.id, { percentage: e.target.valueAsNumber || 0 })
                    }
                    onBlur={() => editable && saveRow(m)}
                    className="w-20 rounded-sm border border-border bg-surface px-2 py-1 text-right font-mono disabled:opacity-70"
                  />
                </td>
                <td className="px-3 py-2 text-right">
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    disabled={!editable}
                    value={m.amount}
                    onChange={(e) =>
                      patch(m.id, { amount: e.target.valueAsNumber || 0 })
                    }
                    onBlur={() => editable && saveRow(m)}
                    className="w-28 rounded-sm border border-border bg-surface px-2 py-1 text-right font-mono disabled:opacity-70"
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="date"
                    disabled={!editable}
                    value={m.dueDate ?? ""}
                    onChange={(e) => patch(m.id, { dueDate: e.target.value || null })}
                    onBlur={() => editable && saveRow(m)}
                    className="rounded-sm border border-border bg-surface px-2 py-1 disabled:opacity-70"
                  />
                </td>
                <td className="px-3 py-2">
                  <select
                    disabled={!canEditStatus}
                    value={m.paymentStatus}
                    onChange={(e) => {
                      patch(m.id, { paymentStatus: e.target.value });
                      run(() =>
                        updateMilestoneStatusAction(m.id, {
                          paymentStatus: e.target.value,
                        })
                      );
                    }}
                    className="rounded-sm border border-border bg-surface px-2 py-1 capitalize disabled:opacity-70"
                  >
                    {PAYMENT.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-3 py-2">
                  <select
                    disabled={!canEditStatus}
                    value={m.invoiceStatus}
                    onChange={(e) => {
                      patch(m.id, { invoiceStatus: e.target.value });
                      run(() =>
                        updateMilestoneStatusAction(m.id, {
                          invoiceStatus: e.target.value,
                        })
                      );
                    }}
                    className="rounded-sm border border-border bg-surface px-2 py-1 disabled:opacity-70"
                  >
                    {INVOICE.map((s) => (
                      <option key={s} value={s}>
                        {INVOICE_LABEL[s]}
                      </option>
                    ))}
                  </select>
                </td>
                {editable && (
                  <td className="px-3 py-2 text-right">
                    <button
                      type="button"
                      title="Delete milestone"
                      onClick={() => {
                        if (window.confirm("Delete this milestone?"))
                          run(() => deleteMilestoneAction(m.id));
                      }}
                      className="rounded-sm px-2 py-1 text-caption text-danger hover:bg-primary-100"
                    >
                      ✕
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editable && (
        <div className="border-t border-border px-4 py-3">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => run(() => addMilestoneAction(contractId))}
          >
            + Add milestone
          </Button>
        </div>
      )}
    </section>
  );
}
