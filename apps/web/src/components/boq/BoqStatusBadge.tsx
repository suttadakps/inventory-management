import { StatusBadge, type StatusTone } from "@/components/ui/StatusBadge";

const MAP: Record<string, { label: string; tone: StatusTone }> = {
  draft: { label: "ร่าง", tone: "gray" },
  submitted: { label: "รออนุมัติ", tone: "amber" },
  approved: { label: "อนุมัติแล้ว", tone: "green" },
  archived: { label: "เก็บถาวร", tone: "gray" },
  finalized: { label: "สรุปแล้ว", tone: "navy" },
  superseded: { label: "ถูกแทนที่", tone: "gray" },
};

export function BoqStatusBadge({ status }: { status: string }) {
  const e = MAP[status] ?? { label: status, tone: "gray" as StatusTone };
  return <StatusBadge tone={e.tone}>{e.label}</StatusBadge>;
}
