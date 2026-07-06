"use client";

import { useActionState, useMemo, useState } from "react";
import Link from "next/link";

import type { QuotationActionState } from "@/lib/quotation/actions";
import { updateQuotationAction } from "@/lib/quotation/actions";
import type { QuotationDetailDto } from "@/lib/quotation/repository";
import { computeQuotationTotals, type DiscountType } from "@/lib/quotation/calc";
import { formatMoney } from "@/lib/format";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Alert } from "@/components/ui/Alert";

const initialState: QuotationActionState = {};

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-caption text-danger">{message}</p>;
}

export function QuotationForm({ quotation }: { quotation: QuotationDetailDto }) {
  const [state, formAction, pending] = useActionState(
    updateQuotationAction,
    initialState
  );
  const fe = state.fieldErrors ?? {};

  // Live totals preview as the user edits discount / VAT.
  const [discountType, setDiscountType] = useState<DiscountType>(
    quotation.discountType
  );
  const [discountValue, setDiscountValue] = useState(quotation.discountValue);
  const [taxPct, setTaxPct] = useState(quotation.taxPct);

  const totals = useMemo(
    () =>
      computeQuotationTotals({
        subtotal: quotation.subtotal,
        discountType,
        discountValue,
        taxPct,
      }),
    [quotation.subtotal, discountType, discountValue, taxPct]
  );

  return (
    <form action={formAction} className="space-y-6" noValidate>
      <input type="hidden" name="id" value={quotation.id} />
      {state.error && <Alert variant="error">{state.error}</Alert>}

      <section className="rounded-md border border-border bg-surface p-6">
        <h2 className="mb-4 text-h3 font-semibold text-text-primary">Details</h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" defaultValue={quotation.title ?? ""} />
            <FieldError message={fe.title} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="issueDate">Issue date</Label>
            <Input
              id="issueDate"
              name="issueDate"
              type="date"
              defaultValue={quotation.issueDate ?? ""}
            />
            <FieldError message={fe.issueDate} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="expiryDate">Expiration date</Label>
            <Input
              id="expiryDate"
              name="expiryDate"
              type="date"
              defaultValue={quotation.expiryDate ?? ""}
              invalid={Boolean(fe.expiryDate)}
            />
            <FieldError message={fe.expiryDate} />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="paymentTerms">Payment terms</Label>
            <Textarea
              id="paymentTerms"
              name="paymentTerms"
              defaultValue={quotation.paymentTerms ?? ""}
              placeholder="e.g. 40% advance, 40% on progress, 20% on handover"
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="warranty">Warranty</Label>
            <Textarea
              id="warranty"
              name="warranty"
              defaultValue={quotation.warranty ?? ""}
              placeholder="e.g. 12 months workmanship warranty"
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="scope">Scope of work</Label>
            <Textarea id="scope" name="scope" defaultValue={quotation.scope ?? ""} />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="excludedItems">Excluded items</Label>
            <Textarea
              id="excludedItems"
              name="excludedItems"
              defaultValue={quotation.excludedItems ?? ""}
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" name="notes" defaultValue={quotation.notes ?? ""} />
          </div>
        </div>
      </section>

      <section className="rounded-md border border-border bg-surface p-6">
        <h2 className="mb-4 text-h3 font-semibold text-text-primary">Pricing</h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="discountType">Discount type</Label>
            <Select
              id="discountType"
              name="discountType"
              value={discountType}
              onChange={(e) => setDiscountType(e.target.value as DiscountType)}
            >
              <option value="amount">Fixed amount (₹)</option>
              <option value="percent">Percentage (%)</option>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="discountValue">Discount value</Label>
            <Input
              id="discountValue"
              name="discountValue"
              type="number"
              min={0}
              step="0.01"
              value={discountValue}
              onChange={(e) => setDiscountValue(e.target.valueAsNumber || 0)}
              invalid={Boolean(fe.discountValue)}
            />
            <FieldError message={fe.discountValue} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="taxPct">VAT (%)</Label>
            <Input
              id="taxPct"
              name="taxPct"
              type="number"
              min={0}
              max={100}
              step="0.01"
              value={taxPct}
              onChange={(e) => setTaxPct(e.target.valueAsNumber || 0)}
              invalid={Boolean(fe.taxPct)}
            />
            <FieldError message={fe.taxPct} />
          </div>
        </div>

        <dl className="mt-5 space-y-2 border-t border-border pt-4 text-body-sm">
          <Row label="Subtotal" value={formatMoney(totals.subtotal)} />
          <Row label="Discount" value={`− ${formatMoney(totals.discountAmount)}`} />
          <Row label={`VAT (${taxPct || 0}%)`} value={formatMoney(totals.taxAmount)} />
          <div className="flex items-center justify-between border-t border-border pt-2 text-body font-semibold">
            <dt>Grand Total</dt>
            <dd className="font-mono tabular-nums">{formatMoney(totals.total)}</dd>
          </div>
        </dl>
      </section>

      <div className="flex items-center gap-3">
        <Button type="submit" loading={pending}>
          Save quotation
        </Button>
        <Link
          href={`/projects/${quotation.projectId}/quotations/${quotation.id}`}
          className="text-body-sm text-text-secondary hover:text-text-primary hover:underline"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-text-secondary">{label}</dt>
      <dd className="font-mono tabular-nums text-text-primary">{value}</dd>
    </div>
  );
}
