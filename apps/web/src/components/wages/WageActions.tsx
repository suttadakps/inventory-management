"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

import { toggleWagePaidAction, deleteWageAction } from "@/lib/wages/actions";

export function WageActions({
  id,
  status,
}: {
  id: string;
  status: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const run = (fn: () => Promise<unknown>) =>
    startTransition(async () => {
      await fn();
      router.refresh();
    });

  return (
    <div className="flex items-center justify-end gap-2">
      {status === "unpaid" ? (
        <button
          type="button"
          disabled={pending}
          onClick={() => run(() => toggleWagePaidAction(id, true))}
          className="inline-flex h-8 items-center rounded-md bg-success px-2.5 text-caption font-medium text-white hover:brightness-95 disabled:opacity-60"
        >
          จ่ายแล้ว
        </button>
      ) : (
        <button
          type="button"
          disabled={pending}
          onClick={() => run(() => toggleWagePaidAction(id, false))}
          className="inline-flex h-8 items-center rounded-md border border-[#e2ddd0] px-2.5 text-caption font-medium text-text-secondary hover:bg-[#faf8f3] disabled:opacity-60"
        >
          ยกเลิกจ่าย
        </button>
      )}
      <button
        type="button"
        disabled={pending}
        aria-label="ลบ"
        onClick={() => run(() => deleteWageAction(id))}
        className="text-text-secondary hover:text-danger disabled:opacity-50"
      >
        ×
      </button>
    </div>
  );
}
