/**
 * @file This file defines the Kanban board component for visualizing the lead pipeline.
 * It displays leads as cards organized into columns based on their stage.
 * It features drag-and-drop functionality (which would be implemented with a library
 * like `dnd-kit` in a full build-out) and client-side sorting.
 */
"use client";

import { KANBAN_STAGES, type KanbanStage, type Lead, type Task } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button";
import { Calendar, StickyNote, ArrowUpDown } from "lucide-react"
import React, { useState, useEffect, useMemo } from "react"
import { cn } from "@/lib/utils";
import { format, isToday, isYesterday } from "date-fns";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { users } from "@/lib/users-data";

// Provides help text for each Kanban stage, shown on hover.
const stageTooltips: Record<KanbanStage, string> = {
    New: "Fresh leads that have just entered the system and have not yet been contacted.",
    Contacted: "Leads that have been contacted at least once by a counselor.",
    Qualified: "Leads who have shown interest and are a good fit for a course.",
    Application: "Qualified leads who have started or submitted their application.",
    Enrolled: "Leads who have completed the application process and are now students.",
    Dropped: "Leads who are no longer interested or did not qualify."
};

// Defines the left border color for cards in each stage for quick visual identification.
const stageBorderColors: Record<KanbanStage, string> = {
    New: "border-l-blue-500",
    Contacted: "border-l-cyan-500",
    Qualified: "border-l-purple-500",
    Application: "border-l-yellow-500",
    Enrolled: "border-l-green-500",
    Dropped: "border-l-red-500",
};

// Maps task priority to a background color for the small indicator dot.
const priorityColors: Record<Task['priority'], string> = {
  High: 'bg-red-500',
  Medium: 'bg-yellow-500',
  Low: 'bg-green-500',
};

/**
 * Header component for each column in the Kanban board.
 * Shows the stage title, lead count, and a sort button.
 * It's sticky so it remains visible as the user scrolls down the column.
 */
function KanbanColumnHeader({ title, count, onSort, isSorted }: { title: KanbanStage; count: number; onSort: () => void; isSorted: boolean; }) {
    return (
        <div className="flex items-center justify-between p-3 mb-2 sticky top-0 bg-muted z-10">
            <TooltipProvider>
                <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>
                        <div className="flex items-center gap-2 cursor-help">
                            <h3 className="font-semibold text-md">{title}</h3>
                            <span className="text-sm font-semibold text-muted-foreground bg-background px-2 py-0.5 rounded-full">{count}</span>
                        </div>
                    </TooltipTrigger>
                    <TooltipContent><p className="max-w-xs">{stageTooltips[title]}</p></TooltipContent>
                </Tooltip>
            </TooltipProvider>
            {/* Sort button is not shown for terminal stages ('Enrolled', 'Dropped'). */}
            {title !== 'Enrolled' && title !== 'Dropped' && (
                 <TooltipProvider>
                    <Tooltip delayDuration={0}>
                        <TooltipTrigger asChild>
                           <Button variant={isSorted ? "secondary" : "ghost"} size="icon" className="h-7 w-7" onClick={onSort}>
                                <ArrowUpDown className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>Sort by priority</p></TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            )}
        </div>
    )
}

// Finds the next pending follow-up task for a lead.
const getNextFollowUp = (lead: Lead): Task | undefined => {
    return lead.tasks?.filter(t => t.type === 'Follow-up' && t.status === 'Pending').sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0];
};

// Defines the numeric order for sorting by priority.
const priorityOrder: Record<Task['priority'], number> = { High: 0, Medium: 1, Low: 2 };

// Sorts leads based on the priority and due date of their next follow-up task.
const sortLeadsByPriority = (leads: Lead[]): Lead[] => {
    return [...leads].sort((a, b) => {
        const nextFollowUpA = getNextFollowUp(a);
        const nextFollowUpB = getNextFollowUp(b);
        if (nextFollowUpA && nextFollowUpB) {
            const priorityA = priorityOrder[nextFollowUpA.priority];
            const priorityB = priorityOrder[nextFollowUpB.priority];
            if (priorityA !== priorityB) return priorityA - priorityB;
            // If priorities are the same, sort by due date.
            return new Date(nextFollowUpA.dueDate).getTime() - new Date(nextFollowUpB.dueDate).getTime();
        }
        // Leads with follow-ups are prioritized over those without.
        if (nextFollowUpA) return -1;
        if (nextFollowUpB) return 1;
        // If neither have follow-ups, sort by last activity.
        const lastActivityA = new Date(a.activities?.[0]?.timestamp || a.createdAt).getTime();
        const lastActivityB = new Date(b.activities?.[0]?.timestamp || b.createdAt).getTime();
        return lastActivityB - lastActivityA;
    });
};

/**
 * A single column in the Kanban board, representing one stage.
 * It contains a list of Kanban cards.
 */
