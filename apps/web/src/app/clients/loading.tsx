import { SkeletonTable } from "@/components/ui/Skeleton";

export default function ClientsLoading() {
  return (
    <div className="space-y-4">
      <SkeletonTable rows={6} cols={4} />
    </div>
  );
}
