import { requireUser } from "@/lib/auth/session";
import { AppShell } from "@/components/layout/AppShell";

export default async function ProjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  return (
    <AppShell
      user={{ email: user.email, fullName: user.fullName, role: user.role }}
    >
      {children}
    </AppShell>
  );
}
