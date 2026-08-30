"use client";

import { useEffect, useRef, useState, useTransition } from "react";

import {
  toggleAttendanceAction,
  sendCheckinRollCallAction,
  getAttendanceAction,
} from "@/lib/attendance/actions";
import type { WorkerItem } from "@/lib/workers/repository";

const POLL_MS = 10_000;

const todayStr = () => new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Bangkok" });

export function ProjectAttendance({
  projectId,
  workers,
  initialPresentIds,
  canEdit,
}: {
  projectId: string;
  workers: WorkerItem[];
  initialPresentIds: string[];
  canEdit: boolean;
}) {
  const [, startTransition] = useTransition();
  const [date, setDate] = useState(todayStr());
  const [presentIds, setPresentIds] = useState<Set<string>>(
    new Set(initialPresentIds)
  );
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  // Reload attendance whenever the selected date changes.
  const dateRef = useRef(date);
  dateRef.current = date;
  useEffect(() => {
    let cancelled = false;
    getAttendanceAction(projectId, date).then((rows) => {
      if (!cancelled) setPresentIds(new Set(rows.map((r) => r.workerId)));
    });
    return () => {
      cancelled = true;
    };
  }, [projectId, date]);

  // Poll so a tap in LINE shows up here without a manual refresh.
  useEffect(() => {
    const interval = setInterval(async () => {
      const rows = await getAttendanceAction(projectId, dateRef.current);
      setPresentIds(new Set(rows.map((r) => r.workerId)));
    }, POLL_MS);
    return () => clearInterval(interval);
  }, [projectId]);

  const toggle = (workerId: string) => {
    const willBePresent = !presentIds.has(workerId);
    setPresentIds((prev) => {
      const next = new Set(prev);
      if (willBePresent) next.add(workerId);
      else next.delete(workerId);
      return next;
    });
    startTransition(async () => {
      await toggleAttendanceAction(projectId, workerId, date);
    });
  };

  const sendRollCall = () => {
    setSending(true);
    setNotice(null);
    startTransition(async () => {
      const res = await sendCheckinRollCallAction(projectId, date);
      setSending(false);
      setNotice(res.ok ? "ส่งเช็คชื่อไปไลน์แล้ว" : res.error);
    });
  };

  const inputCls =
    "h-10 rounded-md border border-[#e2ddd0] bg-white px-3 text-body-sm text-text-primary focus:border-primary-600 focus:outline-none";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className={inputCls}
        />
        {canEdit && (
          <button
            type="button"
            onClick={sendRollCall}
            disabled={sending}
            className="inline-flex h-10 items-center rounded-md bg-primary-700 px-4 text-body-sm font-medium text-white hover:bg-primary-600 disabled:opacity-50"
          >
            {sending ? "กำลังส่ง…" : "ส่งเช็คชื่อไปไลน์"}
          </button>
        )}
        <span className="text-caption text-text-secondary">
          เข้าหน้างาน {presentIds.size} / {workers.length} คน
        </span>
      </div>
      {notice && <p className="text-caption text-text-secondary">{notice}</p>}

      {workers.length === 0 ? (
        <p className="text-body-sm text-text-secondary">ยังไม่มีรายชื่อคนงานในระบบ</p>
      ) : (
        <ul className="grid grid-cols-2 gap-x-4 gap-y-1.5 sm:grid-cols-3">
          {workers.map((w) => {
            const present = presentIds.has(w.id);
            return (
              <li key={w.id}>
                <label className="flex items-center gap-2 text-body-sm text-text-primary">
                  <input
                    type="checkbox"
                    checked={present}
                    disabled={!canEdit}
                    onChange={() => toggle(w.id)}
                    className="h-4 w-4 shrink-0 accent-primary-700"
                  />
                  <span className={present ? "text-text-primary" : "text-text-secondary"}>
                    {w.name}
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
