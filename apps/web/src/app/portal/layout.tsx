import { SidebarShell } from "@/components/layout/SidebarShell";

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarShell title="พอร์ทัลลูกค้า" subtitle="ภาพรวมโปรเจคสำหรับลูกค้า">
      {children}
    </SidebarShell>
  );
}
