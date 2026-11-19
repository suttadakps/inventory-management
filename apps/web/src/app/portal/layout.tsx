import { SidebarShell } from "@/components/layout/SidebarShell";

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarShell
      title="ภาพรวมลูกค้า"
      subtitle="มูลค่างาน ยอดรับแล้ว และค้างรับ รายโปรเจค — สำหรับทีมงานเท่านั้น"
    >
      {children}
    </SidebarShell>
  );
}
