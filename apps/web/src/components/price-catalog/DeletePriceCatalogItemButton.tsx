"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deletePriceCatalogItemAction } from "@/lib/price-catalog/actions";

export function DeletePriceCatalogItemButton({ id }: { id: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!confirm("ยืนยันลบรายการราคากลางนี้?")) return;
        startTransition(async () => {
          await deletePriceCatalogItemAction(id);
          router.push("/price-catalog");
        });
      }}
      className="inline-flex h-9 items-center rounded-md border border-danger px-3 text-body-sm font-medium text-danger hover:bg-[#f7e0dc] disabled:opacity-50"
    >
      ลบ
    </button>
  );
}
