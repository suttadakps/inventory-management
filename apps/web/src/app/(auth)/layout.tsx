export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-10 text-center">
          <div className="mb-2 inline-block">
            <div className="text-h1 font-bold tracking-tight">
              <span className="text-primary-700">ARTIVERGES</span>
              <span className="text-accent-600 ml-2">NEXT</span>
            </div>
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
