"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireUser } from "@/lib/auth/session";
import { canManagePriceCatalog } from "./permissions";
import * as repo from "./repository";
import type { PriceCatalogInput } from "./repository";

export type PriceCatalogFormInput = {
  name: string;
  unit: string;
  materialCost: string;
  laborCost: string;
  category: string;
  note: string;
};

export type PriceCatalogResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

function toRepoInput(
  input: PriceCatalogFormInput
): PriceCatalogInput | { error: string } {
  const name = input.name.trim();
  if (!name) return { error: "กรุณากรอกชื่อรายการ" };

  const materialCost = Number(input.materialCost) || 0;
  const laborCost = Number(input.laborCost) || 0;
  if (materialCost < 0 || laborCost < 0)
    return { error: "ราคาต้องไม่ติดลบ" };

  return {
    name,
    unit: input.unit.trim() || null,
    materialCost,
    laborCost,
    category: input.category.trim() || null,
    note: input.note.trim() || null,
  };
}

export async function createPriceCatalogItemAction(
  input: PriceCatalogFormInput
): Promise<PriceCatalogResult> {
  const user = await requireUser();
  if (!canManagePriceCatalog(user.role))
    return { ok: false, error: "ไม่มีสิทธิ์จัดการราคากลาง" };

  const parsed = toRepoInput(input);
  if ("error" in parsed) return { ok: false, error: parsed.error };

  const id = await repo.createPriceCatalogItem(parsed, user.id);
  revalidatePath("/price-catalog");
  return { ok: true, id };
}

export async function updatePriceCatalogItemAction(
  id: string,
  input: PriceCatalogFormInput
): Promise<PriceCatalogResult> {
  const user = await requireUser();
  if (!canManagePriceCatalog(user.role))
    return { ok: false, error: "ไม่มีสิทธิ์จัดการราคากลาง" };

  const parsed = toRepoInput(input);
  if ("error" in parsed) return { ok: false, error: parsed.error };

  await repo.updatePriceCatalogItem(id, parsed);
  revalidatePath("/price-catalog");
  revalidatePath(`/price-catalog/${id}`);
  return { ok: true, id };
}

export async function deletePriceCatalogItemAction(id: string): Promise<void> {
  const user = await requireUser();
  if (!canManagePriceCatalog(user.role)) return;
  await repo.deletePriceCatalogItem(id);
  revalidatePath("/price-catalog");
  redirect("/price-catalog");
}
