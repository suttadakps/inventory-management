import { StatusBadge, type StatusTone } from "@/components/ui/StatusBadge";

const MAP: Record<string, { label: string; tone: StatusTone }> = {
  draft: { label: "ร่าง", tone: "gray" },
  sent: { label: "ส่งแล้ว", tone: "navy" },
  viewed: { label: "เปิดดูแล้ว", tone: "navy" },
  approved: { label: "อนุมัติแล้ว", tone: "green" },
  rejected: { label: "ปฏิเสธ", tone: "red" },
  expired: { label: "หมดอายุ", tone: "amber" },
  revised: { label: "แก้ไขแล้ว", tone: "gray" },
};

export function QuotationStatusBadge({
  status,
  expired,
}: {
  status: string;
  expired?: boolean;
}) {
  // Surface an overdue (sent/viewed past expiry) quotation even before it is
  // formally marked expired.
  if (expired && (status === "sent" || status === "viewed")) {
    return <StatusBadge tone="amber">หมดอายุ</StatusBadge>;
  }
  const e = MAP[status] ?? { label: status, tone: "gray" as StatusTone };
  return <StatusBadge tone={e.tone}>{e.label}</StatusBadge>;
}
