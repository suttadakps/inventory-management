import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { requireUser } from "@/lib/auth/session";
import { canManageClients } from "@/lib/clients/permissions";
import { createClient } from "@/lib/clients/actions";
import { ClientForm } from "@/components/clients/ClientForm";

export const metadata: Metadata = { title: "New client · ARTIVERGES NEXT" };

export default async function NewClientPage() {
  const user = await requireUser();
  if (!canManageClients(user.role)) redirect("/clients");

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link
          href="/clients"
          className="text-body-sm text-text-secondary hover:underline"
        >
          ← Clients
        </Link>
        <h1 className="mt-1 text-h1 font-bold text-text-primary">New client</h1>
      </div>

      <div className="rounded-md border border-border bg-surface p-6">
        <ClientForm mode="create" action={createClient} />
      </div>
    </div>
  );
}
