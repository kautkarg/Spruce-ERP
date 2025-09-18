/**
 * @file This component provides a dialog for securely exporting contacts data.
 * It includes a button to trigger the dialog and a confirmation step to prevent accidental exports.
 */
"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Lead } from "@/lib/types";
import { users } from "@/lib/users-data";

interface ExportContactsDialogProps {
  leads: Lead[];
}

export function ExportContactsDialog({ leads }: ExportContactsDialogProps) {
  const [isExportDialogOpen, setExportDialogOpen] = React.useState(false);
  const [exportConfirmation, setExportConfirmation] = React.useState("");
  const { toast } = useToast();

  React.useEffect(() => {
    if (!isExportDialogOpen) {
      setExportConfirmation("");
    }
  }, [isExportDialogOpen]);

  const handleExport = () => {
    const dataToExport = leads.map(lead => {
      const { activities, tasks, documents, ...rest } = lead;
      const counselor = users.find(u => u.id === rest.assignedUserId);
      return {
        ...rest,
        assignedUserName: counselor?.name || 'Unassigned',
        phoneNumbers: rest.phoneNumbers.map(p => `${p.title}: ${p.number}`).join(', ')
      };
    });

    if (dataToExport.length === 0) {
        toast({ variant: "destructive", title: "No Data", description: "There is no data to export." });
        setExportDialogOpen(false);
        return;
    }

    const csvContent = "data:text/csv;charset=utf-8," 
      + [
          Object.keys(dataToExport[0]),
          ...dataToExport.map(item => Object.values(item).map(val => `"${String(val).replace(/"/g, '""')}"`))
        ].map(e => e.join(",")).join("\n");
        
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "contacts_export.csv");
    document.body.appendChild(link);
    
    link.click();
    document.body.removeChild(link);
    setExportDialogOpen(false);
    toast({ title: "Export Successful", description: "Your data has been downloaded as a CSV file."});
  }

  return (
    <>
      <Button variant="outline" onClick={() => setExportDialogOpen(true)}>
        <Download className="mr-2 h-4 w-4" /> Export
      </Button>
      
      <AlertDialog open={isExportDialogOpen} onOpenChange={setExportDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Data Export</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to export all contacts data as a CSV file.
              To confirm, please type <strong>EXPORT</strong> in the box below.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="my-2">
            <Label htmlFor="export-confirm" className="sr-only">Confirm Export</Label>
            <Input
              id="export-confirm"
              value={exportConfirmation}
              onChange={(e) => setExportConfirmation(e.target.value)}
              placeholder='Type "EXPORT" to confirm'
              autoComplete="off"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleExport} 
              disabled={exportConfirmation !== "EXPORT"}
            >
              Export Data
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
