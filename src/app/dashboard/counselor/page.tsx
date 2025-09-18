/**
 * @file This file defines the dashboard page specifically for the Counselor role.
 * It provides a focused view of the metrics and tasks most relevant to a sales counselor,
 * such as their personal lead pipeline, conversion rates, and upcoming follow-ups.
 * This is a client component ("use client") because it uses hooks like `useState` and `useEffect`
 * to fetch and manage its own state.
 */
"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { TrendingUp, Target, UserCheck, ListTodo, Phone, AlertTriangle } from "lucide-react";
import { getLeads } from "@/lib/data";
import { Lead, Task, KANBAN_STAGES } from "@/lib/types";
import { users } from "@/lib/users-data";
import { format, isToday } from "date-fns";
import { StageBadge } from "@/components/leads/stage-badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { cn } from "@/lib/utils";

// In a real app, this ID would come from a global authentication context or session.
// For demonstration, we're hardcoding it to a specific counselor's ID.
const CURRENT_USER_ID = "user-5";

/**
 * A reusable card component for displaying a single statistic on the dashboard.
 * @param {object} props - The component props.
 * @param {string} props.title - The title for the stat card.
 * @param {string} props.value - The value to display.
 * @param {string | undefined} [props.change] - Optional text describing change over time.
 * @param {React.ElementType} props.icon - The icon component to show.
 * @param {string} props.color - The Tailwind CSS class for the icon color.
 * @returns {JSX.Element} A statistic card.
 */
function StatCard({ title, value, change, icon: Icon, color }: { title: string, value: string, change?: string, icon: React.ElementType, color: string }) {
  return (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <Icon className={`w-5 h-5 text-muted-foreground ${color}`} />
        </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change && <p className="text-xs text-muted-foreground">{change}</p>}
      </CardContent>
    </Card>
  )
}

/**
 * A specialized card that alerts the counselor about a missed follow-up for a lead.
 * This card is conditionally rendered only when a lead meets the "missed follow-up" criteria.
 * @param {object} props - The component props.
 * @param {Lead | undefined} props.lead - The lead with the missed follow-up.
 * @returns {JSX.Element | null} An alert card or null if no lead is provided.
 */
