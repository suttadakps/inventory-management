import { SidebarShell } from "@/components/layout/SidebarShell";

export default function MyProjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarShell
      title="โปรเจคของฉัน (AE)"
      subtitle="โปรเจคที่คุณนำไปขายและค่าคอมมิชชั่น"
    >
      {children}
    </SidebarShell>
  );
}
