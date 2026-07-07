import { SkeletonForm, SkeletonTable } from "@/components/ui/Skeleton";

export default function BoqLoading() {
  return (
    <div className="space-y-5">
      <SkeletonForm fields={2} />
      <SkeletonTable rows={5} cols={5} />
    </div>
  );
}
