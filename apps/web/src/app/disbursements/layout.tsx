import { SidebarShell } from "@/components/layout/SidebarShell";

export default function DisbursementsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarShell
      title="เบิกเงิน"
      subtitle="คำขอเบิกเงินของผู้รับเหมา/คนงาน และการอนุมัติ"
    >
      {children}
    </SidebarShell>
  );
}
