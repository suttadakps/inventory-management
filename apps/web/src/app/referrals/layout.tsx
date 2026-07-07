import { redirect } from "next/navigation";

import { requireUser } from "@/lib/auth/session";
import { canManageReferrals } from "@/lib/referrals/repository";
import { SidebarShell } from "@/components/layout/SidebarShell";

export default async function ReferralsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  if (!canManageReferrals(user.role)) redirect("/dashboard");

  return (
    <SidebarShell
      title="พาร์ทเนอร์แนะนำงาน"
      subtitle="งานที่แนะนำเข้ามาจากเว็บไซต์ และสถานะการติดต่อกลับ"
    >
      {children}
    </SidebarShell>
  );
}
