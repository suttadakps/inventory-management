"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

import { deleteExpenseAction } from "@/lib/costs/actions";

export function CostDeleteButton({ id }: { id: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      aria-label="ลบรายการต้นทุน"
      onClick={() =>
        startTransition(async () => {
          await deleteExpenseAction(id);
          router.refresh();
        })
      }
      className="text-text-secondary hover:text-danger disabled:opacity-50"
    >
      ×
    </button>
  );
}
