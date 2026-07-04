import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Forgot password · ARTIVERGES NEXT",
};

export default function ForgotPasswordPage() {
  return (
    <div>
      <h1 className="mb-1 text-h2 font-semibold text-text-primary">
        Forgot password
      </h1>
      <p className="mb-6 text-body-sm text-text-secondary">
        Enter your email and we&apos;ll send you a link to reset your password.
      </p>
      <ForgotPasswordForm />
    </div>
  );
}
