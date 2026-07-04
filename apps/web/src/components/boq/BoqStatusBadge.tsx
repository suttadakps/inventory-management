import { Badge, type BadgeTone } from "@/components/ui/Badge";

const MAP: Record<string, { label: string; tone: BadgeTone }> = {
  draft: { label: "Draft", tone: "neutral" },
  submitted: { label: "Submitted", tone: "warning" },
  approved: { label: "Approved", tone: "success" },
  archived: { label: "Archived", tone: "neutral" },
  finalized: { label: "Finalized", tone: "info" },
  superseded: { label: "Superseded", tone: "neutral" },
};

export function BoqStatusBadge({ status }: { status: string }) {
  const e = MAP[status] ?? { label: status, tone: "neutral" as BadgeTone };
  return <Badge tone={e.tone}>{e.label}</Badge>;
}
