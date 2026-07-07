import { SkeletonMetricRow, SkeletonTable } from "@/components/ui/Skeleton";

export default function MyProjectsLoading() {
  return (
    <div className="space-y-5">
      <SkeletonMetricRow count={3} />
      <SkeletonTable rows={5} cols={6} />
    </div>
  );
}
