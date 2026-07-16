"use client";

import { useActionState } from "react";

import { login, type AuthActionState } from "@/lib/auth/actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Alert } from "@/components/ui/Alert";

const initialState: AuthActionState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <form action={formAction} className="space-y-5" noValidate>
      {state.error && (
        <Alert variant="error" className="text-sm">
          {state.error}
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="email" className="text-body-sm font-medium text-text-primary">
          อีเมล
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="your@email.com"
          className="h-10 rounded-lg border-border"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-body-sm font-medium text-text-primary">
          รหัสผ่าน
        </Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          placeholder="••••••••"
          className="h-10 rounded-lg border-border"
        />
      </div>

      <Button
        type="submit"
        loading={pending}
        className="w-full h-10 mt-6 rounded-lg font-medium text-body text-white"
      >
        {pending ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
      </Button>
    </form>
  );
}
