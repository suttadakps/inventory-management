"use client";

import { useActionState } from "react";

import { resetPassword, type AuthActionState } from "@/lib/auth/actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Alert } from "@/components/ui/Alert";

const initialState: AuthActionState = {};

export function ResetPasswordForm() {
  const [state, formAction, pending] = useActionState(
    resetPassword,
    initialState
  );

  return (
    <form action={formAction} className="space-y-4" noValidate>
      {state.error && <Alert variant="error">{state.error}</Alert>}

      <div className="space-y-1.5">
        <Label htmlFor="password">New password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          invalid={Boolean(state.fieldErrors?.password)}
          aria-describedby="password-hint"
        />
        <p
          id="password-hint"
          className={
            state.fieldErrors?.password
              ? "text-caption text-danger"
              : "text-caption text-text-secondary"
          }
        >
          {state.fieldErrors?.password ?? "At least 8 characters."}
        </p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="confirmPassword">Confirm password</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          invalid={Boolean(state.fieldErrors?.confirmPassword)}
        />
        {state.fieldErrors?.confirmPassword && (
          <p className="text-caption text-danger">
            {state.fieldErrors.confirmPassword}
          </p>
        )}
      </div>

      <Button type="submit" loading={pending} className="w-full">
        Update password
      </Button>
    </form>
  );
}
