import { requireBackOffice } from "@/lib/auth/session";
import { AppShell } from "@/components/layout/AppShell";

export default async function ContractsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireBackOffice();
  return (
    <AppShell
      user={{ email: user.email, fullName: user.fullName, role: user.role }}
    >
      {children}
    </AppShell>
  );
}
