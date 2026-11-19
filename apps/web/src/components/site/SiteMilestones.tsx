"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import {
  addMilestoneAction,
  deleteMilestoneAction,
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
                    {m.description && (
                      <p className="mt-0.5 text-caption leading-snug text-text-secondary">
                        {m.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
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
