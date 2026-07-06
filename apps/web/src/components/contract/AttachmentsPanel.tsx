"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import type { ContractFileDto } from "@/lib/contract/repository";
import { addFileAction, deleteFileAction } from "@/lib/contract/actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function AttachmentsPanel({
  contractId,
  files,
  canManage,
}: {
  contractId: string;
  files: ContractFileDto[];
  canManage: boolean;
}) {
  const router = useRouter();
  const [fileName, setFileName] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function add() {
    setError(null);
    startTransition(async () => {
      const res = await addFileAction(contractId, { fileName, fileUrl });
      if (!res.ok) setError(res.error);
      else {
        setFileName("");
        setFileUrl("");
        router.refresh();
      }
    });
  }

  function remove(id: string) {
    startTransition(async () => {
      const res = await deleteFileAction(id, contractId);
      if (!res.ok) setError(res.error);
      else router.refresh();
    });
  }

  return (
    <section className="rounded-md border border-border bg-surface p-6">
      <h2 className="mb-4 text-h3 font-semibold text-text-primary">Attachments</h2>

      {files.length === 0 && (
        <p className="text-body-sm text-text-secondary">No attachments.</p>
      )}
      <ul className="space-y-2">
        {files.map((f) => (
          <li key={f.id} className="flex items-center justify-between gap-2">
            <a
              href={f.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="truncate text-body-sm text-primary-600 hover:underline"
            >
              {f.fileName}
            </a>
            {canManage && (
              <button
                type="button"
                onClick={() => remove(f.id)}
                className="text-caption text-danger hover:underline"
              >
                Remove
              </button>
            )}
          </li>
        ))}
      </ul>

      {canManage && (
        <div className="mt-4 space-y-2">
          {error && <p className="text-caption text-danger">{error}</p>}
          <Input
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            placeholder="File name (e.g. Signed contract.pdf)"
          />
          <Input
            value={fileUrl}
            onChange={(e) => setFileUrl(e.target.value)}
            placeholder="https://link-to-file"
          />
          <Button
            size="sm"
            variant="secondary"
            onClick={add}
            loading={pending}
            disabled={!fileName.trim() || !fileUrl.trim()}
          >
            Add attachment
          </Button>
        </div>
      )}
    </section>
  );
}
