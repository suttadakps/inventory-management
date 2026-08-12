import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { requireUser } from "@/lib/auth/session";
import { canManageWht } from "@/lib/wht/permissions";
import { getWhtCertificate } from "@/lib/wht/repository";
import { listProjects } from "@/lib/projects/repository";
import { ContentCard } from "@/components/ui/ContentCard";
import { WhtCertificateForm } from "@/components/wht/WhtCertificateForm";
import { DeleteWhtButton } from "@/components/wht/DeleteWhtButton";
import type { WhtFormInput } from "@/lib/wht/actions";

export const metadata: Metadata = { title: "ใบทวิ 50 · ARTIVERGES NEXT" };

export default async function WhtDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  if (!canManageWht(user.role)) notFound();

  const { id } = await params;
  const [cert, projects] = await Promise.all([
    getWhtCertificate(user, id),
    listProjects(user, {}),
  ]);
  if (!cert) notFound();

  const initial: Partial<WhtFormInput> = {
    projectId: cert.projectId ?? "",
    filingForm: cert.filingForm,
    bookNo: cert.bookNo ?? "",
    docNo: cert.docNo ?? "",
    payerTaxId: cert.payerTaxId ?? "",
    payeeTaxId: cert.payeeTaxId ?? "",
    payeeName: cert.payeeName,
    payeeAddress: cert.payeeAddress ?? "",
    incomeCategory: cert.incomeCategory,
    incomeDescription: cert.incomeDescription,
    paymentDate: cert.paymentDate.slice(0, 10),
    amountPaid: String(cert.amountPaid),
    taxWithheld: String(cert.taxWithheld),
    withholdingType: cert.withholdingType,
    withholdingOther: cert.withholdingOther ?? "",
    signerName: cert.signerName ?? "",
    signedDate: cert.signedDate ? cert.signedDate.slice(0, 10) : "",
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/wht"
          className="text-body-sm text-text-secondary hover:underline"
        >
          ← กลับไปหน้าใบทวิ 50
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href={`/wht/${id}/print`}
            target="_blank"
            className="inline-flex h-9 items-center rounded-md border border-primary-700 px-3 text-body-sm font-medium text-primary-700 hover:bg-primary-100"
          >
            พิมพ์ / Print
          </Link>
          <DeleteWhtButton id={id} />
        </div>
      </div>

      <ContentCard className="p-6">
        <h2 className="mb-4 text-h2 font-bold text-text-primary">
          {cert.payeeName}
        </h2>
        <WhtCertificateForm
          mode="edit"
          certId={id}
          initial={initial}
          projects={projects.map((p) => ({ id: p.id, name: p.name }))}
        />
      </ContentCard>
    </div>
  );
}
