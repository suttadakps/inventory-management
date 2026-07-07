"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { addProjectNoteAction } from "@/lib/projects/actions";
import type { ProjectNoteItem } from "@/lib/projects/repository";

const dateFmt = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

export function ProjectNotes({
  projectId,
  notes,
  canAdd,
}: {
  projectId: string;
  notes: ProjectNoteItem[];
  canAdd: boolean;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [text, setText] = useState("");

  const submit = () => {
    const body = text.trim();
    if (!body) return;
    startTransition(async () => {
      const res = await addProjectNoteAction(projectId, body);
      if (res.ok) {
        setText("");
        router.refresh();
      }
    });
  };

  return (
    <div className="space-y-3">
      {canAdd && (
        <div className="flex gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                submit();
              }
            }}
            placeholder="เพิ่มโน้ตวันนี้…"
            className="h-10 flex-1 rounded-md border border-[#e2ddd0] bg-white px-3 text-body-sm text-text-primary focus:border-primary-600 focus:outline-none"
          />
          <button
            type="button"
            onClick={submit}
            className="inline-flex h-10 items-center rounded-md bg-primary-700 px-4 text-body-sm font-medium text-white hover:bg-primary-600"
          >
            เพิ่ม
          </button>
        </div>
      )}

      {notes.length === 0 ? (
        <p className="text-body-sm text-text-secondary">ยังไม่มีบันทึก</p>
      ) : (
        <ul className="space-y-3">
          {notes.map((n) => (
            <li
              key={n.id}
              className="border-t border-[#f0ece2] pt-3 first:border-0 first:pt-0"
            >
              <p className="whitespace-pre-line text-body-sm text-text-primary">
                {n.body}
              </p>
              <p className="mt-0.5 text-caption text-text-secondary">
                {n.authorName ?? "—"} · {dateFmt.format(new Date(n.date))}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
