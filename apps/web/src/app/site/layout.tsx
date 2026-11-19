import Image from "next/image";
import Link from "next/link";

import { logout } from "@/lib/auth/actions";
import { requireUser } from "@/lib/auth/session";
import { isPortalRole } from "@/lib/auth/roles";

/**
 * Shell for the site portal — deliberately *not* SidebarShell.
 *
 * Clients, site engineers and workers get this and nothing else: a logo, who
 * they are, a way out, and the page. There is no navigation to the back
 * office because there is nothing in the back office they are allowed to see.
 */
export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  const name = user.fullName ?? user.email;
  const initial = (name ?? "A").trim().charAt(0).toUpperCase();
  // Back-office staff open this page to see what the client sees; without a
  // way out they would be stuck here, since this shell has no sidebar.
  const isStaff = !isPortalRole(user.role);

  return (
    <div className="min-h-screen bg-[#f6f3ec]">
      <header className="border-b border-[#e7e1d5] bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link href="/site" className="flex items-center">
            <Image
              src="/artiverges-next-logo.png"
              alt="ARTIVERGES NEXT"
              width={170}
              height={40}
              priority
              style={{ height: "auto", width: "130px" }}
            />
          </Link>

          <div className="flex items-center gap-3">
            {isStaff && (
              <Link
                href="/dashboard"
                className="hidden rounded-md border border-[#e2ddd0] px-3 py-1.5 text-body-sm font-medium text-text-primary transition-colors hover:bg-[#faf8f3] sm:block"
              >
                ← หลังบ้าน
              </Link>
            )}
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-700 text-body-sm font-semibold text-white">
              {initial}
            </span>
            <span className="hidden text-body-sm font-medium text-text-primary sm:block">
              {name}
            </span>
            <form action={logout}>
              <button
                type="submit"
                className="rounded-md border border-accent-600 px-3 py-1.5 text-body-sm font-medium text-accent-600 transition-colors hover:bg-accent-100"
              >
                ออกจากระบบ
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6">{children}</main>
    </div>
  );
}
