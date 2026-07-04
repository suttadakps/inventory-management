"use client";

import { archiveClient, restoreClient } from "@/lib/clients/actions";
import { Button } from "@/components/ui/Button";

type Size = "sm" | "md";

export function ArchiveClientButton({
  id,
  size = "sm",
}: {
  id: string;
  size?: Size;
}) {
  return (
    <form
      action={archiveClient}
      onSubmit={(e) => {
        if (
          !window.confirm(
            "Archive this client? They will be hidden from the active list. You can restore them later."
          )
        ) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <Button type="submit" variant="danger" size={size}>
        Archive
      </Button>
    </form>
  );
}

export function RestoreClientButton({
  id,
  size = "sm",
}: {
  id: string;
  size?: Size;
}) {
  return (
    <form action={restoreClient}>
      <input type="hidden" name="id" value={id} />
      <Button type="submit" variant="secondary" size={size}>
        Restore
      </Button>
    </form>
  );
}
