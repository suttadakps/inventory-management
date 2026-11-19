"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import {
  addSiteLogAction,
  deleteSiteLogAction,
  setSiteLogStatusAction,
  type SiteLogFormInput,
} from "@/lib/site/actions";
import type {
  SiteLogItem,
  SiteLogKind,
  SiteLogStatus,
  SiteMilestone,
} from "@/lib/site/repository";
import { StatusBadge, type StatusTone } from "@/components/ui/StatusBadge";

/**
 * The six lists a site update has to carry besides the milestones. They share
 * a row shape, so they share one component and differ only in which extra
 * fields the form shows and what the status words mean.
 */
const KINDS: {
  key: SiteLogKind;
  label: string;
  blank: string;
  /** Which optional columns this kind actually uses. */
  fields: (
    | "days"
    | "cost"
    | "ref"
    | "revision"
    | "approved"
    | "ordered"
    | "eta"
    | "arrived"
  )[];
  dueLabel: string;
  ownerLabel: string;
}[] = [
  {
    key: "issue",
    label: "ปัญหา/ติดขัด",
    blank: "ไม่มีปัญหาค้างอยู่",
    fields: [],
    dueLabel: "แก้ภายใน",
    ownerLabel: "ผู้รับผิดชอบ",
  },
  {
    key: "approval",
    label: "รออนุมัติ/รอคำตอบ",
    blank: "ไม่มีรายการรอคำตอบ",
    fields: [],
    dueLabel: "ต้องการคำตอบภายใน",
    ownerLabel: "ผู้ตัดสินใจ",
  },
  {
    key: "variation",
    label: "งานเปลี่ยนแปลง",
    blank: "ไม่มีงานเปลี่ยนแปลง",
    fields: ["days", "cost", "ref"],
    dueLabel: "ต้องการคำตอบภายใน",
    ownerLabel: "ผู้เสนอ",
  },
  {
    key: "material",
    label: "วัสดุ/อุปกรณ์",
    blank: "ไม่มีรายการวัสดุที่ติดตาม",
    fields: ["ordered", "eta", "arrived"],
    dueLabel: "ต้องใช้ภายใน",
    ownerLabel: "ผู้สั่งซื้อ",
  },
  {
    key: "document",
    label: "แบบ/เอกสาร",
    blank: "ยังไม่มีแบบที่บันทึกไว้",
    fields: ["revision", "approved", "ref"],
    dueLabel: "ต้องใช้ภายใน",
    ownerLabel: "ผู้จัดทำ",
  },
  {
    key: "lookahead",
    label: "แผนช่วงถัดไป",
    blank: "ยังไม่มีแผนช่วงถัดไป",
    fields: [],
    dueLabel: "สัปดาห์/วันที่",
    ownerLabel: "ทีมที่รับผิดชอบ",
  },
];

const STATUS_LABEL: Record<
  SiteLogKind,
  Partial<Record<SiteLogStatus, string>>
> = {
  issue: { open: "ยังไม่แก้", waiting: "กำลังแก้", resolved: "แก้แล้ว" },
  approval: { open: "รอคำตอบ", waiting: "กำลังพิจารณา", resolved: "อนุมัติแล้ว", rejected: "ไม่อนุมัติ" },
  variation: { open: "เสนอแล้ว", waiting: "รออนุมัติ", resolved: "อนุมัติแล้ว", rejected: "ไม่อนุมัติ" },
  material: { open: "ยังไม่สั่ง", waiting: "สั่งแล้ว รอของ", resolved: "ของถึงแล้ว" },
  document: { open: "ร่าง", waiting: "รออนุมัติ", resolved: "ใช้ฉบับนี้", rejected: "ยกเลิก" },
  lookahead: { open: "วางแผนไว้", waiting: "กำลังทำ", resolved: "เสร็จแล้ว" },
};

const STATUS_TONE: Record<SiteLogStatus, StatusTone> = {
  open: "amber",
  waiting: "navy",
  resolved: "green",
  rejected: "red",
  cancelled: "gray",
};

const dateFmt = new Intl.DateTimeFormat("th-TH", {
  day: "numeric",
  month: "short",
  year: "2-digit",
});
const fmt = (s: string | null) => (s ? dateFmt.format(new Date(s)) : null);

const inputCls =
  "h-10 w-full rounded-md border border-[#e2ddd0] bg-white px-3 text-body-sm text-text-primary focus:border-primary-600 focus:outline-none";

