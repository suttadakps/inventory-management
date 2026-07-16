"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import {
  addProjectTriggerAction,
  deleteProjectTriggerAction,
} from "@/lib/projects/actions";
import type { ProjectTriggerItem } from "@/lib/projects/repository";
import { StatusBadge } from "@/components/ui/StatusBadge";

const dateTimeFmt = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "Asia/Bangkok",
});

const todayStr = () => new Date().toISOString().slice(0, 10);

export function ProjectTriggers({
  projectId,
  triggers,
  canEdit,
}: {
  projectId: string;
  triggers: ProjectTriggerItem[];
  canEdit: boolean;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const [date, setDate] = useState(todayStr());
  const [time, setTime] = useState("09:00");
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    const body = message.trim();
    if (!body) {
      setError("กรุณากรอกข้อความแจ้งเตือน");
      return;
    }
    setError(null);
    startTransition(async () => {
      const res = await addProjectTriggerAction(projectId, {
        message: body,
        date,
        time,
      });
      if (res.ok) {
        setMessage("");
        setDate(todayStr());
        setTime("09:00");
        router.refresh();
      } else {
        setError(res.error);
      }
    });
  };

  const remove = (triggerId: string) =>
    startTransition(async () => {
      await deleteProjectTriggerAction(projectId, triggerId);
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
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="ข้อความแจ้งเตือน…"
              className={`${inputCls} min-w-40 flex-1`}
            />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={inputCls}
            />
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className={inputCls}
            />
            <button
              type="button"
              onClick={submit}
              className="inline-flex h-10 items-center rounded-md bg-primary-700 px-4 text-body-sm font-medium text-white hover:bg-primary-600"
            >
              เพิ่มแจ้งเตือน
            </button>
          </div>
          {error && <p className="text-caption text-danger">{error}</p>}
        </div>
      )}

      {triggers.length === 0 ? (
        <p className="text-body-sm text-text-secondary">ยังไม่มีการแจ้งเตือน</p>
      ) : (
        <ul className="divide-y divide-[#f0ece2]">
          {triggers.map((t) => (
            <li
              key={t.id}
              className="flex items-center justify-between gap-3 py-2.5"
            >
              <div className="min-w-0">
                <span className="text-body-sm text-text-primary">
                  {t.message}
                </span>
                <span className="ml-2 text-caption text-text-secondary">
                  {dateTimeFmt.format(new Date(t.triggerAt))}
                </span>
                <StatusBadge
                  tone={t.sentAt ? "green" : "tan"}
                  className="ml-2"
                >
                  {t.sentAt ? "ส่งแล้ว" : "รอส่ง"}
                </StatusBadge>
              </div>
              {canEdit && (
                <button
                  type="button"
                  onClick={() => remove(t.id)}
                  aria-label="ลบการแจ้งเตือน"
                  className="shrink-0 text-text-secondary hover:text-danger"
                >
                  ×
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
