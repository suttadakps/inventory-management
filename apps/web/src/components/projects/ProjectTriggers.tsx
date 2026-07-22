"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import {
  addProjectTriggerAction,
  deleteProjectTriggerAction,
  toggleTriggerDoneAction,
  getProjectTriggersAction,
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
const POLL_MS = 10_000;

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
  const [items, setItems] = useState(triggers);
  const [message, setMessage] = useState("");
  const [date, setDate] = useState(todayStr());
  const [time, setTime] = useState("09:00");
  const [error, setError] = useState<string | null>(null);

  // Keep in sync when the server-rendered props change (e.g. after
  // router.refresh() from an add/delete below).
  useEffect(() => setItems(triggers), [triggers]);

  // Poll so a "Done" tap in LINE shows up here without a manual refresh.
  const itemsRef = useRef(items);
  itemsRef.current = items;
  useEffect(() => {
    const interval = setInterval(async () => {
      const latest = await getProjectTriggersAction(projectId);
      const changed =
        latest.length !== itemsRef.current.length ||
        latest.some(
          (l, i) =>
            l.id !== itemsRef.current[i]?.id ||
            l.doneAt !== itemsRef.current[i]?.doneAt ||
            l.sentAt !== itemsRef.current[i]?.sentAt
        );
      if (changed) setItems(latest);
    }, POLL_MS);
    return () => clearInterval(interval);
  }, [projectId]);

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

  const toggleDone = (triggerId: string, done: boolean) => {
    // Optimistic update so the checkbox feels instant.
    setItems((prev) =>
      prev.map((t) =>
        t.id === triggerId
          ? { ...t, doneAt: done ? new Date().toISOString() : null }
          : t
      )
    );
    startTransition(async () => {
      await toggleTriggerDoneAction(projectId, triggerId, done);
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

      {items.length === 0 ? (
        <p className="text-body-sm text-text-secondary">ยังไม่มีการแจ้งเตือน</p>
      ) : (
        <ul className="divide-y divide-[#f0ece2]">
          {items.map((t) => {
            const done = t.doneAt !== null;
            return (
              <li
                key={t.id}
                className="flex items-center justify-between gap-3 py-2.5"
              >
                <div className="flex min-w-0 items-start gap-2.5">
                  <input
                    type="checkbox"
                    checked={done}
                    disabled={!canEdit}
                    onChange={(e) => toggleDone(t.id, e.target.checked)}
                    className="mt-1 h-4 w-4 shrink-0 accent-primary-700"
                  />
                  <div className="min-w-0">
                    <span
                      className={
                        done
                          ? "text-body-sm text-text-secondary line-through"
                          : "text-body-sm text-text-primary"
                      }
                    >
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
            );
          })}
        </ul>
      )}
    </div>
  );
}
