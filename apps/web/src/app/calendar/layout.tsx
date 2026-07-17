import { SidebarShell } from "@/components/layout/SidebarShell";

export default function CalendarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarShell
      title="ปฏิทินโปรเจค"
      subtitle="ไทม์ไลน์สถานะของทุกโปรเจค รวมในปฏิทินเดียว"
    >
      {children}
    </SidebarShell>
  );
}
