"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import {
  createPriceCatalogItemAction,
  updatePriceCatalogItemAction,
  type PriceCatalogFormInput,
} from "@/lib/price-catalog/actions";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { Alert } from "@/components/ui/Alert";

export function PriceCatalogForm({
  mode,
  itemId,
  initial,
}: {
  mode: "create" | "edit";
  itemId?: string;
  initial: Partial<PriceCatalogFormInput>;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<PriceCatalogFormInput>({
    name: initial.name ?? "",
    unit: initial.unit ?? "",
    materialCost: initial.materialCost ?? "",
    laborCost: initial.laborCost ?? "",
    category: initial.category ?? "",
    note: initial.note ?? "",
  });

  const set = <K extends keyof PriceCatalogFormInput>(
    key: K,
    value: PriceCatalogFormInput[K]
  ) => setForm((f) => ({ ...f, [key]: value }));

  const inputCls = "h-10";
  const total =
    (Number(form.materialCost) || 0) + (Number(form.laborCost) || 0);

  const submit = () => {
    setError(null);
    setPending(true);
    startTransition(async () => {
      const res =
        mode === "create"
          ? await createPriceCatalogItemAction(form)
          : await updatePriceCatalogItemAction(itemId!, form);
      setPending(false);
      if (res.ok) {
        router.push(`/price-catalog/${res.id}`);
        router.refresh();
      } else {
        setError(res.error);
      }
    });
  };

  return (
    <div className="space-y-5">
      {error && (
        <Alert variant="error" className="text-body-sm">
          {error}
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>ชื่อรายการ *</Label>
          <Input
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            className={inputCls}
          />
        </div>
        <div className="space-y-1.5">
          <Label>หมวดหมู่</Label>
          <Input
            value={form.category}
            onChange={(e) => set("category", e.target.value)}
            className={inputCls}
          />
        </div>
        <div className="space-y-1.5">
          <Label>หน่วย</Label>
          <Input
            value={form.unit}
            onChange={(e) => set("unit", e.target.value)}
            placeholder="เช่น ตร.ม., ม., ชิ้น"
            className={inputCls}
          />
        </div>
        <div />
        <div className="space-y-1.5">
          <Label>ค่าของ (ต่อหน่วย) *</Label>
          <Input
            type="number"
            min={0}
            step="0.01"
            value={form.materialCost}
            onChange={(e) => set("materialCost", e.target.value)}
            className={inputCls}
          />
        </div>
        <div className="space-y-1.5">
          <Label>ค่าแรง (ต่อหน่วย) *</Label>
          <Input
            type="number"
            min={0}
            step="0.01"
            value={form.laborCost}
            onChange={(e) => set("laborCost", e.target.value)}
            className={inputCls}
          />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label>รวม (ต่อหน่วย)</Label>
          <p className="text-body font-semibold text-text-primary">
            {total.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label>หมายเหตุ</Label>
          <Textarea
            value={form.note}
            onChange={(e) => set("note", e.target.value)}
            rows={2}
          />
        </div>
      </div>

      <button
        type="button"
        onClick={submit}
        disabled={pending}
        className="inline-flex h-10 items-center rounded-md bg-primary-700 px-4 text-body-sm font-medium text-white hover:bg-primary-600 disabled:opacity-50"
      >
        {pending
          ? "กำลังบันทึก…"
          : mode === "create"
            ? "เพิ่มรายการราคากลาง"
            : "บันทึกการแก้ไข"}
      </button>
    </div>
  );
}
