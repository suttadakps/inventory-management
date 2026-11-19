"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import {
  addMilestoneAction,
  deleteMilestoneAction,
  setMilestoneInspectionAction,
  setMilestoneProgressAction,
  setMilestoneStatusAction,
} from "@/lib/site/actions";
import type { SiteMilestone } from "@/lib/site/repository";
import { StatusBadge, type StatusTone } from "@/components/ui/StatusBadge";

const STATUS: Record<string, { label: string; tone: StatusTone }> = {
  todo: { label: "ยังไม่เริ่ม", tone: "gray" },
  in_progress: { label: "กำลังทำ", tone: "navy" },
  blocked: { label: "ติดปัญหา", tone: "red" },
  done: { label: "เสร็จแล้ว", tone: "green" },
};

const NEXT: Record<string, "todo" | "in_progress" | "done"> = {
  todo: "in_progress",
  in_progress: "done",
  blocked: "in_progress",
  done: "todo",
};

const INSPECTION: Record<string, { label: string; tone: StatusTone }> = {
  not_required: { label: "", tone: "gray" },
  pending: { label: "รอตรวจ", tone: "amber" },
  passed: { label: "ตรวจผ่าน", tone: "green" },
  failed: { label: "ต้องแก้ไข", tone: "red" },
};

/** รอตรวจ → ผ่าน → ต้องแก้ → ไม่ต้องตรวจ, cycling on tap. */
const NEXT_INSPECTION: Record<
  string,
  "not_required" | "pending" | "passed" | "failed"
> = {
  not_required: "pending",
  pending: "passed",
  passed: "failed",
  failed: "not_required",
};

const progInput =
  "mt-0.5 h-9 w-full rounded-md border border-[#e2ddd0] bg-white px-2 text-body-sm text-text-primary focus:border-primary-600 focus:outline-none";

const dateFmt = new Intl.DateTimeFormat("th-TH", {
  day: "numeric",
  month: "short",
  year: "2-digit",
});

/** "9 พ.ย. 69 – 20 พ.ย. 69", or just the one date a single-day step has. */
function formatRange(start: string | null, end: string | null): string {
  const s = start ? dateFmt.format(new Date(start)) : null;
  const e = end ? dateFmt.format(new Date(end)) : null;
  if (s && e) return s === e ? s : `${s} – ${e}`;
  return s ?? (e ? `กำหนด ${e}` : "");
}

