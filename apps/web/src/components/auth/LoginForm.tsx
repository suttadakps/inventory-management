"use client";

import { useActionState } from "react";
import Link from "next/link";

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
        <div className="flex items-center justify-between">
          <Label htmlFor="password" className="text-body-sm font-medium text-text-primary">
            รหัสผ่าน
          </Label>
          <Link
            href="/forgot-password"
            className="text-body-xs text-primary-600 hover:text-primary-700 hover:underline"
          >
            ลืมรหัสผ่านหรือไม่?
          </Link>
        </div>
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
        className="w-full h-10 mt-6 rounded-lg font-medium text-body"
      >
        {pending ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-text-secondary text-caption">หรือ</span>
        </div>
      </div>

      <button
        type="button"
        className="w-full h-10 rounded-lg border border-border text-text-primary font-medium text-body hover:bg-neutral-50 transition-colors"
      >
        ลงชื่อเข้าใช้ด้วย Google
      </button>
    </form>
  );
}
