import { Badge, type BadgeTone } from "@/components/ui/Badge";

const MAP: Record<string, { label: string; tone: BadgeTone }> = {
  draft: { label: "Draft", tone: "neutral" },
  pending_approval: { label: "Pending Approval", tone: "warning" },
  approved: { label: "Approved", tone: "info" },
  signed: { label: "Signed", tone: "success" },
  cancelled: { label: "Cancelled", tone: "danger" },
  completed: { label: "Completed", tone: "success" },
};

export function ContractStatusBadge({ status }: { status: string }) {
  const e = MAP[status] ?? { label: status, tone: "neutral" as BadgeTone };
  return <Badge tone={e.tone}>{e.label}</Badge>;
}
