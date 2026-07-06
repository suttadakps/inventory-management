import { SidebarShell } from "@/components/layout/SidebarShell";

export default function ProjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarShell title="โปรเจค" subtitle="บริหารจัดการโปรเจคทั้งหมด">
      {children}
    </SidebarShell>
  );
}
