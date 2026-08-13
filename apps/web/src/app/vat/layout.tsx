import { SidebarShell } from "@/components/layout/SidebarShell";

export default function VatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarShell
      title="ภ.พ.30"
      subtitle="แบบแสดงรายการภาษีมูลค่าเพิ่มรายเดือน"
    >
      {children}
    </SidebarShell>
  );
}
