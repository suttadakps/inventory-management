import { SidebarShell } from "@/components/layout/SidebarShell";

export default function UsersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarShell
      title="ผู้ใช้งาน"
      subtitle="บัญชีลูกค้า วิศวกร และช่าง สำหรับดูความคืบหน้าหน้างาน"
    >
      {children}
    </SidebarShell>
  );
}
