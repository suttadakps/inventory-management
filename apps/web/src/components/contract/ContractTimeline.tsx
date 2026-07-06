import type { ContractDetailDto } from "@/lib/contract/repository";

function fmt(ts: string | null): string {
  return ts ? new Date(ts).toLocaleString() : "—";
}

const ACTION_LABEL: Record<string, string> = {
  created: "Contract created",
  updated: "Details updated",
  status_changed: "Status changed",
  version_created: "New version cut",
  milestone_added: "Milestone added",
  milestone_updated: "Milestone updated",
  milestone_status: "Milestone status updated",
  milestone_deleted: "Milestone deleted",
  comment_added: "Comment added",
  comment_deleted: "Comment deleted",
  file_added: "Attachment added",
  file_removed: "Attachment removed",
  archived: "Archived",
  restored: "Restored",
};

export function ContractTimeline({ contract }: { contract: ContractDetailDto }) {
  const steps: { label: string; at: string | null; done: boolean }[] = [
    { label: "Created", at: contract.createdAt, done: true },
    { label: "Submitted for approval", at: null, done: contract.status !== "draft" },
    { label: "Approved", at: contract.approvedAt, done: !!contract.approvedAt },
    { label: "Signed", at: contract.signedAt, done: !!contract.signedAt },
    { label: "Completed", at: contract.completedAt, done: !!contract.completedAt },
  ];
  if (contract.cancelledAt) {
    steps.push({ label: "Cancelled", at: contract.cancelledAt, done: true });
  }

  return (
    <div className="space-y-6">
      <section className="rounded-md border border-border bg-surface p-6">
        <h2 className="mb-4 text-h3 font-semibold text-text-primary">
          Approval timeline
        </h2>
        <ol className="space-y-4">
          {steps.map((s, i) => (
            <li key={i} className="flex gap-3">
              <span
                className={`mt-1 h-3 w-3 shrink-0 rounded-full ${
                  s.done ? "bg-success" : "bg-border"
                }`}
                aria-hidden
              />
              <div>
                <div
                  className={
                    s.done
                      ? "text-body-sm font-medium text-text-primary"
                      : "text-body-sm text-text-secondary"
                  }
                >
                  {s.label}
                </div>
                {s.at && (
                  <div className="text-caption text-text-secondary">{fmt(s.at)}</div>
                )}
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="rounded-md border border-border bg-surface p-6">
        <h2 className="mb-4 text-h3 font-semibold text-text-primary">Audit log</h2>
        {contract.logs.length === 0 ? (
          <p className="text-body-sm text-text-secondary">No activity yet.</p>
        ) : (
          <ul className="space-y-3">
            {contract.logs.map((l) => (
              <li key={l.id} className="text-body-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-text-primary">
                    {ACTION_LABEL[l.action] ?? l.action}
                    {l.detail ? (
                      <span className="font-normal text-text-secondary">
                        {" "}
                        — {l.detail}
                      </span>
                    ) : null}
                  </span>
                  <span className="shrink-0 text-caption text-text-secondary">
                    {fmt(l.createdAt)}
                  </span>
                </div>
                {l.actorName && (
                  <div className="text-caption text-text-secondary">
                    by {l.actorName}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
