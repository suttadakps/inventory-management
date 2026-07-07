"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import {
  updateProjectProgressAction,
  updateProjectStatusAction,
} from "@/lib/projects/actions";
import { PROJECT_STATUSES } from "@/lib/validation/project";

const STATUS_TH: Record<string, string> = {
  planning: "วางแผน",
  active: "กำลังดำเนินการ",
  on_hold: "พักงาน",
  completed: "เสร็จสิ้น",
  warranty: "รับประกัน",
  closed: "ปิดงาน",
};

export function ProjectProgressControl({
  projectId,
  progress,
  status,
  editable,
}: {
  projectId: string;
  progress: number;
  status: string;
  editable: boolean;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [p, setP] = useState(Math.round(progress));
  const [s, setS] = useState(status);

  const saveProgress = (val: number) =>
    startTransition(async () => {
      await updateProjectProgressAction(projectId, val);
      router.refresh();
    });

  const saveStatus = (val: string) =>
    startTransition(async () => {
      await updateProjectStatusAction(projectId, val);
      router.refresh();
    });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-body-sm font-medium text-text-secondary">
          Progress
        </span>
        <span className="text-body font-bold tabular-nums text-text-primary">
          {p}%
        </span>
      </div>

      <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#e7e1d5]">
        <div
          className="h-full rounded-full bg-primary-700 transition-all"
          style={{ width: `${p}%` }}
        />
      </div>

      <div className="flex items-center gap-3">
        <select
          value={s}
          disabled={!editable}
          onChange={(e) => {
            setS(e.target.value);
            saveStatus(e.target.value);
          }}
          className="h-9 rounded-md border border-[#e2ddd0] bg-white px-2 text-body-sm text-text-primary focus:border-primary-600 focus:outline-none disabled:opacity-60"
        >
          {PROJECT_STATUSES.map((st) => (
            <option key={st} value={st}>
              {STATUS_TH[st] ?? st}
            </option>
          ))}
        </select>

        <input
          type="range"
          min={0}
          max={100}
          value={p}
          disabled={!editable}
          onChange={(e) => setP(Number(e.target.value))}
          onPointerUp={(e) =>
            saveProgress(Number((e.target as HTMLInputElement).value))
          }
          onKeyUp={(e) =>
            saveProgress(Number((e.target as HTMLInputElement).value))
          }
          className="flex-1 accent-primary-700 disabled:opacity-60"
        />
      </div>
    </div>
  );
}