const EMPTY: SiteLogFormInput = {
  kind: "issue",
  title: "",
  detail: "",
  ownerName: "",
  dueDate: "",
  milestoneId: "",
  daysImpact: "",
  costImpact: "",
  refDoc: "",
  revision: "",
  approvedAt: "",
  orderedAt: "",
  etaAt: "",
  arrivedAt: "",
};

/** True once the due date has passed and the item is still unanswered. */
function isLate(item: SiteLogItem): boolean {
  if (!item.dueDate) return false;
  if (item.status === "resolved" || item.status === "rejected") return false;
  return new Date(item.dueDate) < new Date(new Date().toDateString());
}

export function SiteLog({
  projectId,
  log,
  milestones,
  canEdit,
  canAnswer,
  canSeeCost,
}: {
  projectId: string;
  log: SiteLogItem[];
  milestones: SiteMilestone[];
  canEdit: boolean;
  canAnswer: boolean;
  canSeeCost: boolean;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [active, setActive] = useState<SiteLogKind>("issue");
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState<SiteLogFormInput>(EMPTY);
  const [answering, setAnswering] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  const spec = KINDS.find((k) => k.key === active)!;
  const items = useMemo(
    () => log.filter((e) => e.kind === active),
    [log, active]
  );

  const openCount = (kind: SiteLogKind) =>
    log.filter(
      (e) =>
        e.kind === kind && e.status !== "resolved" && e.status !== "rejected"
    ).length;

  const set = <K extends keyof SiteLogFormInput>(
    k: K,
    v: SiteLogFormInput[K]
  ) => setForm((f) => ({ ...f, [k]: v }));

  const submit = () => {
    if (!form.title.trim()) {
      setError("กรุณากรอกหัวข้อ");
      return;
    }
    setError(null);
    startTransition(async () => {
      const res = await addSiteLogAction(projectId, { ...form, kind: active });
      if (res.ok) {
        setForm(EMPTY);
        setAdding(false);
        router.refresh();
      } else setError(res.error);
    });
  };

  const answer = (id: string, status: SiteLogStatus) =>
    startTransition(async () => {
      const res = await setSiteLogStatusAction(id, status, note);
      if (res.ok) {
        setAnswering(null);
        setNote("");
        router.refresh();
      } else setError(res.error);
    });

  const remove = (id: string) =>
    startTransition(async () => {
      await deleteSiteLogAction(id);
      router.refresh();
    });

  return (
    <div className="space-y-4">
      {/* Kind switcher, with a count of what is still outstanding. */}
      <div className="-mx-1 flex gap-1 overflow-x-auto pb-1">
        {KINDS.map((k) => {
          const n = openCount(k.key);
          const on = k.key === active;
          return (
            <button
              key={k.key}
              type="button"
              onClick={() => {
                setActive(k.key);
                setAdding(false);
                setError(null);
              }}
              className={`shrink-0 rounded-full px-3 py-1.5 text-body-sm font-medium transition-colors ${
                on
                  ? "bg-primary-700 text-white"
                  : "bg-[#f0ece2] text-text-secondary hover:bg-[#e7e1d5]"
              }`}
            >
              {k.label}
              {n > 0 && (
                <span
                  className={`ml-1.5 rounded-full px-1.5 text-caption tabular-nums ${
                    on ? "bg-white/25" : "bg-white text-text-primary"
                  }`}
                >
                  {n}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {error && <p className="text-caption text-danger">{error}</p>}

      {items.length === 0 ? (
        <p className="text-body-sm text-text-secondary">{spec.blank}</p>
      ) : (
        <ul className="divide-y divide-[#f0ece2]">
          {items.map((e) => {
            const late = isLate(e);
            const label =
              STATUS_LABEL[e.kind][e.status] ?? e.status;
            return (
              <li key={e.id} className="py-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-body-sm font-medium text-text-primary">
                        {e.title}
                      </span>
                      <StatusBadge tone={STATUS_TONE[e.status]}>
                        {label}
                      </StatusBadge>
                      {late && <StatusBadge tone="red">เลยกำหนด</StatusBadge>}
                    </div>

                    {e.detail && (
                      <p className="mt-0.5 text-caption leading-snug text-text-secondary">
                        {e.detail}
                      </p>
                    )}

                    <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-caption text-text-secondary">
                      {e.milestoneName && <span>งาน: {e.milestoneName}</span>}
                      {e.ownerName && (
                        <span>
                          {spec.ownerLabel}: {e.ownerName}
                        </span>
                      )}
                      {e.dueDate && (
                        <span className={late ? "text-danger" : undefined}>
                          {spec.dueLabel} {fmt(e.dueDate)}
                        </span>
                      )}
                      {e.daysImpact !== null && (
                        <span>กระทบเวลา +{e.daysImpact} วัน</span>
                      )}
                      {canSeeCost && e.costImpact !== null && (
                        <span>
                          กระทบราคา{" "}
                          {e.costImpact.toLocaleString("th-TH", {
                            minimumFractionDigits: 2,
                          })}{" "}
                          บาท
                        </span>
                      )}
                      {e.revision && <span>Revision {e.revision}</span>}
                      {e.approvedAt && <span>อนุมัติ {fmt(e.approvedAt)}</span>}
                      {e.orderedAt && <span>สั่ง {fmt(e.orderedAt)}</span>}
                      {e.etaAt && <span>กำหนดเข้า {fmt(e.etaAt)}</span>}
                      {e.arrivedAt && (
                        <span className="text-success">
                          เข้าจริง {fmt(e.arrivedAt)}
                        </span>
                      )}
                      {e.refDoc && <span>อ้างอิง: {e.refDoc}</span>}
                    </div>

                    {e.responseNote && (
                      <p className="mt-1 rounded-md bg-[#faf8f3] px-2 py-1 text-caption text-text-secondary">
                        {e.responseNote}
                        {e.respondedByName && (
                          <span className="block text-text-primary">
                            — {e.respondedByName}
                          </span>
                        )}
                      </p>
                    )}
                  </div>

                  {canEdit && (
                    <button
                      type="button"
                      onClick={() => remove(e.id)}
                      aria-label={`ลบ ${e.title}`}
                      className="shrink-0 text-text-secondary hover:text-danger"
                    >
                      ×
                    </button>
                  )}
                </div>

                {/* Answering: the one write a client role has. */}
                {(canEdit || canAnswer) &&
                  e.status !== "resolved" &&
                  e.status !== "rejected" && (
                    <div className="mt-2">
                      {answering === e.id ? (
                        <div className="space-y-2">
                          <input
                            value={note}
                            onChange={(ev) => setNote(ev.target.value)}
                            placeholder="คอมเมนต์ (ไม่บังคับ)"
                            className={inputCls}
                          />
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => answer(e.id, "resolved")}
                              className="inline-flex h-9 items-center rounded-md bg-success px-3 text-body-sm font-medium text-white"
                            >
                              {e.kind === "issue"
                                ? "แก้แล้ว"
                                : e.kind === "material"
                                  ? "ของถึงแล้ว"
                                  : "อนุมัติ"}
                            </button>
                            <button
                              type="button"
                              onClick={() => answer(e.id, "rejected")}
                              className="inline-flex h-9 items-center rounded-md border border-[#f0d4cf] px-3 text-body-sm font-medium text-danger"
                            >
                              ไม่อนุมัติ
                            </button>
                            {canEdit && (
                              <button
                                type="button"
                                onClick={() => answer(e.id, "waiting")}
                                className="inline-flex h-9 items-center rounded-md border border-[#e2ddd0] px-3 text-body-sm text-text-primary"
                              >
                                กำลังดำเนินการ
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                setAnswering(null);
                                setNote("");
                              }}
                              className="inline-flex h-9 items-center px-2 text-body-sm text-text-secondary"
                            >
                              ยกเลิก
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setAnswering(e.id);
                            setNote("");
                          }}
                          className="text-body-sm font-medium text-primary-700 hover:underline"
                        >
                          ตอบรายการนี้
                        </button>
                      )}
                    </div>
                  )}
              </li>
            );
          })}
        </ul>
      )}

      {canEdit && (
        <div className="border-t border-[#f0ece2] pt-3">
          {!adding ? (
            <button
              type="button"
              onClick={() => setAdding(true)}
              className="inline-flex h-9 items-center rounded-md border border-[#e2ddd0] bg-white px-3 text-body-sm font-medium text-text-primary hover:bg-[#faf8f3]"
            >
              + เพิ่ม{spec.label}
            </button>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <input
                  value={form.title}
                  onChange={(e) => set("title", e.target.value)}
                  placeholder="หัวข้อ เช่น รอแบบห้องน้ำ ทำให้งานระบบเริ่มไม่ได้"
                  className={inputCls}
                />
              </div>
              <div className="sm:col-span-2">
                <textarea
                  value={form.detail}
                  onChange={(e) => set("detail", e.target.value)}
                  placeholder="รายละเอียด / สิ่งที่ต้องได้ก่อนเริ่ม"
                  rows={2}
                  className="w-full rounded-md border border-[#e2ddd0] bg-white px-3 py-2 text-body-sm text-text-primary focus:border-primary-600 focus:outline-none"
                />
              </div>
              <input
                value={form.ownerName}
                onChange={(e) => set("ownerName", e.target.value)}
                placeholder={spec.ownerLabel}
                className={inputCls}
              />
              <label className="flex items-center gap-2 text-caption text-text-secondary">
                {spec.dueLabel}
                <input
                  type="date"
                  value={form.dueDate}
                  onChange={(e) => set("dueDate", e.target.value)}
                  className={inputCls}
                />
              </label>
              <select
                value={form.milestoneId}
                onChange={(e) => set("milestoneId", e.target.value)}
                className={`${inputCls} sm:col-span-2`}
              >
                <option value="">— ไม่ผูกกับขั้นตอนไหน —</option>
                {milestones.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>

              {spec.fields.includes("days") && (
                <input
                  value={form.daysImpact}
                  onChange={(e) => set("daysImpact", e.target.value)}
                  inputMode="numeric"
                  placeholder="กระทบเวลา (วัน)"
                  className={inputCls}
                />
              )}
              {spec.fields.includes("cost") && canSeeCost && (
                <input
                  value={form.costImpact}
                  onChange={(e) => set("costImpact", e.target.value)}
                  inputMode="decimal"
                  placeholder="กระทบราคา (บาท) — ไม่แสดงให้ลูกค้า"
                  className={inputCls}
                />
              )}
              {spec.fields.includes("revision") && (
                <input
                  value={form.revision}
                  onChange={(e) => set("revision", e.target.value)}
                  placeholder="Revision เช่น Rev.C"
                  className={inputCls}
                />
              )}
              {spec.fields.includes("approved") && (
                <label className="flex items-center gap-2 text-caption text-text-secondary">
                  อนุมัติเมื่อ
                  <input
                    type="date"
                    value={form.approvedAt}
                    onChange={(e) => set("approvedAt", e.target.value)}
                    className={inputCls}
                  />
                </label>
              )}
              {spec.fields.includes("ordered") && (
                <label className="flex items-center gap-2 text-caption text-text-secondary">
                  สั่งเมื่อ
                  <input
                    type="date"
                    value={form.orderedAt}
                    onChange={(e) => set("orderedAt", e.target.value)}
                    className={inputCls}
                  />
                </label>
              )}
              {spec.fields.includes("eta") && (
                <label className="flex items-center gap-2 text-caption text-text-secondary">
                  กำหนดเข้าไซต์
                  <input
                    type="date"
                    value={form.etaAt}
                    onChange={(e) => set("etaAt", e.target.value)}
                    className={inputCls}
                  />
                </label>
              )}
              {spec.fields.includes("arrived") && (
                <label className="flex items-center gap-2 text-caption text-text-secondary">
                  เข้าจริง
                  <input
                    type="date"
                    value={form.arrivedAt}
                    onChange={(e) => set("arrivedAt", e.target.value)}
                    className={inputCls}
                  />
                </label>
              )}
              {spec.fields.includes("ref") && (
                <input
                  value={form.refDoc}
                  onChange={(e) => set("refDoc", e.target.value)}
                  placeholder="เอกสารอ้างอิง / ลิงก์"
                  className={`${inputCls} sm:col-span-2`}
                />
              )}

              <div className="flex gap-2 sm:col-span-2">
                <button
                  type="button"
                  onClick={submit}
                  className="inline-flex h-10 items-center rounded-md bg-primary-700 px-4 text-body-sm font-medium text-white hover:bg-primary-600"
                >
                  บันทึก
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAdding(false);
                    setForm(EMPTY);
                    setError(null);
                  }}
                  className="inline-flex h-10 items-center px-3 text-body-sm text-text-secondary"
                >
                  ยกเลิก
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
