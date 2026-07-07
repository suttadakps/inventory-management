import { SidebarShell } from "@/components/layout/SidebarShell";

export default function CostsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarShell
      title="บันทึกต้นทุน"
      subtitle="บันทึกและติดตามต้นทุนของแต่ละโปรเจค"
    >
      {children}
    </SidebarShell>
  );
}
