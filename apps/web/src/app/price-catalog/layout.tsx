import { SidebarShell } from "@/components/layout/SidebarShell";

export default function PriceCatalogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarShell title="ราคากลาง" subtitle="รายการราคามาตรฐานสำหรับใช้ทำ BOQ">
      {children}
    </SidebarShell>
  );
}
