import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { requireUser } from "@/lib/auth/session";
import { isQuotationEditable } from "@/lib/quotation/permissions";
import { getQuotation } from "@/lib/quotation/repository";
import { QuotationForm } from "@/components/quotation/QuotationForm";

export const metadata: Metadata = { title: "Edit quotation · ARTIVERGES NEXT" };

export default async function EditQuotationPage({
  params,
}: {
  params: Promise<{ id: string; quotationId: string }>;
}) {
  const user = await requireUser();
  const { id: projectId, quotationId } = await params;

  const q = await getQuotation(user, quotationId);
  if (!q) notFound();
  if (!isQuotationEditable(user.role, q.status)) {
    redirect(`/projects/${projectId}/quotations/${quotationId}`);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link
          href={`/projects/${projectId}/quotations/${quotationId}`}
          className="text-body-sm text-text-secondary hover:underline"
        >
          ← {q.quotationNo}
        </Link>
        <h1 className="mt-1 text-h1 font-bold text-text-primary">
          Edit quotation
        </h1>
      </div>

      <QuotationForm quotation={q} />
    </div>
  );
}
