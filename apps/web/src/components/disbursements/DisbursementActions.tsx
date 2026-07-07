"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

import {
  approveDisbursementAction,
  rejectDisbursementAction,
  payDisbursementAction,
} from "@/lib/disbursements/actions";

export function DisbursementActions({
  id,
  status,
}: {
  id: string;
  status: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const run = (fn: (id: string) => Promise<unknown>) =>
    startTransition(async () => {
      await fn(id);
      router.refresh();
    });

  if (status === "pending") {
    return (
      <div className="flex gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={() => run(approveDisbursementAction)}
          className="inline-flex h-8 items-center rounded-md bg-primary-700 px-2.5 text-caption font-medium text-white hover:bg-primary-600 disabled:opacity-60"
        >
          อนุมัติ
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => run(rejectDisbursementAction)}
          className="inline-flex h-8 items-center rounded-md border border-danger px-2.5 text-caption font-medium text-danger hover:bg-[#f7e0dc] disabled:opacity-60"
        >
          ปฏิเสธ
        </button>
      </div>
    );
  }

  if (status === "approved") {
    return (
      <button
        type="button"
        disabled={pending}
        onClick={() => run(payDisbursementAction)}
        className="inline-flex h-8 items-center rounded-md bg-success px-2.5 text-caption font-medium text-white hover:brightness-95 disabled:opacity-60"
      >
        จ่ายแล้ว
      </button>
    );
  }

  return null;
}
