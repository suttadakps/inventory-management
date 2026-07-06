import { SidebarShell } from "@/components/layout/SidebarShell";

export default function BoqLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarShell title="BOQ / ใบเสนอราคา" subtitle="รายการ BOQ ทั้งหมด">
      {children}
    </SidebarShell>
  );
}
