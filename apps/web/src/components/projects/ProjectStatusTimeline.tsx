"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { addStatusHistoryAction } from "@/lib/projects/actions";
import type { StatusHistoryItem } from "@/lib/projects/repository";
import { STATUS_TH } from "@/lib/projects/statusLabels";
import type { StatusTone } from "@/components/ui/StatusBadge";

const dateFmt = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

const todayStr = () => new Date().toISOString().slice(0, 10);
const STATUS_KEYS = Object.keys(STATUS_TH) as (keyof typeof STATUS_TH)[];
const STATUS_SUGGESTIONS_ID = "project-status-suggestions";

export function ProjectStatusTimeline({
  projectId,
  history,
  canEdit,
}: {
  projectId: string;
  history: StatusHistoryItem[];
  canEdit: boolean;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [status, setStatus] = useState("");
  const [date, setDate] = useState(todayStr());
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    const value = status.trim();
    if (!value) {
      setError("กรุณากรอกสถานะ");
      return;
    }
    setError(null);
    startTransition(async () => {
      const res = await addStatusHistoryAction(projectId, {
        status: value,
        date,
      });
      if (res.ok) {
        setStatus("");
        setDate(todayStr());
        router.refresh();
      } else {
        setError(res.error);
      }
    });
  };

  const inputCls =
    "h-10 rounded-md border border-[#e2ddd0] bg-white px-3 text-body-sm text-text-primary focus:border-primary-600 focus:outline-none";

  return (
    <div className="space-y-4">
      {canEdit && (
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            <input
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              list={STATUS_SUGGESTIONS_ID}
              placeholder="สถานะ…"
              className={`${inputCls} min-w-32 flex-1`}
            />
            <datalist id={STATUS_SUGGESTIONS_ID}>
              {STATUS_KEYS.map((key) => (
                <option key={key} value={STATUS_TH[key].label} />
              ))}
            </datalist>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={inputCls}
            />
            <button
              type="button"
              onClick={submit}
              className="inline-flex h-10 items-center rounded-md bg-primary-700 px-4 text-body-sm font-medium text-white hover:bg-primary-600"
            >
              เพิ่มไทม์ไลน์
            </button>
          </div>
          {error && <p className="text-caption text-danger">{error}</p>}
        </div>
      )}

      <ul className="space-y-4">
        {history.map((h, idx) => {
          const t = STATUS_TH[h.status as keyof typeof STATUS_TH] ?? {
            label: h.status,
            tone: "gray" as StatusTone,
          };
          return (
            <li key={idx} className="flex gap-3">
              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary-700" />
              <div>
                <div className="font-medium text-text-primary">{t.label}</div>
                <div className="text-caption text-text-secondary">
                  {dateFmt.format(new Date(h.date))}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
