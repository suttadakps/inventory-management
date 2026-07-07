import {
  SkeletonMetricRow,
  SkeletonForm,
  SkeletonTable,
} from "@/components/ui/Skeleton";

export default function CostsLoading() {
  return (
    <div className="space-y-5">
      <SkeletonMetricRow count={3} />
      <SkeletonForm fields={6} />
      <SkeletonTable rows={5} cols={5} />
    </div>
  );
}
