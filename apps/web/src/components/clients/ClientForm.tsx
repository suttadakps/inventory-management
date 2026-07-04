"use client";

import { useActionState } from "react";
import Link from "next/link";

import type { ClientActionState } from "@/lib/clients/actions";
import { CLIENT_TYPES } from "@/lib/validation/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Alert } from "@/components/ui/Alert";

export type ClientFormValues = {
  id?: string;
  name?: string;
  type?: string;
  contactPerson?: string | null;
  phone?: string | null;
  email?: string | null;
  taxId?: string | null;
  address?: string | null;
  notes?: string | null;
};

type Props = {
  mode: "create" | "edit";
  action: (
    prev: ClientActionState,
    formData: FormData
  ) => Promise<ClientActionState>;
  values?: ClientFormValues;
};

const initialState: ClientActionState = {};

const TYPE_LABELS: Record<string, string> = {
  business: "Business",
  individual: "Individual",
};

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-caption text-danger">{message}</p>;
}

export function ClientForm({ mode, action, values }: Props) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const fe = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="space-y-5" noValidate>
      {mode === "edit" && values?.id && (
        <input type="hidden" name="id" value={values.id} />
      )}

      {state.error && <Alert variant="error">{state.error}</Alert>}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="name">Company name</Label>
          <Input
            id="name"
            name="name"
            defaultValue={values?.name}
            placeholder="Acme Interiors Pvt Ltd"
            required
            invalid={Boolean(fe.name)}
          />
          <FieldError message={fe.name} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="type">Type</Label>
          <Select
            id="type"
            name="type"
            defaultValue={values?.type ?? "business"}
            invalid={Boolean(fe.type)}
          >
            {CLIENT_TYPES.map((t) => (
              <option key={t} value={t}>
                {TYPE_LABELS[t]}
              </option>
            ))}
          </Select>
          <FieldError message={fe.type} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="contactPerson">Contact person</Label>
          <Input
            id="contactPerson"
            name="contactPerson"
            defaultValue={values?.contactPerson ?? ""}
            placeholder="Priya Sharma"
            invalid={Boolean(fe.contactPerson)}
          />
          <FieldError message={fe.contactPerson} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="taxId">Tax ID</Label>
          <Input
            id="taxId"
            name="taxId"
            defaultValue={values?.taxId ?? ""}
            placeholder="GSTIN / VAT / TIN"
            invalid={Boolean(fe.taxId)}
          />
          <FieldError message={fe.taxId} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            defaultValue={values?.email ?? ""}
            placeholder="contact@acme.com"
            invalid={Boolean(fe.email)}
          />
          <FieldError message={fe.email} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            defaultValue={values?.phone ?? ""}
            placeholder="+91 98765 43210"
            invalid={Boolean(fe.phone)}
          />
          <FieldError message={fe.phone} />
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="address">Address</Label>
          <Textarea
            id="address"
            name="address"
            defaultValue={values?.address ?? ""}
            placeholder="Street, city, state, postal code"
            invalid={Boolean(fe.address)}
          />
          <FieldError message={fe.address} />
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            name="notes"
            defaultValue={values?.notes ?? ""}
            placeholder="Internal notes about this client"
            invalid={Boolean(fe.notes)}
          />
          <FieldError message={fe.notes} />
        </div>
      </div>

      <div className="flex items-center gap-3 border-t border-border pt-5">
        <Button type="submit" loading={pending}>
          {mode === "create" ? "Create client" : "Save changes"}
        </Button>
        <Link
          href={mode === "edit" && values?.id ? `/clients/${values.id}` : "/clients"}
          className="text-body-sm text-text-secondary hover:text-text-primary hover:underline"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
