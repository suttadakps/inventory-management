"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { addExpenseAction } from "@/lib/costs/actions";
import { ContentCard } from "@/components/ui/ContentCard";

type ProjectOption = { id: string; name: string };

const CATEGORIES = [
  "วัสดุ",
  "ค่าแรง",
  "อุปกรณ์/เครื่องมือ",
  "ค่าขนส่ง",
  "ค่าจ้างเหมา",
  "อื่นๆ",
] as const;

const inputCls =
  "h-11 rounded-md border border-[#e2ddd0] bg-white px-3 text-body-sm text-text-primary focus:border-primary-600 focus:outline-none";

const todayStr = () => new Date().toISOString().slice(0, 10);

export function CostForm({ projects }: { projects: ProjectOption[] }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [projectId, setProjectId] = useState("");
  const [category, setCategory] = useState<string>(CATEGORIES[0] ?? "วัสดุ");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(todayStr());
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    const amt = Number(amount);
    if (!(amt > 0)) return setError("กรุณากรอกจำนวนเงิน");
    setError(null);
    startTransition(async () => {
      const res = await addExpenseAction({
        projectId: projectId || undefined,
        category,
        amount: amt,
        date,
        description: description.trim() || undefined,
      });
      if (res.ok) {
        setAmount("");
        setDescription("");
        setDate(todayStr());
        router.refresh();
      } else {
        setError(res.error);
      }
    });
  };

  return (
    <ContentCard className="p-6">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <select
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
          className={inputCls}
        >
          <option value="">— เลือกโปรเจค (ไม่บังคับ / ต้นทุนส่วนกลาง) —</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className={inputCls}
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <input
          type="number"
          min={0}
          step="0.01"
          inputMode="decimal"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="จำนวนเงิน (บาท)"
          className={inputCls}
        />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className={inputCls}
        />
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="รายละเอียด / ผู้ขาย"
          className={`${inputCls} sm:col-span-2`}
        />
      </div>

      {error && <p className="mt-2 text-caption text-danger">{error}</p>}

      <button
        type="button"
        onClick={submit}
        className="mt-4 h-11 w-full rounded-md bg-primary-700 text-body-sm font-medium text-white transition-colors hover:bg-primary-600"
      >
        + บันทึกต้นทุน
      </button>
    </ContentCard>
  );
}
