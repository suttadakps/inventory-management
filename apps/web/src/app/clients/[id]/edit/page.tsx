import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { requireUser } from "@/lib/auth/session";
import { canManageClients } from "@/lib/clients/permissions";
import { getClientById } from "@/lib/clients/repository";
import { updateClient } from "@/lib/clients/actions";
import { ClientForm } from "@/components/clients/ClientForm";

export const metadata: Metadata = { title: "Edit client · ARTIVERGES NEXT" };

export default async function EditClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;

  if (!canManageClients(user.role)) redirect(`/clients/${id}`);

  const client = await getClientById(id);
  if (!client) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link
          href={`/clients/${id}`}
          className="text-body-sm text-text-secondary hover:underline"
        >
          ← {client.name}
        </Link>
        <h1 className="mt-1 text-h1 font-bold text-text-primary">Edit client</h1>
      </div>

      <div className="rounded-md border border-border bg-surface p-6">
        <ClientForm
          mode="edit"
          action={updateClient}
          values={{
            id: client.id,
            name: client.name,
            type: client.type,
            contactPerson: client.contactPerson,
            phone: client.phone,
            email: client.email,
            taxId: client.taxId,
            address: client.address,
            notes: client.notes,
          }}
        />
      </div>
    </div>
  );
}
