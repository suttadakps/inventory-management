export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="text-h1 font-bold tracking-tight text-primary-700">
            ARTIVERGES <span className="text-accent-600">NEXT</span>
          </div>
          <p className="mt-1 text-body-sm text-text-secondary">
            Construction Management Platform
          </p>
        </div>
        <div className="rounded-md border border-border bg-surface p-6 shadow-1 sm:p-8">
          {children}
        </div>
      </div>
    </main>
  );
}