function MissedFollowUpCard({ lead }: { lead: Lead | undefined }) {
  const getImage = (id: string) => PlaceHolderImages.find(img => img.id === id)?.imageUrl || ''
  
  if (!lead) return null;
  
  const task = lead.tasks.find(t => isToday(new Date(t.dueDate)));

  return (
    <Card className="col-span-1 md:col-span-2 lg:col-span-4 bg-destructive/10 border-destructive">
      <CardHeader><CardTitle className="flex items-center gap-2 text-destructive"><AlertTriangle className="w-5 h-5" /><span>Action Required: Missed Follow-up</span></CardTitle></CardHeader>
      <CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12 border-2 border-destructive/50"><AvatarImage src={getImage(lead.avatarUrl)} alt={lead.name} /><AvatarFallback>{lead.name.charAt(0)}</AvatarFallback></Avatar>
          <div>
            <p className="font-bold text-lg">{lead.name}</p>
            <p className="text-sm text-destructive">A follow-up was scheduled for {task ? `at ${format(new Date(task.dueDate), 'p')}` : 'today'}.</p>
          </div>
        </div>
        <div className="flex gap-2 self-end sm:self-center">
          <Button variant="outline" size="sm"><Phone className="w-4 h-4 mr-2" />Log Call</Button>
          <Button variant="secondary" size="sm">View Profile</Button>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * A component to display a list of the counselor's upcoming tasks.
 * It filters for pending tasks and shows a helpful message if there are none.
 * @param {object} props - The component props.
 * @param {Task[]} props.tasks - The list of tasks assigned to the counselor.
 * @returns {JSX.Element} A list of tasks.
 */
function UpcomingTasks({tasks}: {tasks: Task[]}) {
  const upcoming = tasks.filter(t => t.status === 'Pending').slice(0, 5);

  if (upcoming.length === 0) {
      return <div className="h-full flex items-center justify-center"><p className="text-sm text-muted-foreground text-center py-4">No pending tasks. You're all caught up!</p></div>
  }

  return (
     <div className="space-y-4">
      {upcoming.map(task => (
        <div key={task.id} className="flex items-start">
          <div className="flex h-5 w-5 items-center justify-center rounded-sm bg-primary/10 border border-primary/20"><ListTodo className="h-3 w-3 text-primary" /></div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium leading-tight">{task.notes}</p>
            <p className="text-xs text-muted-foreground">Due: {format(new Date(task.dueDate), 'MMM dd, yyyy')}</p>
          </div>
        </div>
      ))}
    </div>
  )
}


/**
 * The main component for the Counselor's dashboard.
 * It fetches and displays data relevant only to the logged-in counselor.
 * The `useEffect` hook is used to fetch data on the client-side, preventing hydration errors
 * that can occur when server-rendered mock data doesn't match the client.
 * @returns {JSX.Element} The counselor dashboard page.
 */
export default function CounselorDashboard() {
  const [myLeads, setMyLeads] = useState<Lead[]>([]);
  const [myTasks, setMyTasks] = useState<Task[]>([]);
  const [missedFollowUpLead, setMissedFollowUpLead] = useState<Lead | undefined>();
  const [totalLeads, setTotalLeads] = useState(0);
  const [conversionRate, setConversionRate] = useState(0);
  const [closedDeals, setClosedDeals] = useState(0);

  useEffect(() => {
    // Fetch all leads and filter for those assigned to the current counselor.
    const allLeads = getLeads();
    const counselorLeads = allLeads.filter(lead => lead.assignedUserId === CURRENT_USER_ID);
    setMyLeads(counselorLeads);
    setTotalLeads(counselorLeads.length);

    // Calculate counselor-specific metrics.
    const enrolledLeads = counselorLeads.filter(lead => lead.stage === 'Enrolled').length;
    setClosedDeals(enrolledLeads);
    if (counselorLeads.length > 0) {
      setConversionRate(Math.round((enrolledLeads / counselorLeads.length) * 100));
    }

    // Filter tasks assigned to the current counselor from all leads' tasks.
    const counselorTasks = allLeads.flatMap(lead => lead.tasks).filter(task => task.assignedUserId === CURRENT_USER_ID);
    setMyTasks(counselorTasks);
    
    // Find if any of the counselor's leads have a missed follow-up for today.
    // A missed follow-up is a pending 'Follow-up' task due today for a lead who has not been contacted today.
    const leadToFollowUp = counselorLeads.find(lead => {
      const hasTodaysFollowUp = lead.tasks.some(task => task.type === 'Follow-up' && task.status === 'Pending' && isToday(new Date(task.dueDate)));
      if (!hasTodaysFollowUp) return false;
      const hasBeenContactedToday = lead.activities.some(activity => isToday(new Date(activity.timestamp)));
      return !hasBeenContactedToday;
    });
    setMissedFollowUpLead(leadToFollowUp);
  }, []);
  
  const currentUser = users.find(u => u.id === CURRENT_USER_ID);

  return (
    <div className="space-y-6">
        <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Welcome back, {currentUser?.name.split(' ')[0]}!</h1>
            <p className="text-muted-foreground">Here’s what’s on your plate today.</p>
        </div>
        
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* The MissedFollowUpCard is only rendered if a relevant lead is found */}
            <MissedFollowUpCard lead={missedFollowUpLead} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 lg:col-span-3">
                <StatCard title="My Active Leads" value={totalLeads.toString()} change="+10 since last week" icon={UserCheck} color="text-primary" />
                <StatCard title="My Conversion Rate" value={`${conversionRate}%`} change="+1.2% from last month" icon={Target} color="text-green-500" />
                <StatCard title="Deals Closed (Month)" value={`${closedDeals}`} change="+3 this month" icon={TrendingUp} color="text-yellow-500" />
            </div>

            <Card className="lg:col-span-2">
                <CardHeader><CardTitle>My Lead Pipeline</CardTitle></CardHeader>
                <CardContent className="h-[240px]">
                    {/* Visual representation of the counselor's personal lead funnel */}
                    <div className="space-y-4 h-full flex flex-col justify-center">
                        {KANBAN_STAGES.filter(s=>s !== 'Dropped').map(stage => {
                            const count = myLeads.filter(l => l.stage === stage).length;
                            const maxCount = totalLeads > 0 ? totalLeads : 1;
                            const width = (count / maxCount) * 100;
                            return (
                                <div key={stage} className="flex items-center">
                                    <StageBadge stage={stage} className="w-24 justify-center" />
                                    <div className="ml-4 flex-1">
                                        <div className="h-2 rounded-full bg-secondary"><div className="h-2 rounded-full bg-primary" style={{ width: `${width}%`}}></div></div>
                                    </div>
                                    <span className="ml-4 text-sm font-semibold text-muted-foreground w-8 text-right">{count}</span>
                                </div>
                            )
                        })}
                    </div>
                </CardContent>
            </Card>

             <Card className="lg:col-span-1">
                <CardHeader><CardTitle>My Upcoming Tasks</CardTitle></CardHeader>
                <CardContent className="h-[240px]">
                    <UpcomingTasks tasks={myTasks} />
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
