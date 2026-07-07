import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { requireUser } from "@/lib/auth/session";
import { canCreateProject } from "@/lib/projects/permissions";
import { createProjectQuick } from "@/lib/projects/actions";
import { ContentCard } from "@/components/ui/ContentCard";
import { Input } from "@/components/ui/Input";

export const metadata: Metadata = { title: "New project · ARTIVERGES NEXT" };

export default async function NewProjectPage() {
  const user = await requireUser();
  if (!canCreateProject(user.role)) redirect("/projects");

  return (
    <div className="mx-auto max-w-xl space-y-5">
      <div>
        <Link
          href="/projects"
          className="text-body-sm text-text-secondary hover:underline"
        >
          ← โปรเจค
        </Link>
        <h2 className="mt-1 text-h2 font-bold text-text-primary">
          สร้างโปรเจคใหม่
        </h2>
        <p className="text-body-sm text-text-secondary">
          กรอกแค่ชื่อโปรเจคก่อน — รายละเอียดอื่น ๆ (ลูกค้า, มูลค่างาน, กำหนดการ)
          ค่อยเข้าไปเพิ่มในหน้าโปรเจคภายหลัง
        </p>
      </div>

      <ContentCard className="p-6">
        <form action={createProjectQuick} className="space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="name"
              className="text-body-sm font-medium text-text-primary"
            >
              ชื่อโปรเจค
            </label>
            <Input
              id="name"
              name="name"
              required
              minLength={2}
              placeholder="เช่น บ้านคุณสมชาย — ตกแต่งภายใน"
            />
          </div>
          <button
            type="submit"
            className="inline-flex h-10 items-center justify-center rounded-md bg-primary-700 px-4 text-body-sm font-medium text-white transition-colors hover:bg-primary-600"
          >
            + สร้างโปรเจค
          </button>
        </form>
      </ContentCard>
    </div>
  );
}
