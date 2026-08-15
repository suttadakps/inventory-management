"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import {
  createWhtCertificateAction,
  updateWhtCertificateAction,
  type WhtFormInput,
} from "@/lib/wht/actions";
import { createWorkerFromWhtAction } from "@/lib/workers/actions";
import type { WhtCertificateItem } from "@/lib/wht/repository";
import type { WorkerItem } from "@/lib/workers/repository";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Alert } from "@/components/ui/Alert";

const todayStr = () => new Date().toISOString().slice(0, 10);

const WITHHOLDING_OPTIONS = [
  { value: "1", label: "(1) หัก ณ ที่จ่าย" },
  { value: "2", label: "(2) ออกให้ตลอดไป" },
  { value: "3", label: "(3) ออกให้ครั้งเดียว" },
  { value: "4", label: "(4) อื่นๆ" },
];

export function WhtCertificateForm({
  mode,
  certId,
  initial,
  projects,
  workers = [],
  sourceNote,
}: {
  mode: "create" | "edit";
  certId?: string;
  initial: Partial<WhtFormInput>;
  projects: { id: string; name: string }[];
  workers?: WorkerItem[];
  sourceNote?: string;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedWorkerId, setSelectedWorkerId] = useState("");
  const [saveToRoster, setSaveToRoster] = useState(false);

  const [form, setForm] = useState<WhtFormInput>({
    projectId: initial.projectId ?? "",
    filingForm: initial.filingForm ?? "pnd3",
    bookNo: initial.bookNo ?? "",
    docNo: initial.docNo ?? "",
    payerTaxId: initial.payerTaxId ?? "",
    payeeTaxId: initial.payeeTaxId ?? "",
    payeeName: initial.payeeName ?? "",
    payeeAddress: initial.payeeAddress ?? "",
    incomeCategory: initial.incomeCategory ?? "6",
    incomeDescription: initial.incomeDescription ?? "",
    paymentDate: initial.paymentDate ?? todayStr(),
    amountPaid: initial.amountPaid ?? "",
    taxWithheld: initial.taxWithheld ?? "",
    withholdingType: initial.withholdingType ?? "1",
    withholdingOther: initial.withholdingOther ?? "",
    signerName: initial.signerName ?? "",
    signedDate: initial.signedDate ?? todayStr(),
    sourceType: initial.sourceType,
    sourceId: initial.sourceId,
  });

  const set = <K extends keyof WhtFormInput>(key: K, value: WhtFormInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const inputCls = "h-10";

  const submit = () => {
    setError(null);
    setPending(true);
    startTransition(async () => {
      const res =
        mode === "create"
          ? await createWhtCertificateAction(form)
          : await updateWhtCertificateAction(certId!, form);
      if (res.ok && saveToRoster && !selectedWorkerId && form.payeeName.trim()) {
        await createWorkerFromWhtAction({
          name: form.payeeName,
          taxId: form.payeeTaxId,
          address: form.payeeAddress,
        });
      }
      setPending(false);
      if (res.ok) {
        router.push(`/wht/${res.id}`);
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
          <Label>โปรเจค (ไม่บังคับ)</Label>
          <Select
            value={form.projectId}
            onChange={(e) => set("projectId", e.target.value)}
            className={inputCls}
          >
            <option value="">— ไม่ผูกโปรเจค —</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>แบบยื่น</Label>
          <Select
            value={form.filingForm}
            onChange={(e) => set("filingForm", e.target.value)}
            className={inputCls}
          >
            <option value="pnd3">ภ.ง.ด.3 (บุคคลธรรมดา)</option>
            <option value="pnd53">ภ.ง.ด.53 (นิติบุคคล)</option>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>เล่มที่</Label>
          <Input
            value={form.bookNo}
            onChange={(e) => set("bookNo", e.target.value)}
            className={inputCls}
          />
        </div>
        <div className="space-y-1.5">
          <Label>เลขที่</Label>
          <Input
            value={form.docNo}
            onChange={(e) => set("docNo", e.target.value)}
            className={inputCls}
          />
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
        <div className="space-y-1.5 sm:col-span-2">
          <Label>เลือกช่างจากรายชื่อ (ไม่บังคับ)</Label>
          <Select
            value={selectedWorkerId}
            onChange={(e) => {
              const id = e.target.value;
              setSelectedWorkerId(id);
              const worker = workers.find((w) => w.id === id);
              if (worker) {
                set("payeeName", worker.name);
                set("payeeTaxId", worker.taxId ?? "");
                set("payeeAddress", worker.address ?? "");
              }
            }}
            className={inputCls}
          >
            <option value="">— กรอกเอง / สร้างใหม่ —</option>
            {workers.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>เลขประจำตัวผู้เสียภาษี (ผู้ถูกหักภาษี)</Label>
          <Input
            value={form.payeeTaxId}
            onChange={(e) => set("payeeTaxId", e.target.value)}
            placeholder="13 หลัก"
            className={inputCls}
          />
        </div>
        <div className="space-y-1.5">
          <Label>ชื่อผู้ถูกหักภาษี *</Label>
          <Input
            value={form.payeeName}
            onChange={(e) => set("payeeName", e.target.value)}
            className={inputCls}
          />
        </div>
        <div className="space-y-1.5">
          <Label>ที่อยู่ผู้ถูกหักภาษี</Label>
          <Textarea
            value={form.payeeAddress}
            onChange={(e) => set("payeeAddress", e.target.value)}
            rows={2}
          />
        </div>
        {!selectedWorkerId && form.payeeName.trim() && (
          <div className="space-y-1.5 sm:col-span-2">
            <label className="flex h-6 items-center gap-2 text-body-sm text-text-primary">
              <input
                type="checkbox"
                checked={saveToRoster}
                onChange={(e) => setSaveToRoster(e.target.checked)}
              />
              บันทึกช่างนี้ไว้ในรายชื่อช่างด้วย
            </label>
          </div>
        )}
      </div>

      <div className="space-y-1.5 border-t border-border pt-4">
        <Label>ประเภทเงินได้ (ข้อ 5-6 เท่านั้น)</Label>
        <div className="flex gap-4 text-body-sm">
          <label className="flex items-center gap-1.5">
            <input
              type="radio"
              checked={form.incomeCategory === "5"}
              onChange={() => set("incomeCategory", "5")}
            />
            ข้อ 5 — ตามคำสั่งกรมสรรพากร มาตรา 3 เตรส
          </label>
          <label className="flex items-center gap-1.5">
            <input
              type="radio"
              checked={form.incomeCategory === "6"}
              onChange={() => set("incomeCategory", "6")}
            />
            ข้อ 6 — อื่นๆ
          </label>
        </div>
        <Input
          value={form.incomeDescription}
          onChange={(e) => set("incomeDescription", e.target.value)}
          placeholder="ระบุ เช่น ค่าจ้างเหมา, ค่าบริการ, ค่าเช่า"
          className={inputCls}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label>วันที่จ่าย *</Label>
          <Input
            type="date"
            value={form.paymentDate}
            onChange={(e) => set("paymentDate", e.target.value)}
            className={inputCls}
          />
        </div>
        <div className="space-y-1.5">
          <Label>จำนวนเงินที่จ่าย (฿) *</Label>
          <Input
            type="number"
            min={0}
            step="0.01"
            value={form.amountPaid}
            onChange={(e) => set("amountPaid", e.target.value)}
            className={inputCls}
          />
        </div>
        <div className="space-y-1.5">
          <Label>ภาษีที่หักนำส่ง (฿) *</Label>
          <Input
            type="number"
            min={0}
            step="0.01"
            value={form.taxWithheld}
            onChange={(e) => set("taxWithheld", e.target.value)}
            className={inputCls}
          />
        </div>
      </div>

      <div className="space-y-1.5 border-t border-border pt-4">
        <Label>ผู้จ่ายเงิน</Label>
        <div className="flex flex-wrap gap-4 text-body-sm">
          {WITHHOLDING_OPTIONS.map((o) => (
            <label key={o.value} className="flex items-center gap-1.5">
              <input
                type="radio"
                checked={form.withholdingType === o.value}
                onChange={() => set("withholdingType", o.value)}
              />
              {o.label}
            </label>
          ))}
        </div>
        {form.withholdingType === "4" && (
          <Input
            value={form.withholdingOther}
            onChange={(e) => set("withholdingOther", e.target.value)}
            placeholder="ระบุ"
            className={inputCls}
          />
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 border-t border-border pt-4">
        <div className="space-y-1.5">
          <Label>ผู้ลงนาม</Label>
          <Input
            value={form.signerName}
            onChange={(e) => set("signerName", e.target.value)}
            className={inputCls}
          />
        </div>
        <div className="space-y-1.5">
          <Label>วันที่ลงนาม</Label>
          <Input
            type="date"
            value={form.signedDate}
            onChange={(e) => set("signedDate", e.target.value)}
            className={inputCls}
          />
        </div>
      </div>

      <button
        type="button"
        onClick={submit}
        disabled={pending}
        className="inline-flex h-10 items-center rounded-md bg-primary-700 px-4 text-body-sm font-medium text-white hover:bg-primary-600 disabled:opacity-50"
      >
        {pending ? "กำลังบันทึก…" : mode === "create" ? "สร้างใบทวิ 50" : "บันทึกการแก้ไข"}
      </button>
    </div>
  );
}
