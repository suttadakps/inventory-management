import { logout } from "@/lib/auth/actions";
import { requireUser } from "@/lib/auth/session";
import { AppSidebar } from "@/components/layout/AppSidebar";

const ROLE_TH: Record<string, string> = {
  owner: "เจ้าของบริษัท",
  admin: "ผู้ดูแลระบบ",
  ae: "AE / ผู้จัดการโปรเจค",
  site_engineer: "วิศวกรหน้างาน",
  worker: "ช่าง / คนงาน",
  client: "ลูกค้า",
};

/**
 * Cream operations shell used across authenticated ARTIVERGES NEXT pages:
 * a left sidebar plus a top bar carrying the page title/subtitle, the current
 * user, and sign-out. The page passes its own title so the chrome stays shared.
 */
export async function SidebarShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  const user = await requireUser();
  const roleTh = ROLE_TH[user.role] ?? user.role;
  const name = user.fullName ?? user.email;
  const initial = (name ?? "A").trim().charAt(0).toUpperCase();

  return (
    <div className="flex min-h-screen bg-[#f6f3ec]">
      <AppSidebar roleLabel={roleTh} />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-4 border-b border-[#e7e1d5] px-6 py-5 print:hidden">
          <div>
            <h1 className="text-h1 font-bold text-text-primary">{title}</h1>
            {subtitle && (
              <p className="text-body-sm text-text-secondary">{subtitle}</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-700 text-body-sm font-semibold text-white">
                {initial}
              </span>
              <span className="hidden text-body-sm font-medium text-text-primary sm:block">
                {name}
                <span className="text-text-secondary"> / {roleTh}</span>
              </span>
            </div>
            <form action={logout}>
              <button
                type="submit"
                className="rounded-md border border-accent-600 px-3 py-1.5 text-body-sm font-medium text-accent-600 transition-colors hover:bg-accent-100"
              >
                ออกจากระบบ
              </button>
            </form>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6">{children}</main>
      </div>
    </div>
  );
}
