"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { addWageAction } from "@/lib/wages/actions";
import { ContentCard } from "@/components/ui/ContentCard";

type ProjectOption = { id: string; name: string };

const inputCls =
  "h-11 rounded-md border border-[#e2ddd0] bg-white px-3 text-body-sm text-text-primary focus:border-primary-600 focus:outline-none";

const todayStr = () => new Date().toISOString().slice(0, 10);

export function WageForm({ projects }: { projects: ProjectOption[] }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [worker, setWorker] = useState("");
  const [role, setRole] = useState("");
  const [projectId, setProjectId] = useState("");
  const [days, setDays] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(todayStr());
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    if (!worker.trim()) return setError("กรุณากรอกชื่อคนงาน");
    const amt = Number(amount);
    if (!(amt > 0)) return setError("กรุณากรอกค่าแรง");
    setError(null);
    startTransition(async () => {
      const res = await addWageAction({
        workerName: worker.trim(),
        roleLabel: role.trim() || undefined,
        projectId: projectId || undefined,
        daysWorked: days ? Number(days) : undefined,
        amount: amt,
        workDate: date || undefined,
      });
      if (res.ok) {
        setWorker("");
        setRole("");
        setDays("");
        setAmount("");
        setDate(todayStr());
        router.refresh();
      } else {
        setError(res.error);
      }
    });
  };

  return (
    <ContentCard className="p-6">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <input
          value={worker}
          onChange={(e) => setWorker(e.target.value)}
          placeholder="ชื่อคนงาน / ช่าง"
          className={inputCls}
        />
        <input
          value={role}
          onChange={(e) => setRole(e.target.value)}
          placeholder="ตำแหน่ง (เช่น ช่างปูน)"
          className={inputCls}
        />
        <select
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
          className={inputCls}
        >
          <option value="">— เลือกโปรเจค (ไม่บังคับ) —</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <input
          type="number"
          min={0}
          step="0.5"
          inputMode="decimal"
          value={days}
          onChange={(e) => setDays(e.target.value)}
          placeholder="จำนวนวัน"
          className={inputCls}
        />
        <input
          type="number"
          min={0}
          step="0.01"
          inputMode="decimal"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="ค่าแรง (บาท)"
          className={inputCls}
        />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className={inputCls}
        />
      </div>

      {error && <p className="mt-2 text-caption text-danger">{error}</p>}

      <button
        type="button"
        onClick={submit}
        className="mt-4 h-11 w-full rounded-md bg-primary-700 text-body-sm font-medium text-white transition-colors hover:bg-primary-600"
      >
        + บันทึกค่าแรง
      </button>
    </ContentCard>
  );
}
