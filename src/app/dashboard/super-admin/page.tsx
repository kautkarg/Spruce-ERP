/**
 * @file This file defines the main dashboard page for the Super Admin role.
 * It displays an overview of key metrics, charts, recent activities, and upcoming tasks.
 * This is a client component ("use client") because it uses `useState` and `useEffect` to
 * manage its state, which is necessary for handling dynamic data and avoiding hydration errors
 * with the mock data generation.
 */
"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { TrendingUp, Target, BookOpen, Users, MoreVertical, ListTodo, Filter, UserCheck, Activity as ActivityIcon, Phone, AlertTriangle } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { overviewChartData, recentActivities, getLeads } from "@/lib/data";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { format, isToday } from "date-fns";
import { StageBadge } from "@/components/leads/stage-badge";
import { KANBAN_STAGES, Lead, Task } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * A reusable card component to display a single statistic.
 * This is a key building block for the dashboard UI.
 * @param {object} props - The component props.
 * @param {string} props.title - The title of the stat card.
 * @param {string} props.value - The main value to display.
 * @param {string} [props.change] - A string describing the change from a previous period (e.g., "+12% from last month").
 * @param {React.ElementType} props.icon - The icon component to display on the card.
 * @param {string} props.color - The Tailwind CSS color class for the icon.
 * @returns {JSX.Element} A card displaying a single dashboard statistic.
 */
function StatCard({ title, value, change, icon: Icon, color }: { title: string, value: string, change?: string, icon: React.ElementType, color: string }) {
  return (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <Icon className={cn("w-5 h-5 text-muted-foreground", color)} />
        </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change && <p className="text-xs text-muted-foreground">{change}</p>}
      </CardContent>
    </Card>
  )
}

/**
 * A component that renders the revenue overview bar chart using the Recharts library.
 * It's configured to be responsive and styled according to the application's theme.
 * @returns {JSX.Element} A responsive bar chart.
 */
