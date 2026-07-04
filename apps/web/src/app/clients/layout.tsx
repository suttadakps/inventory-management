import { redirect } from "next/navigation";

import { requireUser } from "@/lib/auth/session";
import { canViewClients } from "@/lib/clients/permissions";
import { AppShell } from "@/components/layout/AppShell";

export default async function ClientsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  if (!canViewClients(user.role)) redirect("/dashboard");

  return (
    <AppShell
      user={{ email: user.email, fullName: user.fullName, role: user.role }}
    >
      {children}
    </AppShell>
  );
}
