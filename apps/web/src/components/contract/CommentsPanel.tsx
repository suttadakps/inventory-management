"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import type { ContractCommentDto } from "@/lib/contract/repository";
import { addCommentAction, deleteCommentAction } from "@/lib/contract/actions";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";

export function CommentsPanel({
  contractId,
  comments,
  canManage,
}: {
  contractId: string;
  comments: ContractCommentDto[];
  canManage: boolean;
}) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit() {
    if (!body.trim()) return;
    setError(null);
    startTransition(async () => {
      const res = await addCommentAction(contractId, body);
      if (!res.ok) setError(res.error);
      else {
        setBody("");
        router.refresh();
      }
    });
  }

  function remove(id: string) {
    startTransition(async () => {
      const res = await deleteCommentAction(id, contractId);
      if (!res.ok) setError(res.error);
      else router.refresh();
    });
  }

  return (
    <section className="rounded-md border border-border bg-surface p-6">
      <h2 className="mb-4 text-h3 font-semibold text-text-primary">Comments</h2>

      {comments.length === 0 && (
        <p className="text-body-sm text-text-secondary">No comments yet.</p>
      )}
      <ul className="space-y-4">
        {comments.map((c) => (
          <li key={c.id} className="border-b border-border pb-3 last:border-0">
            <div className="flex items-center justify-between">
              <span className="text-body-sm font-medium text-text-primary">
                {c.authorName ?? "Unknown"}
              </span>
              <span className="text-caption text-text-secondary">
                {new Date(c.createdAt).toLocaleString()}
              </span>
            </div>
            <p className="mt-1 whitespace-pre-line text-body-sm text-text-primary">
              {c.body}
            </p>
            {canManage && (
              <button
                type="button"
                onClick={() => remove(c.id)}
                className="mt-1 text-caption text-danger hover:underline"
              >
                Delete
              </button>
            )}
          </li>
        ))}
      </ul>

      {canManage && (
        <div className="mt-4 space-y-2">
          {error && <p className="text-caption text-danger">{error}</p>}
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Add a comment…"
          />
          <Button size="sm" onClick={submit} loading={pending} disabled={!body.trim()}>
            Comment
          </Button>
        </div>
      )}
    </section>
  );
}
