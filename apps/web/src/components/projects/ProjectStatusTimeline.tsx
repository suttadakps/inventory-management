"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import {
  addStatusHistoryAction,
  updateStatusHistoryAction,
  deleteStatusHistoryAction,
} from "@/lib/projects/actions";
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

const inputCls =
  "h-10 rounded-md border border-[#e2ddd0] bg-white px-3 text-body-sm text-text-primary focus:border-primary-600 focus:outline-none";

function statusLabel(status: string) {
  return (
    STATUS_TH[status as keyof typeof STATUS_TH] ?? {
      label: status,
      tone: "gray" as StatusTone,
    }
  );
}

function TimelineRow({
  entry,
  projectId,
  canEdit,
}: {
  entry: StatusHistoryItem;
  projectId: string;
  canEdit: boolean;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);
  const [status, setStatus] = useState(entry.status);
  const [date, setDate] = useState(entry.date.slice(0, 10));

  const editable = canEdit && entry.id !== null;

  const save = () => {
    const value = status.trim();
    if (!value || !entry.id) return;
    startTransition(async () => {
      const res = await updateStatusHistoryAction(projectId, entry.id!, {
        status: value,
        date,
      });
      if (res.ok) {
        setEditing(false);
        router.refresh();
      }
    });
  };

  const remove = () => {
    if (!entry.id) return;
    startTransition(async () => {
      await deleteStatusHistoryAction(projectId, entry.id!);
      router.refresh();
    });
  };

  if (editing) {
    return (
      <li className="flex flex-wrap items-center gap-2">
        <input
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          list={STATUS_SUGGESTIONS_ID}
          className={`${inputCls} min-w-32 flex-1`}
        />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className={inputCls}
        />
        <button
          type="button"
          onClick={save}
          className="inline-flex h-10 items-center rounded-md bg-primary-700 px-4 text-body-sm font-medium text-white hover:bg-primary-600"
        >
          บันทึก
        </button>
        <button
          type="button"
          onClick={() => {
            setStatus(entry.status);
            setDate(entry.date.slice(0, 10));
            setEditing(false);
          }}
          className="inline-flex h-10 items-center rounded-md border border-[#e2ddd0] bg-white px-3 text-body-sm text-text-primary hover:bg-[#faf8f3]"
        >
          ยกเลิก
        </button>
      </li>
    );
  }

  const t = statusLabel(entry.status);
  return (
    <li className="flex items-start justify-between gap-3">
      <div className="flex gap-3">
        <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary-700" />
        <div>
          <div className="font-medium text-text-primary">{t.label}</div>
          <div className="text-caption text-text-secondary">
            {dateFmt.format(new Date(entry.date))}
          </div>
        </div>
      </div>
      {editable && (
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="text-caption text-primary-600 hover:underline"
          >
            แก้ไข
          </button>
          <button
            type="button"
            onClick={remove}
            aria-label="ลบไทม์ไลน์"
            className="text-text-secondary hover:text-danger"
          >
            ×
          </button>
        </div>
      )}
    </li>
  );
}

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
        {history.map((h, idx) => (
          <TimelineRow
            key={h.id ?? idx}
            entry={h}
            projectId={projectId}
            canEdit={canEdit}
          />
        ))}
      </ul>
    </div>
  );
}
