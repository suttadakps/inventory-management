import { SidebarShell } from "@/components/layout/SidebarShell";

export default function WhtLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarShell
      title="ใบทวิ 50"
      subtitle="หนังสือรับรองการหักภาษี ณ ที่จ่าย ตามมาตรา 50 ทวิ"
    >
      {children}
    </SidebarShell>
  );
}
