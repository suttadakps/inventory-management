"use client";

import { useEffect, useRef, useState, useTransition } from "react";

import {
  toggleAttendanceAction,
  sendCheckinRollCallAction,
  getAttendanceAction,
  addCheckinWorkerAction,
  listCheckinWorkersAction,
  getAttendanceHistoryAction,
} from "@/lib/attendance/actions";
import type { CheckinWorkerItem, AttendanceHistoryDay } from "@/lib/attendance/repository";

const POLL_MS = 10_000;

const todayStr = () => new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Bangkok" });

const historyDateFmt = new Intl.DateTimeFormat("th-TH", {
  day: "numeric",
  month: "short",
  year: "2-digit",
  timeZone: "Asia/Bangkok",
});

export function ProjectAttendance({
  projectId,
  workers: initialWorkers,
  initialPresentIds,
  initialHistory,
  canEdit,
}: {
  projectId: string;
  workers: CheckinWorkerItem[];
  initialPresentIds: string[];
  initialHistory: AttendanceHistoryDay[];
  canEdit: boolean;
}) {
  const [, startTransition] = useTransition();
  const [date, setDate] = useState(todayStr());
  const [workers, setWorkers] = useState(initialWorkers);
  const [presentIds, setPresentIds] = useState<Set<string>>(
    new Set(initialPresentIds)
  );
  const [history, setHistory] = useState(initialHistory);
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [otherName, setOtherName] = useState("");
  const [addingOther, setAddingOther] = useState(false);

  const refreshHistory = () => {
    getAttendanceHistoryAction(projectId).then(setHistory);
  };

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

  // Poll so a tap in LINE (or a name added from another tab) shows up here.
  useEffect(() => {
    const interval = setInterval(async () => {
      const [rows, latestWorkers, latestHistory] = await Promise.all([
        getAttendanceAction(projectId, dateRef.current),
        listCheckinWorkersAction(),
        getAttendanceHistoryAction(projectId),
      ]);
      setPresentIds(new Set(rows.map((r) => r.workerId)));
      setWorkers(latestWorkers);
      setHistory(latestHistory);
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
      refreshHistory();
    });
  };

  const addOther = () => {
    const trimmed = otherName.trim();
    if (!trimmed) return;
    setAddingOther(true);
    startTransition(async () => {
      const res = await addCheckinWorkerAction(projectId, date, trimmed);
      setAddingOther(false);
      if (res.ok) {
        setOtherName("");
        setWorkers((prev) =>
          prev.some((w) => w.id === res.worker.id) ? prev : [...prev, res.worker]
        );
        setPresentIds((prev) => new Set(prev).add(res.worker.id));
        refreshHistory();
      } else {
        setNotice(res.error);
      }
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
      <p className="text-caption text-text-secondary">
        เช็คชื่อแล้วจะบันทึกลงสรุปค่าแรง (/wages) ให้อัตโนมัติ
      </p>
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

      {canEdit && (
        <div className="flex flex-wrap items-center gap-2 border-t border-[#f0ece2] pt-3">
          <input
            value={otherName}
            onChange={(e) => setOtherName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") addOther();
            }}
            placeholder="อื่นๆ — พิมพ์ชื่อคนงาน"
            className={`${inputCls} min-w-40 flex-1`}
          />
          <button
            type="button"
            onClick={addOther}
            disabled={addingOther || !otherName.trim()}
            className="inline-flex h-10 items-center rounded-md border border-[#e2ddd0] bg-white px-3 text-body-sm font-medium text-text-primary hover:bg-[#faf8f3] disabled:opacity-50"
          >
            เพิ่ม
          </button>
        </div>
      )}

      <div className="border-t border-[#f0ece2] pt-3">
        <h4 className="mb-2 text-body-sm font-medium text-text-primary">
          ประวัติการเช็คชื่อ
        </h4>
        {history.length === 0 ? (
          <p className="text-caption text-text-secondary">ยังไม่มีประวัติ</p>
        ) : (
          <ul className="space-y-1.5">
            {history.map((day) => (
              <li key={day.date} className="text-body-sm">
                <span className="text-text-secondary">
                  {historyDateFmt.format(new Date(`${day.date}T00:00:00Z`))}
                </span>{" "}
                <span className="text-text-primary">
                  {day.workerNames.join(", ")}
                </span>{" "}
                <span className="text-caption text-text-secondary">
                  ({day.workerNames.length} คน)
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
