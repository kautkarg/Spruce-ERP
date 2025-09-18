/**
 * @file This file defines the dashboard page for Department Admins.
 * It provides a focused view of metrics and data relevant to a specific department.
 */
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { departments } from "@/lib/departments-data";
import { Users, ClipboardList, ClipboardCheck, AlertTriangle } from "lucide-react";
import { notFound } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Team, User } from "@/lib/types";
import { Progress } from "@/components/ui/progress";

const getImage = (id: string) =>
  PlaceHolderImages.find((img) => img.id === id)?.imageUrl || "";

function StatCard({ title, value, icon: Icon, description }: { title: string, value: string | number, icon: React.ElementType, description?: string }) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                {description && <p className="text-xs text-muted-foreground">{description}</p>}
            </CardContent>
        </Card>
    )
}

function TeamMembers({ members }: { members: User[] }) {
  return (
    <div className="flex -space-x-2 overflow-hidden">
      {members.map((member) => (
        <Avatar key={member.id} className="inline-block h-8 w-8 rounded-full ring-2 ring-background">
          <AvatarImage src={getImage(member.id.replace('user-', ''))} alt={member.name} />
          <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
        </Avatar>
      ))}
    </div>
  );
}


export default function DepartmentAdminDashboard({ departmentId }: { departmentId: string }) {
  const department = departments.find((d) => d.id === departmentId);

  if (!department) {
    notFound();
  }
  
  const allMembers = department.teams.flatMap(team => team.members);

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          {department.name} Department
        </h1>
        <p className="text-muted-foreground">
          An overview of your department's performance and activities.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Members" value={department.totalMembers} icon={Users} description={`${department.teams.length} teams`} />
        <StatCard title="Total Tasks" value={department.tasks.total} icon={ClipboardList} />
        <StatCard title="Tasks Completed" value={department.tasks.completed} icon={ClipboardCheck} description={`${Math.round((department.tasks.completed/department.tasks.total) * 100)}% completion rate`} />
        <StatCard title="Tasks Pending" value={department.tasks.pending} icon={AlertTriangle} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Teams</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Team Name</TableHead>
                  <TableHead>Members</TableHead>
                  <TableHead>Tasks</TableHead>
                  <TableHead>Completion</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {department.teams.map((team: any) => {
                  const totalTasks = team.tasks.length;
                  const completedTasks = team.tasks.filter((t: any) => t.status === 'Completed').length;
                  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
                  return (
                    <TableRow key={team.id}>
                      <TableCell className="font-medium">{team.name}</TableCell>
                      <TableCell><TeamMembers members={team.members} /></TableCell>
                      <TableCell>{totalTasks}</TableCell>
                      <TableCell>
                         <div className="flex items-center gap-2">
                           <Progress value={completionRate} className="w-24 h-2" />
                           <span className="text-xs text-muted-foreground">{completionRate}%</span>
                         </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle>All Members</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {allMembers.map(member => (
                        <div key={member.id} className="flex items-center gap-4">
                            <Avatar className="h-10 w-10">
                                <AvatarImage src={getImage(member.id.replace('user-', ''))} alt={member.name} />
                                <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-medium">{member.name}</p>
                                <p className="text-sm text-muted-foreground">{member.role.name}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
