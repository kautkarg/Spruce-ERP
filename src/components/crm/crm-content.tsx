/**
 * @file This component provides the main content area for the CRM page.
 * It includes the tabs to switch between the "Pipeline" (Kanban) view and
 * the "Contacts" (Table) view.
 */
"use client";

import { useState } from "react";
import { ContactsTable } from "@/components/crm/contacts-table";
import { KanbanBoard } from "@/components/leads/kanban-board";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Lead } from "@/lib/types";
import { List, Kanban } from "lucide-react";
import { LeadProfileDialog } from "@/components/crm/lead-profile-dialog";

/**
 * CrmContent component. Renders the tabbed interface for CRM views.
 * @param {object} props - The component props.
 * @param {Lead[]} props.leads - The array of leads to display.
 * @param {(lead: Lead) => void} props.onViewProfile - Function to handle viewing a lead's profile.
 * @returns A JSX element with the tabbed CRM content.
 */
export function CrmContent({ leads, onViewProfile }: { leads: Lead[]; onViewProfile: (lead: Lead) => void; }) {
  // Although the parent component already manages a dialog, 
  // having state here allows for more direct interaction if needed within this component.
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleViewProfile = (lead: Lead) => {
    setSelectedLead(lead);
    setIsProfileOpen(true);
  };

  const handleProfileOpenChange = (isOpen: boolean) => {
    setIsProfileOpen(isOpen);
    if (!isOpen) {
      setSelectedLead(null);
    }
  };

  /**
   * Optimistically updates the lead data shown in the dialog after an edit.
   * This provides immediate feedback to the user.
   */
  const handleLeadUpdate = (updatedLead: Lead) => {
    setSelectedLead(updatedLead);
  };

  return (
    <>
      <Tabs defaultValue="pipeline" className="flex flex-col flex-1">
        {/* Tab switcher for Pipeline and Contacts views */}
        <div className="">
          <TabsList>
             <TabsTrigger value="pipeline">
              <Kanban className="mr-2 h-4 w-4" />
              Pipeline
            </TabsTrigger>
            <TabsTrigger value="contacts">
              <List className="mr-2 h-4 w-4" />
              Contacts
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Content for the Pipeline (Kanban) view */}
        <TabsContent value="pipeline" className="flex-1 overflow-y-auto pt-4">
            <KanbanBoard leads={leads} onViewProfile={handleViewProfile} />
        </TabsContent>
        
        {/* Content for the Contacts (Table) view */}
        <TabsContent value="contacts" className="flex-1 overflow-y-auto pt-4">
          <div className="bg-card/80 border rounded-lg">
            <ContactsTable data={leads} onViewProfile={handleViewProfile} />
          </div>
        </TabsContent>
      </Tabs>
      
      {/* The dialog for viewing a lead's profile, controlled by this component's state. */}
      <LeadProfileDialog 
        lead={selectedLead} 
        isOpen={isProfileOpen} 
        onOpenChange={handleProfileOpenChange} 
        onLeadUpdate={handleLeadUpdate}
      />
    </>
  );
}
