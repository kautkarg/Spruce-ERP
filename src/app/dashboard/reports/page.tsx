/**
 * @file This file defines the "Reports" page of the dashboard.
 * It displays a list of available reports that can be downloaded.
 */
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";

// Mock data for the list of reports.
const reports = [
  { title: "Quarterly Admissions Report", period: "Q2 2024", type: "Admissions" },
  { title: "Monthly Lead Generation Analysis", period: "July 2024", type: "Marketing" },
  { title: "Course Enrollment Statistics", period: "2024 Semester 2", type: "Academics" },
  { title: "Annual Financial Summary", period: "FY 2023-2024", type: "Finance" },
  { title: "Counselor Performance Review", period: "H1 2024", type: "Performance" },
  { title: "Campaign ROI Report", period: "July 2024", type: "Marketing" },
];

/**
 * The main component for the Reports page.
 * It renders a grid of cards, each representing a downloadable report.
 * @returns A JSX element rendering the reports page.
 */
export default function ReportsPage() {
  return (
    <main className="flex flex-1 flex-col p-4 md:p-6">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Reports</h1>
          <p className="text-muted-foreground">
            Generate and view reports for your organization.
          </p>
        </div>
      </div>
      
      {/* Grid for displaying report cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {reports.map((report, index) => (
          <Card key={index}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <FileText className="w-8 h-8 text-muted-foreground" />
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <CardTitle className="text-lg">{report.title}</CardTitle>
              <CardDescription>{report.period}</CardDescription>
              <div className="mt-4">
                <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-full">
                  {report.type}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
