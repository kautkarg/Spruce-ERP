/**
 * @file This file defines the page for managing user roles and permissions.
 * It displays a table of all available roles and their descriptions.
 */
import { RolesTable } from "@/components/settings/roles-table";
import { Button } from "@/components/ui/button";
import { roles } from "@/lib/roles-data";
import { PlusCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";


/**
 * The main component for the Roles & Permissions page.
 * @returns A JSX element rendering the roles management page.
 */
export default function RolesPage() {
  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>All Roles</CardTitle>
           <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Role
          </Button>
        </CardHeader>
        <CardContent>
          <RolesTable data={roles} />
        </CardContent>
      </Card>
    </div>
  );
}
