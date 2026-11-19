import { redirect } from "next/navigation";

/**
 * The old client portal showed contract value, received and outstanding — the
 * exact figures clients are no longer meant to see. It has been replaced by
 * /site, which shows progress, milestones and photos and no money at all.
 * Kept as a redirect so any bookmark still lands somewhere sensible.
 */
export default function PortalRedirect() {
  redirect("/site");
}
