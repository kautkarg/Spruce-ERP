/**
 * @file This component renders a colored badge for a given lead stage (e.g., New, Qualified).
 * It's used across the application to visually represent lead status.
 */
import { Badge } from "@/components/ui/badge";
import { KanbanStage } from "@/lib/types";
import { cn } from "@/lib/utils";

// A mapping of Kanban stages to specific Tailwind CSS classes for styling.
const stageColors: Record<KanbanStage, string> = {
  New: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800/60",
  Contacted: "bg-cyan-100 text-cyan-800 border-cyan-200 dark:bg-cyan-900/40 dark:text-cyan-300 dark:border-cyan-800/60",
  Qualified: "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/40 dark:text-purple-300 dark:border-purple-800/60",
  Application: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/40 dark:text-yellow-300 dark:border-yellow-800/60",
  Enrolled: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/40 dark:text-green-300 dark:border-green-800/60",
  Dropped: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/40 dark:text-red-300 dark:border-red-800/60",
};

/**
 * StageBadge component.
 * @param {object} props - The component props.
 * @param {KanbanStage} props.stage - The stage to display.
 * @param {string} [props.className] - Optional additional CSS classes.
 * @returns A JSX element rendering a styled badge.
 */
export function StageBadge({ stage, className }: { stage: KanbanStage; className?: string }) {
  return (
    <Badge
      variant="outline"
      className={cn("hover:bg-opacity-80", stageColors[stage], className)}
    >
      {stage}
    </Badge>
  );
}
