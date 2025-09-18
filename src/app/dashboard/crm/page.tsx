/**
 * @file This file defines the server-side entry point for the CRM page.
 * It is responsible for fetching the initial lead data and passing it to the
 * client-side component that handles the user interactions. It now also
 * filters leads based on the current user's role.
 */
"use client"

import { useEffect, useState } from "react";
import { getLeads } from "@/lib/data";
import { users } from "@/lib/users-data";
import { CrmClientPage } from "./crm-client-page";
import { Lead } from "@/lib/types";

// In a real app, this would come from an auth context.
// For testing purposes, you can switch the user here.
const getCurrentUser = () => {
    // To test as Super Admin (sees all leads), use 'user-1'.
    return users.find(u => u.id === 'user-1');
    
    // To test as a Counselor (sees only assigned leads), use 'user-5' or 'user-6'.
    // return users.find(u => u.id === 'user-5'); // Counselor: Shivani Bisen
    // return users.find(u => u.id === 'user-6'); // Counselor: Pooja Verma
}

/**
 * The main client component for the CRM page.
 * It fetches the list of all leads from the data source and filters them
 * based on the user's role. Using a `useEffect` hook ensures this logic
 * runs on the client, preventing hydration errors from the mock data.
 * @returns A JSX element rendering the CRM page structure.
 */
export default function CrmPage() {
  // State to hold the leads that will be displayed.
  const [leads, setLeads] = useState<Lead[]>([]);

  // useEffect runs on the client after the component mounts.
  // This is the correct place to fetch client-side data or data that might
  // cause hydration issues (like our randomly generated mock data).
  useEffect(() => {
    const allLeads = getLeads();
    const currentUser = getCurrentUser();
    let filteredLeads: Lead[] = [];

    if (currentUser) {
      if (['super-admin', 'admin'].includes(currentUser.role.id)) {
        // Admins and Super Admins can see all leads.
        filteredLeads = allLeads;
      } else if (currentUser.role.id === 'counselor') {
        // Counselors see only leads assigned to them.
        filteredLeads = allLeads.filter(lead => lead.assignedUserId === currentUser.id);
      } else {
        // For any other role, they see no leads by default.
        filteredLeads = [];
      }
    }
    setLeads(filteredLeads);
  }, [])


  return (
    <main className="flex flex-1 flex-col bg-transparent">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">CRM</h1>
          <p className="text-muted-foreground">
            Manage your contacts and leads pipeline.
          </p>
        </div>
      </div>
      
      {/* 
        The CrmClientPage component receives the (potentially filtered) lead data as a prop.
        This pattern separates the top-level page structure and data fetching/filtering logic
        from the component that manages the complex UI state and interactions.
      */}
      <CrmClientPage leads={leads} />
    </main>
  );
}
