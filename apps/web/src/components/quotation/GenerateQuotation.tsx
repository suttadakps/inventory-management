import type { ApprovedBoqOption } from "@/lib/quotation/repository";
import { generateQuotationAction } from "@/lib/quotation/actions";
import { formatMoney } from "@/lib/format";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";

/**
 * Generate a quotation from an approved BOQ. Server-rendered form; the action
 * snapshots the BOQ's selling lines into a new draft quotation.
 */
export function GenerateQuotation({
  projectId,
  approvedBoqs,
}: {
  projectId: string;
  approvedBoqs: ApprovedBoqOption[];
}) {
  if (approvedBoqs.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-border bg-surface p-4 text-body-sm text-text-secondary">
        No approved BOQ yet. Approve a BOQ to generate a quotation from it.
      </div>
    );
  }

  return (
    <form
      action={generateQuotationAction}
      className="flex flex-wrap items-end gap-3 rounded-md border border-border bg-surface p-4"
    >
      <input type="hidden" name="projectId" value={projectId} />
      <div className="min-w-64 flex-1 space-y-1.5">
        <label htmlFor="boqId" className="text-body-sm font-medium">
          Generate from approved BOQ
        </label>
        <Select id="boqId" name="boqId" required defaultValue="">
          <option value="" disabled>
            Select an approved BOQ…
          </option>
          {approvedBoqs.map((b) => (
            <option key={b.id} value={b.id}>
              {(b.title ?? `BOQ v${b.version}`) +
                ` · v${b.version} · ${formatMoney(b.sellingTotal, true)}`}
            </option>
          ))}
        </Select>
      </div>
      <Button type="submit">Generate quotation</Button>
    </form>
  );
}
