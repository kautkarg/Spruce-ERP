/**
 * @file This file defines the page for managing institutional partners.
 * It provides a table to view, filter, and manage relationships with organizations
 * like colleges, universities, and corporate partners.
 */
import { getInstitutions } from "@/lib/institutions-data";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { users } from "@/lib/users-data";
import { formatDistanceToNow } from "date-fns";

/**
 * The main component for the Institutions page.
 * It fetches and displays a list of all institutional partners.
 * @returns {JSX.Element} The institutions management page.
 */
export default function InstitutionsPage() {
  const institutions = getInstitutions();

  const getLastActivityDate = (institution: typeof institutions[0]) => {
    if (institution.activities && institution.activities.length > 0) {
      return new Date(institution.activities[0].timestamp);
    }
    return null;
  };

  return (
    <main className="flex flex-1 flex-col p-4 md:p-6">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Institutions</h1>
          <p className="text-muted-foreground">
            Manage your B2B relationships with colleges, universities, and partners.
          </p>
        </div>
        <Button disabled>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Institution
        </Button>
      </div>

      {/* Institutions Table */}
      <div className="border rounded-lg bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Institution</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Account Owner</TableHead>
              <TableHead>Last Activity</TableHead>
              <TableHead>Website</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {institutions.map((inst) => {
              const owner = users.find((u) => u.id === inst.assignedUserId);
              const lastActivity = getLastActivityDate(inst);
              return (
                <TableRow key={inst.id}>
                  <TableCell className="font-medium">{inst.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{inst.type}</Badge>
                  </TableCell>
                  <TableCell>
                    {inst.city}, {inst.state}
                  </TableCell>
                  <TableCell>{owner?.name || "Unassigned"}</TableCell>
                  <TableCell>
                    {lastActivity
                      ? formatDistanceToNow(lastActivity, { addSuffix: true })
                      : "No activity"}
                  </TableCell>
                  <TableCell>
                    {inst.website ? (
                      <Link
                        href={`http://${inst.website}`}
                        target="_blank"
                        className="text-primary hover:underline"
                      >
                        {inst.website}
                      </Link>
                    ) : (
                      <span className="text-muted-foreground">N/A</span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </main>
  );
}
