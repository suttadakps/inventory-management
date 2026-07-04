"use client";

import { useActionState } from "react";
import Link from "next/link";

import { forgotPassword, type AuthActionState } from "@/lib/auth/actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Alert } from "@/components/ui/Alert";

const initialState: AuthActionState = {};

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(
    forgotPassword,
    initialState
  );

  // On success we show a confirmation and hide the form.
  if (state.message) {
    return (
      <div className="space-y-4">
        <Alert variant="success">{state.message}</Alert>
        <Link
          href="/login"
          className="inline-block text-body-sm text-primary-600 hover:underline"
        >
          ← Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4" noValidate>
      {state.error && <Alert variant="error">{state.error}</Alert>}

      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@artiverges.app"
        />
      </div>

      <Button type="submit" loading={pending} className="w-full">
        Send reset link
      </Button>

      <Link
        href="/login"
        className="block text-center text-body-sm text-primary-600 hover:underline"
      >
        ← Back to sign in
      </Link>
    </form>
  );
}
