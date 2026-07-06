"use client";

/**
 * "Email ready" — opens the user's mail client with a pre-filled message to the
 * client, including the quotation number, total, and a link. (Server-side email
 * delivery is a future integration; see docs/03 §11.)
 */
export function EmailButton({
  to,
  quotationNo,
  total,
  path,
}: {
  to: string | null;
  quotationNo: string;
  total: string;
  path: string;
}) {
  const origin =
    process.env.NEXT_PUBLIC_SITE_URL ??
    (typeof window !== "undefined" ? window.location.origin : "");
  const link = `${origin}${path}`;
  const subject = `Quotation ${quotationNo} from ARTIVERGES GROUP`;
  const body = [
    "Dear Client,",
    "",
    `Please find our quotation ${quotationNo} for your project.`,
    `Grand total: ${total}.`,
    "",
    `You can review it here: ${link}`,
    "",
    "Kind regards,",
    "ARTIVERGES GROUP",
  ].join("\n");

  const href = `mailto:${to ?? ""}?subject=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(body)}`;

  return (
    <a
      href={href}
      className="inline-flex h-9 items-center rounded-sm border border-border bg-surface px-3 text-body-sm font-medium text-text-primary hover:bg-primary-100"
      title={to ? `Email ${to}` : "No client email on file"}
    >
      Email
    </a>
  );
}