export function SiteMilestones({
  projectId,
  milestones,
  canEdit,
}: {
  projectId: string;
  milestones: SiteMilestone[];
  canEdit: boolean;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [items, setItems] = useState(milestones);
  const [name, setName] = useState("");
  const [due, setDue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [prog, setProg] = useState({
    quantityDone: "",
    quantityTotal: "",
    quantityUnit: "",
    location: "",
    forecastEnd: "",
  });

  const openProgress = (m: SiteMilestone) => {
    setEditing(m.id);
    setProg({
      quantityDone: m.quantityDone?.toString() ?? "",
      quantityTotal: m.quantityTotal?.toString() ?? "",
      quantityUnit: m.quantityUnit ?? "",
      location: m.location ?? "",
      forecastEnd: m.forecastEnd ?? "",
    });
  };

  const saveProgress = (id: string) =>
    startTransition(async () => {
      const res = await setMilestoneProgressAction(id, prog);
      if (res.ok) {
        setEditing(null);
        router.refresh();
      } else setError(res.error);
    });

  const cycleInspection = (m: SiteMilestone) =>
    startTransition(async () => {
      const res = await setMilestoneInspectionAction(
        m.id,
        NEXT_INSPECTION[m.inspection] ?? "pending"
      );
      if (!res.ok) setError(res.error);
      router.refresh();
    });

  const advance = (m: SiteMilestone) => {
    const next = NEXT[m.status] ?? "in_progress";
    // Optimistic: the tap should feel instant on a phone at the site.
    setItems((prev) =>
      prev.map((x) => (x.id === m.id ? { ...x, status: next } : x))
    );
    startTransition(async () => {
      const res = await setMilestoneStatusAction(projectId, m.id, next);
      if (!res.ok) setError(res.error);
      router.refresh();
    });
  };

  const remove = (id: string) => {
    setItems((prev) => prev.filter((x) => x.id !== id));
    startTransition(async () => {
      await deleteMilestoneAction(projectId, id);
      router.refresh();
    });
  };

  const add = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError("กรุณากรอกชื่อขั้นตอน");
      return;
    }
    setError(null);
    startTransition(async () => {
      const res = await addMilestoneAction(projectId, trimmed, due);
      if (res.ok) {
        setName("");
        setDue("");
        router.refresh();
      } else {
        setError(res.error);
      }
    });
  };

  return (
    <div className="space-y-3">
      {items.length === 0 ? (
        <p className="text-body-sm text-text-secondary">
          ยังไม่มีการกำหนดขั้นตอน
        </p>
      ) : (
        <ol className="divide-y divide-[#f0ece2]">
          {items.map((m, i) => {
            const st = STATUS[m.status] ?? {
              label: m.status,
              tone: "gray" as StatusTone,
            };
            return (
              <li
                key={m.id}
                className="flex items-center justify-between gap-3 py-3"
              >
                <div className="flex min-w-0 items-start gap-3">
                  <span
                    className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-caption font-semibold ${
                      m.status === "done"
                        ? "bg-success text-white"
                        : "bg-[#ece9e2] text-text-secondary"
                    }`}
                  >
                    {m.status === "done" ? "✓" : i + 1}
                  </span>
                  <div className="min-w-0">
                    <div
                      className={
                        m.status === "done"
                          ? "text-body-sm text-text-secondary line-through"
                          : "text-body-sm font-medium text-text-primary"
                      }
                    >
                      {m.name}
                    </div>
                    {(m.plannedStart || m.plannedEnd) && (
                      <div className="text-caption text-text-secondary">
                        {formatRange(m.plannedStart, m.plannedEnd)}
                      </div>
                    )}
                    {(m.location || m.forecastEnd) && (
                      <div className="text-caption text-text-secondary">
                        {m.location && <span>พื้นที่: {m.location}</span>}
                        {m.location && m.forecastEnd && " · "}
                        {m.forecastEnd && (
                          <span
                            className={
                              m.plannedEnd && m.forecastEnd > m.plannedEnd
                                ? "text-danger"
                                : undefined
                            }
                          >
                            คาดเสร็จ {dateFmt.format(new Date(m.forecastEnd))}
                          </span>
                        )}
                      </div>
                    )}

                    {m.quantityTotal !== null && m.quantityTotal > 0 && (
                      <div className="mt-1 max-w-56">
                        <div className="flex justify-between text-caption text-text-secondary">
                          <span>ทำได้</span>
                          <span className="tabular-nums text-text-primary">
                            {m.quantityDone ?? 0}/{m.quantityTotal}{" "}
                            {m.quantityUnit}
                          </span>
                        </div>
                        <div className="mt-0.5 h-1.5 w-full overflow-hidden rounded-full bg-[#e7e1d5]">
                          <div
                            className="h-full rounded-full bg-primary-700"
                            style={{
                              width: `${Math.min(
                                100,
                                Math.round(
                                  ((m.quantityDone ?? 0) / m.quantityTotal) * 100
                                )
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {m.description && (
                      <p className="mt-0.5 text-caption leading-snug text-text-secondary">
                        {m.description}
                      </p>
                    )}

                    {canEdit && (
                      <button
                        type="button"
                        onClick={() =>
                          editing === m.id ? setEditing(null) : openProgress(m)
                        }
                        className="mt-1 text-caption font-medium text-primary-700 hover:underline"
                      >
                        {editing === m.id ? "ปิด" : "บันทึกผลงาน/พื้นที่"}
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex shrink-0 flex-col items-end gap-1">
                  <div className="flex items-center gap-2">
                  {canEdit ? (
                    <button
                      type="button"
                      onClick={() => advance(m)}
                      className="rounded-full"
                      aria-label={`เปลี่ยนสถานะ ${m.name}`}
                    >
                      <StatusBadge tone={st.tone}>{st.label}</StatusBadge>
                    </button>
                  ) : (
                    <StatusBadge tone={st.tone}>{st.label}</StatusBadge>
                  )}
                  {canEdit && (
                    <button
                      type="button"
                      onClick={() => remove(m.id)}
                      aria-label={`ลบ ${m.name}`}
                      className="text-text-secondary hover:text-danger"
                    >
                      ×
                    </button>
                  )}
                  </div>

                  {/* Built and signed off are tracked apart on purpose. */}
                  {(m.inspection !== "not_required" || canEdit) &&
                    (canEdit ? (
                      <button
                        type="button"
                        onClick={() => cycleInspection(m)}
                        aria-label={`สถานะตรวจของ ${m.name}`}
                      >
                        {m.inspection === "not_required" ? (
                          <span className="text-caption text-text-secondary hover:underline">
                            + สถานะตรวจ
                          </span>
                        ) : (
                          <StatusBadge tone={INSPECTION[m.inspection]!.tone}>
                            {INSPECTION[m.inspection]!.label}
                          </StatusBadge>
                        )}
                      </button>
                    ) : (
                      <StatusBadge tone={INSPECTION[m.inspection]!.tone}>
                        {INSPECTION[m.inspection]!.label}
                      </StatusBadge>
                    ))}
                </div>

                {editing === m.id && canEdit && (
                  <div className="mt-3 grid grid-cols-2 gap-2 rounded-md bg-[#faf8f3] p-3 sm:grid-cols-5">
                    <label className="text-caption text-text-secondary">
                      ทำได้
                      <input
                        value={prog.quantityDone}
                        onChange={(e) =>
                          setProg((f) => ({ ...f, quantityDone: e.target.value }))
                        }
                        inputMode="decimal"
                        className={progInput}
                      />
                    </label>
                    <label className="text-caption text-text-secondary">
                      ทั้งหมด
                      <input
                        value={prog.quantityTotal}
                        onChange={(e) =>
                          setProg((f) => ({ ...f, quantityTotal: e.target.value }))
                        }
                        inputMode="decimal"
                        className={progInput}
                      />
                    </label>
                    <label className="text-caption text-text-secondary">
                      หน่วย
                      <input
                        value={prog.quantityUnit}
                        onChange={(e) =>
                          setProg((f) => ({ ...f, quantityUnit: e.target.value }))
                        }
                        placeholder="ตร.ม."
                        className={progInput}
                      />
                    </label>
                    <label className="text-caption text-text-secondary">
                      พื้นที่/ชั้น/ห้อง
                      <input
                        value={prog.location}
                        onChange={(e) =>
                          setProg((f) => ({ ...f, location: e.target.value }))
                        }
                        placeholder="ชั้น 2 ห้องนอน 1"
                        className={progInput}
                      />
                    </label>
                    <label className="text-caption text-text-secondary">
                      คาดว่าจะเสร็จ
                      <input
                        type="date"
                        value={prog.forecastEnd}
                        onChange={(e) =>
                          setProg((f) => ({ ...f, forecastEnd: e.target.value }))
                        }
                        className={progInput}
                      />
                    </label>
                    <div className="col-span-2 sm:col-span-5">
                      <button
                        type="button"
                        onClick={() => saveProgress(m.id)}
                        className="inline-flex h-9 items-center rounded-md bg-primary-700 px-4 text-body-sm font-medium text-white hover:bg-primary-600"
                      >
                        บันทึก
                      </button>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      )}

      {canEdit && (
        <div className="space-y-2 border-t border-[#f0ece2] pt-3">
          <div className="flex flex-wrap gap-2">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="เพิ่มขั้นตอน เช่น ติดตั้งฝ้า"
              className="h-10 min-w-40 flex-1 rounded-md border border-[#e2ddd0] bg-white px-3 text-body-sm text-text-primary focus:border-primary-600 focus:outline-none"
            />
            <input
              type="date"
              value={due}
              onChange={(e) => setDue(e.target.value)}
              className="h-10 rounded-md border border-[#e2ddd0] bg-white px-3 text-body-sm text-text-primary focus:border-primary-600 focus:outline-none"
            />
            <button
              type="button"
              onClick={add}
              className="inline-flex h-10 items-center rounded-md bg-primary-700 px-4 text-body-sm font-medium text-white hover:bg-primary-600"
            >
              เพิ่ม
            </button>
          </div>
          <p className="text-caption text-text-secondary">
            แตะที่ป้ายสถานะเพื่อเปลี่ยน: ยังไม่เริ่ม → กำลังทำ → เสร็จแล้ว
          </p>
        </div>
      )}

      {error && <p className="text-caption text-danger">{error}</p>}
    </div>
  );
}
