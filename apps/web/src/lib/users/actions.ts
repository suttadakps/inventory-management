"use server";

import { revalidatePath } from "next/cache";

import { requireUser, type CurrentUser } from "@/lib/auth/session";
import { isRole } from "@/lib/auth/roles";
import { canManageUsers } from "./permissions";
import * as repo from "./repository";

export type UserResult = { ok: true } | { ok: false; error: string };

const MIN_PASSWORD = 8;

type Authorized =
  | { ok: true; user: CurrentUser }
  | { ok: false; error: string };

async function authorize(): Promise<Authorized> {
  const user = await requireUser();
  if (!canManageUsers(user.role))
    return { ok: false, error: "ไม่มีสิทธิ์จัดการผู้ใช้งาน" };
  return { ok: true, user };
}

export type CreateUserFormInput = {
  email: string;
  password: string;
  fullName: string;
  role: string;
  projectIds: string[];
  clientId: string;
};

export async function createUserAction(
  input: CreateUserFormInput
): Promise<UserResult> {
  const auth = await authorize();
  if (!auth.ok) return auth;

  const email = input.email.trim().toLowerCase();
  const fullName = input.fullName.trim();

  if (!fullName) return { ok: false, error: "กรุณากรอกชื่อ-นามสกุล" };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return { ok: false, error: "อีเมลไม่ถูกต้อง" };
  if (input.password.length < MIN_PASSWORD)
    return { ok: false, error: `รหัสผ่านต้องยาวอย่างน้อย ${MIN_PASSWORD} ตัว` };
  if (!isRole(input.role)) return { ok: false, error: "สิทธิ์ไม่ถูกต้อง" };

  try {
    await repo.createUser({
      email,
      password: input.password,
      fullName,
      role: input.role,
      projectIds: input.projectIds,
      clientId: input.clientId || null,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "สร้างบัญชีไม่สำเร็จ";
    return {
      ok: false,
      error: msg.includes("already registered")
        ? "อีเมลนี้มีบัญชีอยู่แล้ว"
        : msg,
    };
  }

  revalidatePath("/users");
  return { ok: true };
}

export async function updateUserAction(
  userId: string,
  input: { fullName: string; role: string; projectIds: string[]; clientId: string }
): Promise<UserResult> {
  const auth = await authorize();
  if (!auth.ok) return auth;

  const fullName = input.fullName.trim();
  if (!fullName) return { ok: false, error: "กรุณากรอกชื่อ-นามสกุล" };
  if (!isRole(input.role)) return { ok: false, error: "สิทธิ์ไม่ถูกต้อง" };
  if (userId === auth.user.id && input.role !== auth.user.role)
    return { ok: false, error: "เปลี่ยนสิทธิ์ของตัวเองไม่ได้" };

  try {
    await repo.updateUser(userId, {
      fullName,
      role: input.role,
      projectIds: input.projectIds,
      clientId: input.clientId || null,
    });
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "บันทึกไม่สำเร็จ",
    };
  }

  revalidatePath("/users");
  return { ok: true };
}

export async function resetPasswordAction(
  userId: string,
  password: string
): Promise<UserResult> {
  const auth = await authorize();
  if (!auth.ok) return auth;

  if (password.length < MIN_PASSWORD)
    return { ok: false, error: `รหัสผ่านต้องยาวอย่างน้อย ${MIN_PASSWORD} ตัว` };

  try {
    await repo.setUserPassword(userId, password);
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "เปลี่ยนรหัสผ่านไม่สำเร็จ",
    };
  }
  return { ok: true };
}

export async function deleteUserAction(userId: string): Promise<UserResult> {
  const auth = await authorize();
  if (!auth.ok) return auth;
  if (userId === auth.user.id)
    return { ok: false, error: "ลบบัญชีของตัวเองไม่ได้" };

  try {
    await repo.deleteUser(userId);
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "ลบบัญชีไม่สำเร็จ",
    };
  }

  revalidatePath("/users");
  return { ok: true };
}
