import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = { title: "Sign in · ARTIVERGES NEXT" };

export default function LoginPage() {
  return (
    <div>
      <h1 className="mb-1 text-h2 font-semibold text-text-primary">Sign in</h1>
      <p className="mb-6 text-body-sm text-text-secondary">
        Welcome back. Enter your credentials to continue.
      </p>
      <LoginForm />
    </div>
  );
}
