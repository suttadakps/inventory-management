"use client";

import { useActionState } from "react";
import Link from "next/link";

import type { ProjectActionState } from "@/lib/projects/actions";
import type { ProjectOption, UserOption } from "@/lib/projects/repository";
import { PROJECT_STATUSES } from "@/lib/validation/project";
import { STATUS_LABELS } from "./ProjectStatusBadge";
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
          <Label htmlFor="code">Project code</Label>
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
              Project code cannot be changed.
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="name">Project name</Label>
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
          <Label htmlFor="clientId">Client</Label>
          <Select
            id="clientId"
            name="clientId"
            defaultValue={values?.clientId ?? ""}
            required
            invalid={Boolean(fe.clientId)}
          >
            <option value="" disabled>
              {clients.length ? "Select a client…" : "No clients available"}
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
          <Label htmlFor="status">Status</Label>
          <Select
            id="status"
            name="status"
            defaultValue={values?.status ?? "planning"}
            invalid={Boolean(fe.status)}
          >
            {PROJECT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </Select>
          <FieldError message={fe.status} />
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="address">Site address</Label>
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
          <Label htmlFor="budget">Budget (₹)</Label>
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
          <Label htmlFor="startDate">Start date</Label>
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
          <Label htmlFor="endDate">End date</Label>
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
          <Label htmlFor="managerId">Project manager</Label>
          <Select
            id="managerId"
            name="managerId"
            defaultValue={values?.managerId ?? ""}
            invalid={Boolean(fe.managerId)}
          >
            <option value="">— Unassigned —</option>
            {managers.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </Select>
          <FieldError message={fe.managerId} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="siteEngineerId">Site engineer</Label>
          <Select
            id="siteEngineerId"
            name="siteEngineerId"
            defaultValue={values?.siteEngineerId ?? ""}
            invalid={Boolean(fe.siteEngineerId)}
          >
            <option value="">— Unassigned —</option>
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
          {mode === "create" ? "Create project" : "Save changes"}
        </Button>
        <Link
          href={mode === "edit" && values?.id ? `/projects/${values.id}` : "/projects"}
          className="text-body-sm text-text-secondary hover:text-text-primary hover:underline"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
