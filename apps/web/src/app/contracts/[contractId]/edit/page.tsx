import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { requireUser } from "@/lib/auth/session";
import { isContractEditable } from "@/lib/contract/permissions";
import { getContract } from "@/lib/contract/repository";
import { ContractForm } from "@/components/contract/ContractForm";

export const metadata: Metadata = { title: "Edit contract · ARTIVERGES NEXT" };

export default async function EditContractPage({
  params,
}: {
  params: Promise<{ contractId: string }>;
}) {
  const user = await requireUser();
  const { contractId } = await params;

  const contract = await getContract(user, contractId);
  if (!contract) notFound();
  if (!isContractEditable(user.role, contract.status)) {
    redirect(`/contracts/${contractId}`);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link
          href={`/contracts/${contractId}`}
          className="text-body-sm text-text-secondary hover:underline"
        >
          ← {contract.contractNo}
        </Link>
        <h1 className="mt-1 text-h1 font-bold text-text-primary">Edit contract</h1>
      </div>

      <ContractForm contract={contract} />
    </div>
  );
}
