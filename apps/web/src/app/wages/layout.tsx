import { SidebarShell } from "@/components/layout/SidebarShell";

export default function WagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarShell title="สรุปค่าแรง" subtitle="บันทึกและสรุปค่าแรงคนงาน/ช่าง">
      {children}
    </SidebarShell>
  );
}
