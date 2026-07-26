"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Select } from "@/components/ui/Select";

type ProjectOption = { id: string; name: string; code: string };

/** Entry point for the AI estimation flow from a page that isn't already
 * scoped to one project (e.g. the global /boq list) — picks a project first,
 * since every extraction must belong to one. */
export function BoqAiEntryButton({ projects }: { projects: ProjectOption[] }) {
  const router = useRouter();
  const [projectId, setProjectId] = useState("");

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="min-w-56 flex-1 space-y-1.5">
        <label
          htmlFor="ai-project"
          className="text-body-sm font-medium text-text-primary"
        >
          เลือกโปรเจคสำหรับสร้างจาก AI
        </label>
        <Select
          id="ai-project"
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
        >
          <option value="">— เลือกโปรเจค —</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} ({p.code})
            </option>
          ))}
        </Select>
      </div>
      <button
        type="button"
        disabled={!projectId}
        onClick={() => router.push(`/projects/${projectId}/estimation/new`)}
        className="inline-flex h-10 items-center justify-center rounded-md bg-accent-600 px-4 text-body-sm font-medium text-white transition-colors hover:brightness-95 disabled:opacity-50"
      >
        + สร้างจาก AI
      </button>
    </div>
  );
}
