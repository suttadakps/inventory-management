"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { addReferralAction } from "@/lib/referrals/actions";
import { ContentCard } from "@/components/ui/ContentCard";

const inputCls =
  "h-11 rounded-md border border-[#e2ddd0] bg-white px-3 text-body-sm text-text-primary focus:border-primary-600 focus:outline-none";

export function ReferralAddForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [, startTransition] = useTransition();
  const [referrerName, setReferrerName] = useState("");
  const [referrerContact, setReferrerContact] = useState("");
  const [projectTitle, setProjectTitle] = useState("");
  const [prospectName, setProspectName] = useState("");
  const [budget, setBudget] = useState("");
  const [details, setDetails] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    if (!referrerName.trim()) return setError("กรุณากรอกชื่อผู้แนะนำ");
    if (!projectTitle.trim()) return setError("กรุณากรอกงานที่แนะนำ");
    setError(null);
    startTransition(async () => {
      const res = await addReferralAction({
        referrerName: referrerName.trim(),
        referrerContact: referrerContact.trim() || undefined,
        projectTitle: projectTitle.trim(),
        prospectName: prospectName.trim() || undefined,
        budget: budget ? Number(budget) : undefined,
        details: details.trim() || undefined,
      });
      if (res.ok) {
        setReferrerName("");
        setReferrerContact("");
        setProjectTitle("");
        setProspectName("");
        setBudget("");
        setDetails("");
        setOpen(false);
        router.refresh();
      } else {
        setError(res.error);
      }
    });
  };

  if (!open) {
    return (
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex h-10 items-center rounded-md border border-[#e2ddd0] bg-white px-4 text-body-sm font-medium text-text-primary hover:bg-[#faf8f3]"
        >
          + เพิ่มการแนะนำ (เพิ่มเอง)
        </button>
      </div>
    );
  }

  return (
    <ContentCard className="p-6">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <input
          value={referrerName}
          onChange={(e) => setReferrerName(e.target.value)}
          placeholder="ชื่อผู้แนะนำ / พาร์ทเนอร์"
          className={inputCls}
        />
        <input
          value={referrerContact}
          onChange={(e) => setReferrerContact(e.target.value)}
          placeholder="ช่องทางติดต่อ (เบอร์/อีเมล)"
          className={inputCls}
        />
        <input
          value={projectTitle}
          onChange={(e) => setProjectTitle(e.target.value)}
          placeholder="งานที่แนะนำ"
          className={inputCls}
        />
        <input
          value={prospectName}
          onChange={(e) => setProspectName(e.target.value)}
          placeholder="ชื่อลูกค้าที่แนะนำ (ถ้ามี)"
          className={inputCls}
        />
        <input
          type="number"
          min={0}
          step="0.01"
          inputMode="decimal"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          placeholder="งบประมาณโดยประมาณ (บาท)"
          className={inputCls}
        />
        <input
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          placeholder="รายละเอียดเพิ่มเติม"
          className={inputCls}
        />
      </div>

      {error && <p className="mt-2 text-caption text-danger">{error}</p>}

      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={submit}
          className="inline-flex h-10 items-center rounded-md bg-primary-700 px-4 text-body-sm font-medium text-white hover:bg-primary-600"
        >
          บันทึก
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="inline-flex h-10 items-center rounded-md px-4 text-body-sm font-medium text-text-secondary hover:underline"
        >
          ยกเลิก
        </button>
      </div>
    </ContentCard>
  );
}
