"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth/session";
import { clientSchema } from "@/lib/validation/client";
import { canManageClients, canArchiveClient } from "./permissions";
import * as repo from "./repository";

export type ClientActionState = {
  error?: string;
  fieldErrors?: Record<string, string>;
};

function collectFieldErrors(
  error: import("zod").ZodError
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !out[key]) out[key] = issue.message;
  }
  return out;
}

export async function createClient(
  _prev: ClientActionState,
  formData: FormData
): Promise<ClientActionState> {
  const user = await requireUser();
  if (!canManageClients(user.role)) {
    return { error: "You do not have permission to create clients." };
  }

  const parsed = clientSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      error: "Please correct the errors below.",
      fieldErrors: collectFieldErrors(parsed.error),
    };
  }

  const id = await repo.createClient(parsed.data, user.id);
  revalidatePath("/clients");
  redirect(`/clients/${id}`);
}

export async function updateClient(
  _prev: ClientActionState,
  formData: FormData
): Promise<ClientActionState> {
  const user = await requireUser();
  if (!canManageClients(user.role)) {
    return { error: "You do not have permission to edit clients." };
  }

  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing client reference." };
  if (!(await repo.clientExists(id))) return { error: "Client not found." };

  const parsed = clientSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      error: "Please correct the errors below.",
      fieldErrors: collectFieldErrors(parsed.error),
    };
  }

  await repo.updateClient(id, parsed.data, user.id);
  revalidatePath("/clients");
  revalidatePath(`/clients/${id}`);
  redirect(`/clients/${id}`);
}

export async function archiveClient(formData: FormData): Promise<void> {
  const user = await requireUser();
  if (!canArchiveClient(user.role)) {
    throw new Error("Not authorized to archive clients.");
  }
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Missing client reference.");
  if (!(await repo.clientExists(id))) throw new Error("Client not found.");

  await repo.archiveClient(id, user.id);
  revalidatePath("/clients");
  revalidatePath(`/clients/${id}`);
  redirect(`/clients/${id}`);
}

export async function restoreClient(formData: FormData): Promise<void> {
  const user = await requireUser();
  if (!canArchiveClient(user.role)) {
    throw new Error("Not authorized to restore clients.");
  }
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Missing client reference.");

  await repo.restoreClient(id, user.id);
  revalidatePath("/clients");
  revalidatePath(`/clients/${id}`);
  redirect(`/clients/${id}`);
}
