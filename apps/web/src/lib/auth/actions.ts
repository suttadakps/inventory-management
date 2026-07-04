"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "@/lib/validation/auth";

/**
 * Shared shape returned by auth actions to their forms (via useActionState).
 * On success the action typically redirects, so the state carries only
 * error / informational messages.
 */
export type AuthActionState = {
  error?: string;
  message?: string;
  fieldErrors?: Record<string, string>;
};

async function siteOrigin(): Promise<string> {
  const requestOrigin = (await headers()).get("origin");
  return requestOrigin ?? process.env.NEXT_PUBLIC_SITE_URL ?? "";
}

/** Login — email + password (docs/05_API_SPEC.md POST /auth/login). */
export async function login(
  _prev: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: "Please enter a valid email and password." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    // Generic message — never reveal whether the email exists.
    return { error: "Invalid email or password." };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

/** Logout — clears the session (docs/05_API_SPEC.md POST /auth/logout). */
export async function logout(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}

/**
 * Forgot password — sends a reset link.
 * Always returns the same message to prevent account enumeration.
 * (docs/05_API_SPEC.md POST /auth/forgot-password)
 */
export async function forgotPassword(
  _prev: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = forgotPasswordSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return { error: "Please enter a valid email address." };
  }

  const supabase = await createSupabaseServerClient();
  const origin = await siteOrigin();

  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${origin}/auth/callback?next=/reset-password`,
  });

  return {
    message:
      "If an account exists for that email, a password reset link is on its way.",
  };
}

/**
 * Reset password — sets a new password for the recovery session established
 * by the callback route. (docs/05_API_SPEC.md POST /auth/reset-password)
 */
export async function resetPassword(
  _prev: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = resetPasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && !fieldErrors[key]) {
        fieldErrors[key] = issue.message;
      }
    }
    return { error: "Please correct the errors below.", fieldErrors };
  }

  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error: "Your reset link is invalid or has expired. Request a new one.",
    };
  }

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) {
    return { error: "Could not update your password. Please try again." };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}
