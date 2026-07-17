import type { ProjectStatus } from "@artiverges/database";
import type { StatusTone } from "@/components/ui/StatusBadge";

/** Thai label + StatusBadge tone for each project status, shared across the
 * projects list, detail page, timeline, and calendar. */
export const STATUS_TH: Record<ProjectStatus, { label: string; tone: StatusTone }> = {
  planning: { label: "วางแผน", tone: "tan" },
  active: { label: "กำลังดำเนินการ", tone: "navy" },
  on_hold: { label: "พักงาน", tone: "amber" },
  completed: { label: "เสร็จสิ้น", tone: "green" },
  warranty: { label: "รับประกัน", tone: "navy" },
  closed: { label: "ปิดงาน", tone: "gray" },
};
