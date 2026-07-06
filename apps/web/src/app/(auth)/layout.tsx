import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-10 text-center">
          <div className="mb-4">
            <Image
              src="/artiverges-next-logo.png"
              alt="ARTIVERGES NEXT - Creative Construction Turnkey"
              width={400}
              height={120}
              priority
              style={{ height: "auto", width: "auto" }}
            />
          </div>
          <p className="text-body text-text-secondary font-medium">
            ระบบจัดการโครงการ
          </p>
          <p className="text-caption text-text-secondary mt-1">
            Construction Management Platform
          </p>
        </div>
        <div className="rounded-xl border border-white bg-white p-8 shadow-lg">
          {children}
        </div>
        <p className="mt-6 text-center text-caption text-text-secondary">
          © 2025 ARTIVERGES GROUP. All rights reserved.
        </p>
      </div>
    </main>
  );
}
