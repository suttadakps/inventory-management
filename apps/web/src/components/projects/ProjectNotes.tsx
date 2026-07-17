"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import {
  addProjectNoteAction,
  updateProjectNoteAction,
  deleteProjectNoteAction,
} from "@/lib/projects/actions";
import type { ProjectNoteItem } from "@/lib/projects/repository";

const dateFmt = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

function NoteRow({
  note,
  projectId,
  canEdit,
}: {
  note: ProjectNoteItem;
  projectId: string;
  canEdit: boolean;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(note.body);

  const save = () => {
    const body = text.trim();
    if (!body) return;
    startTransition(async () => {
      const res = await updateProjectNoteAction(projectId, note.id, body);
      if (res.ok) {
        setEditing(false);
        router.refresh();
      }
    });
  };

  const remove = () =>
    startTransition(async () => {
      await deleteProjectNoteAction(projectId, note.id);
      router.refresh();
    });

  if (editing) {
    return (
      <li className="border-t border-[#f0ece2] pt-3 first:border-0 first:pt-0">
        <div className="flex gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                save();
              }
            }}
            autoFocus
            className="h-10 flex-1 rounded-md border border-[#e2ddd0] bg-white px-3 text-body-sm text-text-primary focus:border-primary-600 focus:outline-none"
          />
          <button
            type="button"
            onClick={save}
            className="inline-flex h-10 items-center rounded-md bg-primary-700 px-4 text-body-sm font-medium text-white hover:bg-primary-600"
          >
            บันทึก
          </button>
          <button
            type="button"
            onClick={() => {
              setText(note.body);
              setEditing(false);
            }}
            className="inline-flex h-10 items-center rounded-md border border-[#e2ddd0] bg-white px-3 text-body-sm text-text-primary hover:bg-[#faf8f3]"
          >
            ยกเลิก
          </button>
        </div>
      </li>
    );
  }

  return (
    <li className="border-t border-[#f0ece2] pt-3 first:border-0 first:pt-0">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="whitespace-pre-line text-body-sm text-text-primary">
            {note.body}
          </p>
          <p className="mt-0.5 text-caption text-text-secondary">
            {note.authorName ?? "—"} · {dateFmt.format(new Date(note.date))}
          </p>
        </div>
        {canEdit && (
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="text-caption text-primary-600 hover:underline"
            >
              แก้ไข
            </button>
            <button
              type="button"
              onClick={remove}
              aria-label="ลบบันทึก"
              className="text-text-secondary hover:text-danger"
            >
              ×
            </button>
          </div>
        )}
      </div>
    </li>
  );
}

export function ProjectNotes({
  projectId,
  notes,
  canAdd,
  canEdit,
}: {
  projectId: string;
  notes: ProjectNoteItem[];
  canAdd: boolean;
  canEdit: boolean;
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
            <NoteRow
              key={n.id}
              note={n}
              projectId={projectId}
              canEdit={canEdit}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
