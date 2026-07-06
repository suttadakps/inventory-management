import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { requireUser } from "@/lib/auth/session";
import { canManageContracts } from "@/lib/contract/permissions";
import { listApprovedQuotationOptions } from "@/lib/contract/repository";
import { generateContractAction } from "@/lib/contract/actions";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { formatMoney } from "@/lib/format";

export const metadata: Metadata = { title: "New contract · ARTIVERGES NEXT" };

export default async function NewContractPage() {
  const user = await requireUser();
  if (!canManageContracts(user.role)) redirect("/contracts");

  const quotations = await listApprovedQuotationOptions();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link
          href="/contracts"
          className="text-body-sm text-text-secondary hover:underline"
        >
          ← Contracts
        </Link>
        <h1 className="mt-1 text-h1 font-bold text-text-primary">New contract</h1>
        <p className="text-body-sm text-text-secondary">
          A contract is generated from an approved quotation. Its total is locked
          to the quotation total.
        </p>
      </div>

      {quotations.length === 0 ? (
        <div className="rounded-md border border-dashed border-border bg-surface p-10 text-center text-body-sm text-text-secondary">
          No approved quotations are awaiting a contract. Approve a quotation
          first, or all approved quotations already have an active contract.
        </div>
      ) : (
        <form
          action={generateContractAction}
          className="space-y-4 rounded-md border border-border bg-surface p-6"
        >
          <div className="space-y-1.5">
            <label htmlFor="quotationId" className="text-body-sm font-medium">
              Approved quotation
            </label>
            <Select id="quotationId" name="quotationId" required defaultValue="">
              <option value="" disabled>
                Select an approved quotation…
              </option>
              {quotations.map((qo) => (
                <option key={qo.id} value={qo.id}>
                  {`${qo.quotationNo} · ${qo.projectName} · ${formatMoney(
                    qo.total,
                    true
                  )}`}
                </option>
              ))}
            </Select>
          </div>
          <Button type="submit">Generate contract</Button>
        </form>
      )}
    </div>
  );
}
