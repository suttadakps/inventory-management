"use client";

import { useActionState } from "react";
import Link from "next/link";

import type { ProjectActionState } from "@/lib/projects/actions";
import type { ProjectOption, UserOption } from "@/lib/projects/repository";
import { PROJECT_STATUSES } from "@/lib/validation/project";
const STATUS_TH: Record<string, string> = {
  planning: "วางแผน",
  active: "กำลังดำเนินการ",
  on_hold: "พักงาน",
  completed: "เสร็จสิ้น",
  warranty: "รับประกัน",
  closed: "ปิดงาน",
};
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Alert } from "@/components/ui/Alert";

export type ProjectFormValues = {
  id?: string;
  code?: string;
  name?: string;
  clientId?: string;
  address?: string | null;
  status?: string;
  budget?: number | null;
  contractValue?: number | null;
  actualCost?: number | null;
  commissionRate?: number | null;
  startDate?: string | null;
  endDate?: string | null;
  progress?: number;
  managerId?: string | null;
  siteEngineerId?: string | null;
};

type Props = {
  mode: "create" | "edit";
  action: (
    prev: ProjectActionState,
    formData: FormData
  ) => Promise<ProjectActionState>;
  clients: ProjectOption[];
  users: UserOption[];
  values?: ProjectFormValues;
};

const initialState: ProjectActionState = {};

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-caption text-danger">{message}</p>;
}

export function ProjectForm({ mode, action, clients, users, values }: Props) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const fe = state.fieldErrors ?? {};

  const managers = users.filter((u) =>
    ["owner", "admin", "ae"].includes(u.role)
  );
  const engineers = users.filter((u) =>
    ["site_engineer", "ae"].includes(u.role)
  );

  return (
    <form action={formAction} className="space-y-5" noValidate>
      {mode === "edit" && values?.id && (
        <>
          <input type="hidden" name="id" value={values.id} />
          {/* Code is immutable but still validated; submit it via hidden field
              since the visible field is disabled. */}
          <input type="hidden" name="code" value={values.code ?? ""} />
        </>
      )}

      {state.error && <Alert variant="error">{state.error}</Alert>}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="code">รหัสโปรเจค</Label>
          <Input
            id="code"
            // On edit the value is submitted via a hidden field above.
            name={mode === "create" ? "code" : undefined}
            defaultValue={values?.code}
            placeholder="PRJ-2026-001"
            required={mode === "create"}
            readOnly={mode === "edit"}
            disabled={mode === "edit"}
            invalid={Boolean(fe.code)}
          />
          <FieldError message={fe.code} />
          {mode === "edit" && (
            <p className="text-caption text-text-secondary">
              รหัสโปรเจคเปลี่ยนไม่ได้
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="name">ชื่อโปรเจค</Label>
          <Input
            id="name"
            name="name"
            defaultValue={values?.name}
            placeholder="Marina Villa turnkey"
            required
            invalid={Boolean(fe.name)}
          />
          <FieldError message={fe.name} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="clientId">ลูกค้า</Label>
          <Select
            id="clientId"
            name="clientId"
            defaultValue={values?.clientId ?? ""}
            required
            invalid={Boolean(fe.clientId)}
          >
            <option value="" disabled>
              {clients.length ? "เลือกลูกค้า…" : "ยังไม่มีลูกค้า"}
            </option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
          <FieldError message={fe.clientId} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="status">สถานะ</Label>
          <Select
            id="status"
            name="status"
            defaultValue={values?.status ?? "planning"}
            invalid={Boolean(fe.status)}
          >
            {PROJECT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_TH[s] ?? s}
              </option>
            ))}
          </Select>
          <FieldError message={fe.status} />
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="address">สถานที่ก่อสร้าง</Label>
          <Textarea
            id="address"
            name="address"
            defaultValue={values?.address ?? ""}
            placeholder="Plot / street / city"
            invalid={Boolean(fe.address)}
          />
          <FieldError message={fe.address} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="contractValue">มูลค่างาน (฿)</Label>
          <Input
            id="contractValue"
            name="contractValue"
            type="number"
            min={0}
            step="0.01"
            inputMode="decimal"
            defaultValue={values?.contractValue ?? ""}
            placeholder="0.00"
            invalid={Boolean(fe.contractValue)}
          />
          <FieldError message={fe.contractValue} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="actualCost">ต้นทุนจริง (฿)</Label>
          <Input
            id="actualCost"
            name="actualCost"
            type="number"
            min={0}
            step="0.01"
            inputMode="decimal"
            defaultValue={values?.actualCost ?? ""}
            placeholder="0.00"
            invalid={Boolean(fe.actualCost)}
          />
          <FieldError message={fe.actualCost} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="budget">งบประมาณ (฿)</Label>
          <Input
            id="budget"
            name="budget"
            type="number"
            min={0}
            step="0.01"
            inputMode="decimal"
            defaultValue={values?.budget ?? ""}
            placeholder="0.00"
            invalid={Boolean(fe.budget)}
          />
          <FieldError message={fe.budget} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="commissionRate">ค่าคอมมิชชั่น (%)</Label>
          <Input
            id="commissionRate"
            name="commissionRate"
            type="number"
            min={0}
            max={100}
            step="0.001"
            inputMode="decimal"
            defaultValue={values?.commissionRate ?? ""}
            placeholder="เช่น 3"
            invalid={Boolean(fe.commissionRate)}
          />
          <FieldError message={fe.commissionRate} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="progress">Progress (%)</Label>
          <Input
            id="progress"
            name="progress"
            type="number"
            min={0}
            max={100}
            step="1"
            defaultValue={values?.progress ?? 0}
            invalid={Boolean(fe.progress)}
          />
          <FieldError message={fe.progress} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="startDate">เริ่มงาน</Label>
          <Input
            id="startDate"
            name="startDate"
            type="date"
            defaultValue={values?.startDate ?? ""}
            invalid={Boolean(fe.startDate)}
          />
          <FieldError message={fe.startDate} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="endDate">ส่งมอบ</Label>
          <Input
            id="endDate"
            name="endDate"
            type="date"
            defaultValue={values?.endDate ?? ""}
            invalid={Boolean(fe.endDate)}
          />
          <FieldError message={fe.endDate} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="managerId">ผู้จัดการโปรเจค</Label>
          <Select
            id="managerId"
            name="managerId"
            defaultValue={values?.managerId ?? ""}
            invalid={Boolean(fe.managerId)}
          >
            <option value="">— ยังไม่ระบุ —</option>
            {managers.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </Select>
          <FieldError message={fe.managerId} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="siteEngineerId">วิศวกรหน้างาน</Label>
          <Select
            id="siteEngineerId"
            name="siteEngineerId"
            defaultValue={values?.siteEngineerId ?? ""}
            invalid={Boolean(fe.siteEngineerId)}
          >
            <option value="">— ยังไม่ระบุ —</option>
            {engineers.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </Select>
          <FieldError message={fe.siteEngineerId} />
        </div>
      </div>

      <div className="flex items-center gap-3 border-t border-border pt-5">
        <Button type="submit" loading={pending}>
          {mode === "create" ? "สร้างโปรเจค" : "บันทึก"}
        </Button>
        <Link
          href={mode === "edit" && values?.id ? `/projects/${values.id}` : "/projects"}
          className="text-body-sm text-text-secondary hover:text-text-primary hover:underline"
        >
          ยกเลิก
        </Link>
      </div>
    </form>
  );
}
