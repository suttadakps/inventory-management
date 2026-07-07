import { SkeletonForm, SkeletonTable } from "@/components/ui/Skeleton";

export default function DisbursementsLoading() {
  return (
    <div className="space-y-5">
      <SkeletonForm fields={4} />
      <SkeletonTable rows={5} cols={6} />
    </div>
  );
}
