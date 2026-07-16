import type { Metadata } from "next";
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
    </div>
  );
}
