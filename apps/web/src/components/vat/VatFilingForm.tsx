"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import {
  createVatFilingAction,
  updateVatFilingAction,
  type VatFormInput,
} from "@/lib/vat/actions";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Alert } from "@/components/ui/Alert";

const MONTHS_TH = [
  "มกราคม",
  "กุมภาพันธ์",
  "มีนาคม",
  "เมษายน",
  "พฤษภาคม",
  "มิถุนายน",
  "กรกฎาคม",
  "สิงหาคม",
  "กันยายน",
  "ตุลาคม",
  "พฤศจิกายน",
  "ธันวาคม",
];

export function VatFilingForm({
  mode,
  filingId,
  initial,
  sourceNote,
}: {
  mode: "create" | "edit";
  filingId?: string;
  initial: VatFormInput;
  sourceNote?: string;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<VatFormInput>(initial);

  const set = <K extends keyof VatFormInput>(key: K, value: VatFormInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const inputCls = "h-10";

  const salesVat = Number(form.salesVat) || 0;
  const purchaseVat = Number(form.purchaseVat) || 0;
  const overpaidPrior = Number(form.overpaidPrior) || 0;
  const net = salesVat - purchaseVat - overpaidPrior;

  const submit = () => {
    setError(null);
    setPending(true);
    startTransition(async () => {
      const res =
        mode === "create"
          ? await createVatFilingAction(form)
          : await updateVatFilingAction(filingId!, form);
      setPending(false);
      if (res.ok) {
        router.push(`/vat/${res.id}`);
        router.refresh();
      } else {
        setError(res.error);
      }
    });
  };

  return (
    <div className="space-y-5">
      {sourceNote && (
        <Alert variant="info" className="text-body-sm">
          {sourceNote}
        </Alert>
      )}
      {error && (
        <Alert variant="error" className="text-body-sm">
          {error}
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>เดือนภาษี</Label>
          <div className="text-body font-medium text-text-primary">
            {MONTHS_TH[Number(form.periodMonth) - 1]} {form.periodYear}
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>เลขประจำตัวผู้เสียภาษี (บริษัท)</Label>
          <Input
            value={form.payerTaxId}
            onChange={(e) => set("payerTaxId", e.target.value)}
            placeholder="13 หลัก"
            className={inputCls}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 border-t border-border pt-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>4. ยอดขายที่ต้องเสียภาษี (฿)</Label>
          <Input
            type="number"
            min={0}
            step="0.01"
            value={form.salesTotal}
            onChange={(e) => set("salesTotal", e.target.value)}
            className={inputCls}
          />
        </div>
        <div className="space-y-1.5">
          <Label>5. ภาษีขายเดือนนี้ (฿)</Label>
          <Input
            type="number"
            min={0}
            step="0.01"
            value={form.salesVat}
            onChange={(e) => set("salesVat", e.target.value)}
            className={inputCls}
          />
        </div>
        <div className="space-y-1.5">
          <Label>6. ยอดซื้อที่มีสิทธินำภาษีซื้อ (฿)</Label>
          <Input
            type="number"
            min={0}
            step="0.01"
            value={form.purchaseTotal}
            onChange={(e) => set("purchaseTotal", e.target.value)}
            className={inputCls}
          />
        </div>
        <div className="space-y-1.5">
          <Label>7. ภาษีซื้อเดือนนี้ (฿)</Label>
          <Input
            type="number"
            min={0}
            step="0.01"
            value={form.purchaseVat}
            onChange={(e) => set("purchaseVat", e.target.value)}
            className={inputCls}
          />
        </div>
        <div className="space-y-1.5">
          <Label>10. ภาษีที่ชำระเกินยกมา (฿)</Label>
          <Input
            type="number"
            min={0}
            step="0.01"
            value={form.overpaidPrior}
            onChange={(e) => set("overpaidPrior", e.target.value)}
            className={inputCls}
          />
        </div>
        <div className="space-y-1.5">
          <Label>วันที่ยื่นแบบ</Label>
          <Input
            type="date"
            value={form.filedDate}
            onChange={(e) => set("filedDate", e.target.value)}
            className={inputCls}
          />
        </div>
      </div>

      <div className="border-t border-border pt-4 text-body font-semibold text-text-primary">
        {net >= 0 ? "ภาษีสุทธิที่ต้องชำระ" : "ภาษีสุทธิที่ชำระเกิน"}:{" "}
        <span className={net >= 0 ? "text-accent-600" : "text-success"}>
          ฿{Math.abs(net).toLocaleString("th-TH", { minimumFractionDigits: 2 })}
        </span>
      </div>

      <button
        type="button"
        onClick={submit}
        disabled={pending}
        className="inline-flex h-10 items-center rounded-md bg-primary-700 px-4 text-body-sm font-medium text-white hover:bg-primary-600 disabled:opacity-50"
      >
        {pending ? "กำลังบันทึก…" : mode === "create" ? "สร้างแบบ ภ.พ.30" : "บันทึกการแก้ไข"}
      </button>
    </div>
  );
}
