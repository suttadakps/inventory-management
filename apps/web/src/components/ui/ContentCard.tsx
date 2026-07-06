import { cn } from "@/lib/utils/cn";

/**
 * White content card on the cream operations background — the shared surface
 * used by module pages (tables, panels, sections) in the ARTIVERGES NEXT UI.
 */
export function ContentCard({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border border-[#ece7db] bg-white shadow-1",
        className
      )}
    >
      {children}
    </div>
  );
}
