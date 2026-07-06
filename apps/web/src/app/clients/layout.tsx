import { redirect } from "next/navigation";

import { requireUser } from "@/lib/auth/session";
import { canViewClients } from "@/lib/clients/permissions";
import { SidebarShell } from "@/components/layout/SidebarShell";

export default async function ClientsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  if (!canViewClients(user.role)) redirect("/dashboard");

  return (
    <SidebarShell title="ลูกค้า" subtitle="จัดการข้อมูลลูกค้าทั้งหมด">
      {children}
    </SidebarShell>
  );
}
