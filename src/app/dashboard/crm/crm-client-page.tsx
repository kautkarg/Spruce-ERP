/**
 * @file This is a client-side component that manages the state and interactions
 * for the main CRM page. It handles the display of the lead profile dialog
 * and provides the necessary logic for viewing and updating leads.
 */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AddLeadForm } from "@/components/leads/add-lead-form";
import { BulkUploadDialog } from "@/components/crm/bulk-upload-dialog";
import { LeadProfileDialog } from "@/components/crm/lead-profile-dialog";
import { Lead } from "@/lib/types";
import { CrmContent } from "./crm-content";
import { ExportContactsDialog } from "@/components/crm/export-contacts-dialog";
import { DistributeLeadsDialog } from "@/components/crm/distribute-leads-dialog";

/**
 * CrmClientPage component. This is the main client-side wrapper for the CRM section.
 * It manages the state for the selected lead and the visibility of the profile dialog.
 * @param {object} props - The component props.
 * @param {Lead[]} props.leads - An array of lead objects to be displayed.
 * @returns A JSX element rendering the CRM page client-side logic.
 */
export function CrmClientPage({ leads }: { leads: Lead[] }) {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const router = useRouter();

  /**
   * Handles the action of viewing a lead's profile.
   * Sets the selected lead and opens the dialog.
   * @param lead - The lead object to view.
   */
  const handleViewProfile = (lead: Lead) => {
    setSelectedLead(lead);
    setIsProfileOpen(true);
  };

  /**
   * Handles the open/close state change of the lead profile dialog.
   * @param isOpen - The new state of the dialog.
   */
  const handleProfileOpenChange = (isOpen: boolean) => {
    setIsProfileOpen(isOpen);
    if (!isOpen) {
      setSelectedLead(null); // Clear selected lead when dialog is closed
    }
  };

  /**
   * Handles the optimistic update of a lead in the UI after an edit.
   * It refreshes the page to ensure data consistency.
   * @param updatedLead - The lead object with updated information.
   */
  const handleLeadUpdate = (updatedLead: Lead) => {
    // Optimistically update the lead in the dialog for immediate feedback.
    setSelectedLead(updatedLead);
    // The server action's revalidation will handle the main data update,
    // but a soft refresh can make the UI feel faster.
    router.refresh();
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6 -mt-6">
          {/* This div provides spacing to align the buttons correctly. */}
          <div></div>
          <div className="flex items-center gap-2">
            <DistributeLeadsDialog leads={leads} />
            <BulkUploadDialog />
            <ExportContactsDialog leads={leads} />
            <AddLeadForm />
          </div>
      </div>
      
      {/* The main content area for the CRM, including the pipeline and contacts table */}
      <CrmContent leads={leads} onViewProfile={handleViewProfile} />

      {/* The dialog for viewing and editing a single lead's profile */}
      <LeadProfileDialog
        lead={selectedLead}
        isOpen={isProfileOpen}
        onOpenChange={handleProfileOpenChange}
        onLeadUpdate={handleLeadUpdate}
      />
    </>
  );
}
