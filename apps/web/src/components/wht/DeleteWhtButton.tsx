"use client";

import { useTransition } from "react";
import { deleteWhtCertificateAction } from "@/lib/wht/actions";

export function DeleteWhtButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!confirm("ยืนยันลบใบทวิ 50 นี้?")) return;
        startTransition(() => deleteWhtCertificateAction(id));
      }}
      className="inline-flex h-9 items-center rounded-md border border-danger px-3 text-body-sm font-medium text-danger hover:bg-[#f7e0dc] disabled:opacity-50"
    >
      ลบ
    </button>
  );
}