function RevenueChart() {
    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={overviewChartData}>
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value / 1000}k`} />
                <Tooltip 
                    cursor={{fill: 'hsl(var(--accent))', radius: 'var(--radius)'}}
                    contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)' }}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
    )
}

/**
 * A component that renders the list of recent activities from mock data.
 * In a real application, this would fetch live activity data from a service.
 * @returns {JSX.Element} A list of recent user activities.
 */
function RecentActivityList() {
    const getImage = (id: string) => PlaceHolderImages.find(img => img.id === id)?.imageUrl || ''
    return (
        <div className="space-y-4">
            {recentActivities.map(activity => (
                 <div key={activity.email} className="flex items-center">
                    <Avatar className="h-9 w-9">
                        <AvatarImage src={getImage(activity.avatarUrl)} alt={activity.name} />
                        <AvatarFallback>{activity.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="ml-4 space-y-1">
                        <p className="text-sm font-medium leading-none">{activity.name}</p>
                        <p className="text-sm text-muted-foreground">{activity.action}</p>
                    </div>
                    <div className="ml-auto font-medium text-xs text-muted-foreground">{activity.timestamp}</div>
                </div>
            ))}
        </div>
    )
}

/**
 * A component that displays a list of the next few upcoming tasks.
 * It filters pending tasks from the global task list.
 * @param {object} props - The component props.
 * @param {Task[]} props.tasks - An array of all task objects.
 * @returns {JSX.Element} A compact list of upcoming tasks.
 */
function UpcomingTasks({tasks}: {tasks: Task[]}) {
  // Filters for the first 4 pending tasks to show a preview.
  const upcoming = tasks.filter(t => t.status === 'Pending').slice(0, 4);

  if (upcoming.length === 0) {
      return <div className="h-full flex items-center justify-center"><p className="text-sm text-muted-foreground">No pending tasks. You're all caught up!</p></div>
  }

  return (
     <div className="space-y-4">
      {upcoming.map(task => (
        <div key={task.id} className="flex items-start">
          <div className="flex h-5 w-5 items-center justify-center rounded-sm bg-primary/10 border border-primary/20">
            <ListTodo className="h-3 w-3 text-primary" />
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium leading-tight">{task.notes}</p>
            <p className="text-xs text-muted-foreground">
              {format(new Date(task.dueDate), 'MMM dd, yyyy')}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * A visual funnel chart representing the distribution of leads across different stages.
 * This provides a quick overview of the sales pipeline's health.
 * @param {object} props - The component props.
 * @param {Lead[]} props.leads - An array of all lead objects.
 * @returns {JSX.Element} A funnel chart visualization.
 */
function LeadFunnel({leads}: {leads: Lead[]}) {
    const funnelStages = KANBAN_STAGES.filter(s => s !== 'Dropped');
    const [stageCounts, setStageCounts] = useState<Record<string, number>>({});

    useEffect(() => {
        // This effect counts how many leads are in each Kanban stage.
        const counts = leads.reduce((acc, lead) => {
            acc[lead.stage] = (acc[lead.stage] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        setStageCounts(counts);
    }, [leads]);

    const maxCount = Math.max(...Object.values(stageCounts), 1);

    return (
        <div className="space-y-4 h-full flex flex-col justify-center">
            {funnelStages.map((stage) => {
                const count = stageCounts[stage] || 0;
                const width = (count / maxCount) * 100;
                return (
                    <div key={stage} className="flex items-center">
                        <StageBadge stage={stage} className="w-24 justify-center" />
                        <div className="ml-4 flex-1">
                            {/* The length of the bar represents the number of leads in that stage. */}
                            <div className="h-2 rounded-full bg-secondary">
                                <div className="h-2 rounded-full bg-primary" style={{ width: `${width}%`}}></div>
                            </div>
                        </div>
                        <span className="ml-4 text-sm font-semibold text-muted-foreground w-8 text-right">{count}</span>
                    </div>
                )
            })}
        </div>
    )
}

/**
 * A special card that appears if a lead has a follow-up task due today but has not been contacted.
 * This serves as a critical alert for the sales team.
 * @param {object} props - The component props.
 * @param {Lead | undefined} props.lead - The lead with a missed follow-up. If undefined, the card is not rendered.
 * @returns {JSX.Element | null} A prominent alert card or null.
 */
function MissedFollowUpCard({ lead }: { lead: Lead | undefined }) {
  const getImage = (id: string) => PlaceHolderImages.find(img => img.id === id)?.imageUrl || ''
  
  // Don't render anything if there's no missed follow-up.
  if (!lead) {
    return null;
  }
  
  const task = lead.tasks.find(t => isToday(new Date(t.dueDate)));

  return (
    <Card className="col-span-1 md:col-span-2 lg:col-span-4 bg-destructive/10 border-destructive">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <AlertTriangle className="w-5 h-5" />
          <span>Missed Follow-up</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12 border-2 border-destructive/50">
            <AvatarImage src={getImage(lead.avatarUrl)} alt={lead.name} />
            <AvatarFallback>{lead.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-bold text-lg">{lead.name}</p>
            <p className="text-sm text-destructive">
              Follow-up was due {task ? `at ${format(new Date(task.dueDate), 'p')}` : 'today'}.
            </p>
          </div>
        </div>
        <div className="flex gap-2 self-end sm:self-center">
          <Button variant="outline" size="sm">
            <Phone className="w-4 h-4 mr-2" />
            Log Call
          </Button>
          <Button variant="secondary" size="sm">View Profile</Button>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * The main component for the Super Admin Dashboard page.
 * It orchestrates all the smaller components to create the full dashboard view.
 * It uses client-side data fetching in `useEffect` to avoid hydration errors caused by
 * random mock data generation on the server vs. client.
 * @returns {JSX.Element} The complete Super Admin dashboard.
 */
export default function SuperAdminDashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [missedFollowUpLead, setMissedFollowUpLead] = useState<Lead | undefined>();

  // Data is fetched on the client-side after the component mounts.
  // This is a common pattern in Next.js to prevent hydration errors when dealing with
  // data that may differ between the server-render and the client-render (like our random mock data).
  useEffect(() => {
    const allLeads = getLeads();
    setLeads(allLeads);
    
    const allTasks = allLeads.flatMap(lead => lead.tasks);
    setTasks(allTasks);

    // This logic finds a lead with a follow-up task scheduled for today who hasn't been contacted yet.
    // It's a key feature for ensuring timely sales follow-ups.
    const leadToFollowUp = allLeads.find(lead => {
      const hasTodaysFollowUp = lead.tasks.some(task => 
        task.type === 'Follow-up' && 
        task.status === 'Pending' && 
        isToday(new Date(task.dueDate))
      );
      
      if (!hasTodaysFollowUp) return false;
      
      const hasBeenContactedToday = lead.activities.some(activity => 
        isToday(new Date(activity.timestamp))
      );
      
      return !hasBeenContactedToday;
    });
    setMissedFollowUpLead(leadToFollowUp);
  }, []);

  return (
    <div className="space-y-6">
        <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Welcome back, Admin!</h1>
            <p className="text-muted-foreground">Here’s a snapshot of your organization's performance.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MissedFollowUpCard lead={missedFollowUpLead} />
            
            <StatCard title="Total Revenue" value="₹1.25Cr" change="+12% from last month" icon={TrendingUp} color="text-blue-500" />
            <StatCard title="New Leads" value="+1,245" change="+8.5% from last month" icon={Users} color="text-orange-500" />
            <StatCard title="Conversion Rate" value="15.3%" change="+1.2% from last month" icon={Target} color="text-green-500" />
            <StatCard title="Active Courses" value="12" icon={BookOpen} color="text-purple-500" />

            <Card className="lg:col-span-2">
                <CardHeader>
                    <CardTitle className="flex items-center justify-between text-base">
                        <span>Lead Conversion Funnel</span>
                         <Button variant="ghost" size="icon" className="w-6 h-6"><Filter className="w-4 h-4 text-muted-foreground" /></Button>
                    </CardTitle>
                </CardHeader>
                <CardContent className="h-[240px]">
                    <LeadFunnel leads={leads} />
                </CardContent>
            </Card>

            <Card className="lg:col-span-2 row-span-2">
                <CardHeader>
                    <CardTitle className="flex items-center justify-between text-base">
                        <span>Revenue Overview</span>
                        <Button variant="ghost" size="icon" className="w-6 h-6"><MoreVertical className="w-4 h-4 text-muted-foreground" /></Button>
                    </CardTitle>
                </CardHeader>
                <CardContent className="h-[290px] pl-2">
                    <RevenueChart />
                </CardContent>
            </Card>
            
            <Card className="lg:col-span-2">
                <CardHeader>
                    <CardTitle className="flex items-center justify-between text-base">
                        <span>Upcoming Tasks</span>
                        <Button variant="ghost" size="icon" className="w-6 h-6"><UserCheck className="w-4 h-4 text-muted-foreground" /></Button>
                    </CardTitle>
                </CardHeader>
                <CardContent className="h-[240px]">
                    <UpcomingTasks tasks={tasks} />
                </CardContent>
            </Card>
            
            <Card className="lg:col-span-2">
                <CardHeader>
                    <CardTitle className="flex items-center justify-between text-base">
                        <span>Recent Activity</span>
                        <Button variant="ghost" size="icon" className="w-6 h-6"><ActivityIcon className="w-4 h-4 text-muted-foreground" /></Button>
                    </CardTitle>
                </CardHeader>
                <CardContent className="h-[240px]">
                    <RecentActivityList />
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
