/**
 * @file This file defines the page for displaying and managing organizational departments.
 * It fetches department, user, and image data to render a list of department cards.
 */
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { departments } from "@/lib/departments-data";
import { users } from "@/lib/users-data";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PlaceHolderImages } from "@/lib/placeholder-images";

// Helper functions to get associated data.
const getImage = (id: string) => PlaceHolderImages.find(img => img.id === id)?.imageUrl || "";
const getAdmin = (adminId: string) => users.find(u => u.id === adminId);

/**
 * The main component for the Departments page.
 * It maps through the departments data and renders a card for each one.
 * @returns A JSX element rendering the departments page.
 */
export default function DepartmentsPage() {
  return (
    <main className="flex flex-1 flex-col p-4 md:p-6">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Departments</h1>
          <p className="text-muted-foreground">
            Manage your organization's departments.
          </p>
        </div>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Department
        </Button>
      </div>
      
      {/* Grid for displaying department cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {departments.map(dept => {
          const admin = getAdmin(dept.adminId);
          return (
            <Card key={dept.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{dept.name}</span>
                  {/* Display department admin if one is assigned */}
                  {admin && (
                    <div className="flex items-center gap-2 text-sm font-normal text-muted-foreground">
                       <Avatar className="h-6 w-6">
                        <AvatarImage src={getImage(admin.id.replace('user-', ''))} alt={admin.name} />
                        <AvatarFallback>{admin.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span>{admin.name}</span>
                    </div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Department member and team counts */}
                <div className="text-sm text-muted-foreground">
                  <p>{dept.totalMembers} Members</p>
                  <p>{dept.teams.length} Teams</p>
                </div>
                {/* Task statistics for the department */}
                 <div className="mt-4 flex items-center justify-between text-sm">
                    <div>
                        <p className="font-semibold">{dept.tasks.total}</p>
                        <p className="text-xs text-muted-foreground">Total Tasks</p>
                    </div>
                     <div>
                        <p className="font-semibold text-chart-3">{dept.tasks.completed}</p>
                        <p className="text-xs text-muted-foreground">Completed</p>
                    </div>
                     <div>
                        <p className="font-semibold text-chart-4">{dept.tasks.pending}</p>
                        <p className="text-xs text-muted-foreground">Pending</p>
                    </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </main>
  );
}
