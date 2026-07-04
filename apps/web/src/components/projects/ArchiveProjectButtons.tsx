"use client";

import { archiveProject, restoreProject } from "@/lib/projects/actions";
import { Button } from "@/components/ui/Button";

type Size = "sm" | "md";

export function ArchiveProjectButton({
  id,
  size = "sm",
}: {
  id: string;
  size?: Size;
}) {
  return (
    <form
      action={archiveProject}
      onSubmit={(e) => {
        if (
          !window.confirm(
            "Archive this project? It will be hidden from the active list. You can restore it later."
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

export function RestoreProjectButton({
  id,
  size = "sm",
}: {
  id: string;
  size?: Size;
}) {
  return (
    <form action={restoreProject}>
      <input type="hidden" name="id" value={id} />
      <Button type="submit" variant="secondary" size={size}>
        Restore
      </Button>
    </form>
  );
}
