import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { requireUser } from "@/lib/auth/session";
import { canManageWht } from "@/lib/wht/permissions";
import {
  getExpenseForWht,
  getDisbursementForWht,
  getWageForWht,
} from "@/lib/wht/repository";
import { listProjects } from "@/lib/projects/repository";
import { listWorkers } from "@/lib/workers/repository";
import { ContentCard } from "@/components/ui/ContentCard";
import { WhtCertificateForm } from "@/components/wht/WhtCertificateForm";
import type { WhtFormInput } from "@/lib/wht/actions";

export const metadata: Metadata = { title: "ออกใบทวิ 50 · ARTIVERGES NEXT" };

export default async function WhtNewPage({
  searchParams,
}: {
  searchParams: Promise<{ source?: string; id?: string }>;
}) {
  const user = await requireUser();
  if (!canManageWht(user.role)) notFound();

  const sp = await searchParams;
  const [projects, workers] = await Promise.all([
    listProjects(user, {}),
    listWorkers(),
  ]);

  let initial: Partial<WhtFormInput> = { signerName: user.fullName ?? "" };
  let sourceNote: string | undefined;

  if (sp.source === "expense" && sp.id) {
    const seed = await getExpenseForWht(sp.id);
    if (seed) {
      initial = {
        ...initial,
        projectId: seed.projectId ?? "",
        incomeDescription: seed.description,
        amountPaid: String(seed.amount),
        sourceType: "expense",
        sourceId: sp.id,
      };
      sourceNote =
        "ดึงจำนวนเงินและคำอธิบายเบื้องต้นจากรายการค่าใช้จ่ายมาให้แล้ว — กรุณาตรวจสอบ/กรอกชื่อและเลขประจำตัวผู้เสียภาษีของผู้ถูกหักภาษีเอง เนื่องจากระบบยังไม่มีข้อมูลนี้ผูกกับรายการต้นทุน";
    }
  } else if (sp.source === "disbursement" && sp.id) {
    const seed = await getDisbursementForWht(sp.id);
    if (seed) {
      initial = {
        ...initial,
        projectId: seed.projectId ?? "",
        incomeDescription: seed.description,
        amountPaid: String(seed.amount),
        sourceType: "disbursement",
        sourceId: sp.id,
      };
      sourceNote =
        "ดึงจำนวนเงินและคำอธิบายเบื้องต้นจากรายการเบิกเงินมาให้แล้ว — กรุณาตรวจสอบ/กรอกชื่อและเลขประจำตัวผู้เสียภาษีของผู้ถูกหักภาษีเอง เนื่องจากระบบยังไม่มีข้อมูลนี้ผูกกับรายการเบิกเงิน";
    }
  } else if (sp.source === "wage" && sp.id) {
    const seed = await getWageForWht(sp.id);
    if (seed) {
      initial = {
        ...initial,
        projectId: seed.projectId ?? "",
        payeeName: seed.suggestedPayeeName ?? "",
        incomeDescription: seed.description,
        amountPaid: String(seed.amount),
        sourceType: "wage",
        sourceId: sp.id,
      };
      sourceNote =
        "ดึงชื่อคนงาน จำนวนเงิน และโปรเจคจากรายการค่าแรงมาให้แล้ว — กรุณาตรวจสอบ/กรอกเลขประจำตัวผู้เสียภาษีของคนงานเอง";
    }
  }

  return (
    <div className="space-y-5">
      <Link
        href="/wht"
        className="text-body-sm text-text-secondary hover:underline"
      >
        ← กลับไปหน้าใบทวิ 50
      </Link>

      <ContentCard className="p-6">
        <h2 className="mb-4 text-h2 font-bold text-text-primary">
          ออกใบทวิ 50 ใหม่
        </h2>
        <WhtCertificateForm
          mode="create"
          initial={initial}
          projects={projects.map((p) => ({ id: p.id, name: p.name }))}
          workers={workers}
          sourceNote={sourceNote}
        />
      </ContentCard>
    </div>
  );
}
