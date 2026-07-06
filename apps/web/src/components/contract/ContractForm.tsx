"use client";

import { useActionState } from "react";
import Link from "next/link";

import type { ContractActionState } from "@/lib/contract/actions";
import { updateContractAction } from "@/lib/contract/actions";
import type { ContractDetailDto } from "@/lib/contract/repository";
import { formatMoney } from "@/lib/format";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { Alert } from "@/components/ui/Alert";

const initialState: ContractActionState = {};

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-caption text-danger">{message}</p>;
}

export function ContractForm({ contract }: { contract: ContractDetailDto }) {
  const [state, formAction, pending] = useActionState(
    updateContractAction,
    initialState
  );
  const fe = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="space-y-6" noValidate>
      <input type="hidden" name="id" value={contract.id} />
      {state.error && <Alert variant="error">{state.error}</Alert>}

      <section className="rounded-md border border-border bg-surface p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-h3 font-semibold text-text-primary">Details</h2>
          <span className="text-body-sm text-text-secondary">
            Contract value (from quotation):{" "}
            <span className="font-mono font-semibold text-text-primary">
              {formatMoney(contract.value)}
            </span>
          </span>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" defaultValue={contract.title ?? ""} />
            <FieldError message={fe.title} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="startDate">Start date</Label>
            <Input
              id="startDate"
              name="startDate"
              type="date"
              defaultValue={contract.startDate ?? ""}
            />
            <FieldError message={fe.startDate} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="endDate">End date</Label>
            <Input
              id="endDate"
              name="endDate"
              type="date"
              defaultValue={contract.endDate ?? ""}
              invalid={Boolean(fe.endDate)}
            />
            <FieldError message={fe.endDate} />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="scope">Scope</Label>
            <Textarea id="scope" name="scope" defaultValue={contract.scope ?? ""} />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="paymentTerms">Payment terms</Label>
            <Textarea
              id="paymentTerms"
              name="paymentTerms"
              defaultValue={contract.paymentTerms ?? ""}
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="warranty">Warranty</Label>
            <Textarea
              id="warranty"
              name="warranty"
              defaultValue={contract.warranty ?? ""}
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" name="notes" defaultValue={contract.notes ?? ""} />
          </div>
        </div>
      </section>

      <div className="flex items-center gap-3">
        <Button type="submit" loading={pending}>
          Save contract
        </Button>
        <Link
          href={`/contracts/${contract.id}`}
          className="text-body-sm text-text-secondary hover:text-text-primary hover:underline"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
