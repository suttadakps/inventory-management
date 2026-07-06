import { Badge, type BadgeTone } from "@/components/ui/Badge";

const MAP: Record<string, { label: string; tone: BadgeTone }> = {
  draft: { label: "Draft", tone: "neutral" },
  sent: { label: "Sent", tone: "info" },
  viewed: { label: "Viewed", tone: "info" },
  approved: { label: "Approved", tone: "success" },
  rejected: { label: "Rejected", tone: "danger" },
  expired: { label: "Expired", tone: "warning" },
  revised: { label: "Revised", tone: "neutral" },
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
    return <Badge tone="warning">Expired</Badge>;
  }
  const e = MAP[status] ?? { label: status, tone: "neutral" as BadgeTone };
  return <Badge tone={e.tone}>{e.label}</Badge>;
}
