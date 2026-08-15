"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import {
  createWorkerAction,
  updateWorkerAction,
  type WorkerFormInput,
} from "@/lib/workers/actions";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { Alert } from "@/components/ui/Alert";

export function WorkerForm({
  mode,
  workerId,
  initial,
}: {
  mode: "create" | "edit";
  workerId?: string;
  initial: Partial<WorkerFormInput>;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<WorkerFormInput>({
    name: initial.name ?? "",
    taxId: initial.taxId ?? "",
    position: initial.position ?? "",
    phone: initial.phone ?? "",
    address: initial.address ?? "",
  });

  const set = <K extends keyof WorkerFormInput>(
    key: K,
    value: WorkerFormInput[K]
  ) => setForm((f) => ({ ...f, [key]: value }));

  const inputCls = "h-10";

  const submit = () => {
    setError(null);
    setPending(true);
    startTransition(async () => {
      const res =
        mode === "create"
          ? await createWorkerAction(form)
          : await updateWorkerAction(workerId!, form);
      setPending(false);
      if (res.ok) {
        router.push(`/workers/${res.id}`);
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
          <Label>ชื่อช่าง *</Label>
          <Input
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            className={inputCls}
          />
        </div>
        <div className="space-y-1.5">
          <Label>ตำแหน่ง</Label>
          <Input
            value={form.position}
            onChange={(e) => set("position", e.target.value)}
            className={inputCls}
          />
        </div>
        <div className="space-y-1.5">
          <Label>เบอร์โทร</Label>
          <Input
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
            className={inputCls}
          />
        </div>
        <div className="space-y-1.5">
          <Label>เลขประจำตัวผู้เสียภาษี</Label>
          <Input
            value={form.taxId}
            onChange={(e) => set("taxId", e.target.value)}
            placeholder="13 หลัก"
            className={inputCls}
          />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label>ที่อยู่</Label>
          <Textarea
            value={form.address}
            onChange={(e) => set("address", e.target.value)}
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
        {pending ? "กำลังบันทึก…" : mode === "create" ? "เพิ่มช่างใหม่" : "บันทึกการแก้ไข"}
      </button>
    </div>
  );
}
