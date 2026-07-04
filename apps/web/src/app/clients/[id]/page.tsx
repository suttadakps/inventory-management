import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { requireUser } from "@/lib/auth/session";
import {
  canManageClients,
  canArchiveClient,
} from "@/lib/clients/permissions";
import { getClientById } from "@/lib/clients/repository";
import { ProjectStatusBadge } from "@/components/projects/ProjectStatusBadge";
import {
  ArchiveClientButton,
  RestoreClientButton,
} from "@/components/clients/ArchiveClientButtons";

export const metadata: Metadata = { title: "Client · ARTIVERGES NEXT" };

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <dt className="text-caption font-medium uppercase tracking-wide text-text-secondary">
        {label}
      </dt>
      <dd className="mt-1 whitespace-pre-line text-body text-text-primary">
        {children}
      </dd>
    </div>
  );
}

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;

  const client = await getClientById(id);
  if (!client) notFound();

  const canManage = canManageClients(user.role);
  const canArchive = canArchiveClient(user.role);

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/clients"
          className="text-body-sm text-text-secondary hover:underline"
        >
          ← Clients
        </Link>
        <div className="mt-1 flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-h1 font-bold text-text-primary">
                {client.name}
              </h1>
              {client.archived && (
                <span className="rounded-sm bg-neutral px-2 py-0.5 text-caption font-medium text-white">
                  Archived
                </span>
              )}
            </div>
            <p className="mt-1 text-body-sm capitalize text-text-secondary">
              {client.type}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {canManage && !client.archived && (
              <Link
                href={`/clients/${client.id}/edit`}
                className="inline-flex h-9 items-center rounded-sm border border-border bg-surface px-3 text-body-sm font-medium text-text-primary hover:bg-primary-100"
              >
                Edit
              </Link>
            )}
            {canArchive &&
              (client.archived ? (
                <RestoreClientButton id={client.id} />
              ) : (
                <ArchiveClientButton id={client.id} />
              ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Details */}
        <section className="rounded-md border border-border bg-surface p-6 lg:col-span-2">
          <h2 className="mb-4 text-h3 font-semibold text-text-primary">
            Details
          </h2>
          <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field label="Contact person">
              {client.contactPerson ?? "—"}
            </Field>
            <Field label="Tax ID">{client.taxId ?? "—"}</Field>
            <Field label="Email">
              {client.email ? (
                <a
                  href={`mailto:${client.email}`}
                  className="text-primary-600 hover:underline"
                >
                  {client.email}
                </a>
              ) : (
                "—"
              )}
            </Field>
            <Field label="Phone">
              {client.phone ? (
                <a
                  href={`tel:${client.phone}`}
                  className="text-primary-600 hover:underline"
                >
                  {client.phone}
                </a>
              ) : (
                "—"
              )}
            </Field>
            <div className="sm:col-span-2">
              <Field label="Address">{client.address ?? "—"}</Field>
            </div>
            <div className="sm:col-span-2">
              <Field label="Notes">{client.notes ?? "—"}</Field>
            </div>
          </dl>
        </section>

        {/* Projects */}
        <section className="rounded-md border border-border bg-surface p-6">
          <h2 className="mb-4 text-h3 font-semibold text-text-primary">
            Projects ({client.projects.length})
          </h2>
          {client.projects.length === 0 ? (
            <p className="text-body-sm text-text-secondary">
              No projects for this client yet.
            </p>
          ) : (
            <ul className="space-y-3">
              {client.projects.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <Link
                      href={`/projects/${p.id}`}
                      className="block truncate text-body-sm font-medium text-primary-700 hover:underline"
                    >
                      {p.name}
                    </Link>
                    <span className="font-mono text-caption text-text-secondary">
                      {p.code}
                    </span>
                  </div>
                  <ProjectStatusBadge status={p.status} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
