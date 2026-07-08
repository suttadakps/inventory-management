"use client";

import { useRouter } from "next/navigation";

type ProjectOption = { id: string; name: string };

/**
 * Project-scoping dropdown for module list pages (บันทึกต้นทุน, สรุปค่าแรง, …).
 * Navigates to `${basePath}?projectId=...` on change (auto-submit — no extra
 * click), or back to `basePath` with no query when "ทุกโปรเจค" is chosen.
 * Only narrows the table rows on the page; summary/metric cards stay
 * unfiltered by design.
 */
export function ProjectFilterBar({
  basePath,
  projects,
  selectedId,
}: {
  basePath: string;
  projects: ProjectOption[];
  selectedId?: string;
}) {
  const router = useRouter();

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="projectFilter" className="text-body-sm text-text-secondary">
        โปรเจค
      </label>
      <select
        id="projectFilter"
        value={selectedId ?? ""}
        onChange={(e) => {
          const value = e.target.value;
          router.push(value ? `${basePath}?projectId=${value}` : basePath);
        }}
        className="h-10 rounded-md border border-[#e2ddd0] bg-white px-3 text-body-sm text-text-primary focus:border-primary-600 focus:outline-none"
      >
        <option value="">ทุกโปรเจค</option>
        {projects.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>
    </div>
  );
}