function KanbanColumn({ title, leads, onViewProfile }: { title: KanbanStage; leads: Lead[]; onViewProfile: (lead: Lead) => void; }) {
  const [isSorted, setIsSorted] = useState(false);
  // Memoize the displayed leads to prevent re-sorting on every render unless data or sort state changes.
  const displayedLeads = useMemo(() => {
    const sortedByDate = [...leads].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return isSorted ? sortLeadsByPriority(sortedByDate) : sortedByDate;
  }, [leads, isSorted]);

  return (
    <div className="flex flex-col w-80 shrink-0 h-full">
      <KanbanColumnHeader title={title} count={leads.length} onSort={() => setIsSorted(prev => !prev)} isSorted={isSorted} />
      <div className="flex-1 overflow-y-auto rounded-md bg-muted/80 p-2">
        {displayedLeads.length > 0 ? (
          <div className="space-y-3">
            {displayedLeads.map(lead => <KanbanCard key={lead.id} lead={lead} onClick={() => onViewProfile(lead)} />)}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-sm text-muted-foreground p-4">
            <p>No leads in this stage</p>
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * A single card representing a lead in the Kanban board.
 * Clicking this card will open the detailed lead profile dialog.
 */
function KanbanCard({ lead, onClick }: { lead: Lead, onClick: () => void }) {
    const [formattedDate, setFormattedDate] = useState<string | null>(null);
    const [formattedFollowUp, setFormattedFollowUp] = useState<string | null>(null);
    
    const lastActivity = lead.activities?.[0];
    const nextFollowUp = getNextFollowUp(lead);
    const contactPerson = lastActivity ? users.find(u => u.id === lastActivity.userId) : null;
    const hasBeenContacted = lead.activities && lead.activities.filter(a => a.type !== 'System').length > 0;

    // Format dates on the client side to avoid hydration issues.
    useEffect(() => {
        if (lastActivity) {
            const date = new Date(lastActivity.timestamp);
            if (isToday(date)) setFormattedDate(format(date, "'Today,' p"));
            else if (isYesterday(date)) setFormattedDate(format(date, "'Yesterday,' p"));
            else setFormattedDate(format(date, "MMM dd, p"));
        } else setFormattedDate(null);
        if (nextFollowUp) setFormattedFollowUp(format(new Date(nextFollowUp.dueDate), "MMM dd"));
        else setFormattedFollowUp(null);
    }, [lastActivity, nextFollowUp]);

    return (
        <Card className={cn("hover:shadow-lg transition-shadow cursor-pointer border-l-4", stageBorderColors[lead.stage], hasBeenContacted ? "bg-card" : "bg-card/60 backdrop-blur-sm")} onClick={onClick}>
            <CardContent className="p-3">
                 <div className="flex items-start justify-between mb-3">
                    <div className="space-y-1">
                        <p className="text-sm font-semibold">{lead.name}</p>
                        <p className="text-xs text-muted-foreground">{lead.source}</p>
                    </div>
                    {lastActivity && formattedDate && <div className="text-right text-xs text-muted-foreground"><p>{formattedDate}</p><p>by {contactPerson?.name.split(' ')[0] || 'N/A'}</p></div>}
                </div>
                {lastActivity?.notes && <div className="flex items-start text-xs text-muted-foreground border-t pt-2 mt-2"><StickyNote className="w-3.5 h-3.5 mr-1.5 mt-0.5 shrink-0" /><p className="italic line-clamp-2">{lastActivity.notes}</p></div>}
                {nextFollowUp && formattedFollowUp && (
                     <div className="flex items-center text-xs text-muted-foreground mt-3">
                        <Calendar className="w-3.5 h-3.5 mr-1.5" />
                        <span className="font-medium">Next follow-up: {formattedFollowUp}</span>
                        <TooltipProvider><Tooltip><TooltipTrigger asChild><span className={cn("w-2 h-2 rounded-full ml-2", priorityColors[nextFollowUp.priority])}></span></TooltipTrigger><TooltipContent><p>{nextFollowUp.priority} Priority</p></TooltipContent></Tooltip></TooltipProvider>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

interface KanbanBoardProps {
    leads: Lead[];
    onViewProfile: (lead: Lead) => void;
}

/**
 * The main KanbanBoard component.
 * It organizes leads into columns by their stage.
 */
export function KanbanBoard({ leads, onViewProfile }: KanbanBoardProps) {
  // Memoize the grouping of leads by stage to optimize performance.
  const leadsByStage = useMemo(() => {
    return KANBAN_STAGES.reduce((acc, stage) => {
        acc[stage] = leads.filter(lead => lead.stage === stage);
        return acc;
    }, {} as Record<KanbanStage, Lead[]>);
  }, [leads]);
  
  return (
    <div className="flex gap-6 h-full w-full overflow-x-auto pb-4">
      {KANBAN_STAGES.map(stage => (
        <KanbanColumn key={stage} title={stage} leads={leadsByStage[stage] || []} onViewProfile={onViewProfile} />
      ))}
    </div>
  )
}
