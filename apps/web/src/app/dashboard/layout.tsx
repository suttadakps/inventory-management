import { SidebarShell } from "@/components/layout/SidebarShell";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarShell title="Dashboard" subtitle="ภาพรวมบริษัทแบบเรียลไทม์">
      {children}
    </SidebarShell>
  );
}
