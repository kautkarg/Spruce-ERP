/**
 * @file This component displays a list of tasks associated with a lead.
 * It's shown in the lead profile dialog.
 */
"use client";

import { Task } from "@/lib/types";
import { users } from "@/lib/users-data";
import { format, formatDistanceToNow } from 'date-fns';
import { Calendar, User, Clock, CheckCircle2, Circle } from "lucide-react";
import { ScrollArea } from "../ui/scroll-area";
import { cn } from "@/lib/utils";
import { Badge } from "../ui/badge";

// Maps task priority to a color for the badge.
const priorityColors: Record<Task['priority'], string> = {
    High: "text-red-500",
    Medium: "text-yellow-500",
    Low: "text-green-500",
};

// Maps task status to an icon.
const statusIcons: Record<Task['status'], React.ElementType> = {
    Completed: CheckCircle2,
    Pending: Circle,
    Overdue: Clock,
};

/**
 * TaskList component.
 * Renders a scrollable list of tasks.
 * @param {object} props - The component props.
 * @param {Task[]} props.tasks - An array of task objects to display.
 * @returns A JSX element rendering the task list.
 */
export function TaskList({ tasks }: { tasks: Task[] }) {
    if (!tasks || tasks.length === 0) {
        return (
             <div className="h-full rounded-lg border bg-secondary/50 flex items-center justify-center">
                <p className="text-sm text-muted-foreground">No tasks for this lead.</p>
            </div>
        );
    }

    return (
        <ScrollArea className="h-96 w-full rounded-lg border bg-secondary/50 p-4">
            <div className="space-y-4">
                {tasks.map((task) => {
                    const user = users.find(u => u.id === task.assignedUserId);
                    const StatusIcon = statusIcons[task.status];
                    return (
                        <div key={task.id} className="p-3 rounded-lg bg-card border">
                            <div className="flex items-start justify-between">
                                <p className="font-semibold text-sm">{task.notes}</p>
                                <Badge variant={task.priority === 'High' ? 'destructive' : 'secondary'}>{task.priority}</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">{task.type}</p>
                            
                            <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                    <Calendar className="w-3.5 h-3.5" />
                                    <span>{format(new Date(task.dueDate), 'MMM dd, yyyy')}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <User className="w-3.5 h-3.5" />
                                    <span>{user?.name || "Unassigned"}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <StatusIcon className={cn("w-3.5 h-3.5", task.status === 'Completed' && 'text-green-500')} />
                                    <span>{task.status}</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </ScrollArea>
    );
}
