import { SkeletonCardGrid } from "@/components/ui/Skeleton";

export default function PortalLoading() {
  return (
    <div className="space-y-5">
      <SkeletonCardGrid count={4} />
    </div>
  );
}
