import { SidebarShell } from "@/components/layout/SidebarShell";

export default function WorkersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarShell title="รายชื่อช่าง" subtitle="ทะเบียนช่างสำหรับออกใบทวิ 50">
      {children}
    </SidebarShell>
  );
}
