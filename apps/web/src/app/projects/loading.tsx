import { SkeletonTable } from "@/components/ui/Skeleton";

export default function ProjectsLoading() {
  return (
    <div className="space-y-4">
      <SkeletonTable rows={6} cols={5} />
    </div>
  );
}
