import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = { title: "เข้าสู่ระบบ · ARTIVERGES NEXT" };

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-h2 font-bold text-text-primary mb-2">เข้าสู่ระบบ</h1>
        <p className="text-body-sm text-text-secondary">
          ยินดีต้อนรับกลับมา กรุณากรอกข้อมูลประจำตัวของคุณ
        </p>
      </div>
      <LoginForm />
      <div className="pt-4 border-t border-border">
        <p className="text-center text-body-sm text-text-secondary">
          ยังไม่มีบัญชี?{" "}
          <Link
            href="/auth/signup"
            className="font-medium text-primary-600 hover:text-primary-700 hover:underline"
          >
            สมัครสมาชิก
          </Link>
        </p>
      </div>
    </div>
  );
}
