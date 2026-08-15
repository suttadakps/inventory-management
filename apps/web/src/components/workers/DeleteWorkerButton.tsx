"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteWorkerAction } from "@/lib/workers/actions";

export function DeleteWorkerButton({ id }: { id: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!confirm("ยืนยันลบช่างคนนี้ออกจากรายชื่อ?")) return;
        startTransition(async () => {
          await deleteWorkerAction(id);
          router.push("/workers");
        });
      }}
      className="inline-flex h-9 items-center rounded-md border border-danger px-3 text-body-sm font-medium text-danger hover:bg-[#f7e0dc] disabled:opacity-50"
    >
      ลบ
    </button>
  );
}
