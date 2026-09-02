import { Badge, type BadgeTone } from "@/components/ui/Badge";

type Status =
  | "quotation"
  | "lost"
  | "planning"
  | "approved"
  | "started"
  | "active"
  | "on_hold"
  | "completed"
  | "warranty"
  | "closed";

const MAP: Record<Status, { label: string; tone: BadgeTone }> = {
  quotation: { label: "Quotation Sent", tone: "neutral" },
  lost: { label: "Lost", tone: "danger" },
  planning: { label: "Planning", tone: "neutral" },
  approved: { label: "Approved", tone: "neutral" },
  started: { label: "Started", tone: "info" },
  active: { label: "Active", tone: "info" },
  on_hold: { label: "On Hold", tone: "warning" },
  completed: { label: "Completed", tone: "success" },
  warranty: { label: "Warranty", tone: "success" },
  closed: { label: "Closed", tone: "neutral" },
};

export function ProjectStatusBadge({ status }: { status: string }) {
  const entry = MAP[status as Status] ?? { label: status, tone: "neutral" };
  return <Badge tone={entry.tone}>{entry.label}</Badge>;
}

export const STATUS_LABELS: Record<Status, string> = {
  quotation: "Quotation Sent",
  lost: "Lost",
  planning: "Planning",
  approved: "Approved",
  started: "Started",
  active: "Active",
  on_hold: "On Hold",
  completed: "Completed",
  warranty: "Warranty",
  closed: "Closed",
};
