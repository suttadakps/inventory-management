import type { Metadata } from "next";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export const metadata: Metadata = {
  title: "Reset password · ARTIVERGES NEXT",
};

export default function ResetPasswordPage() {
  return (
    <div>
      <h1 className="mb-1 text-h2 font-semibold text-text-primary">
        Set a new password
      </h1>
      <p className="mb-6 text-body-sm text-text-secondary">
        Choose a strong password you don&apos;t use elsewhere.
      </p>
      <ResetPasswordForm />
    </div>
  );
}
