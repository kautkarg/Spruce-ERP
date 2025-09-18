/**
 * @file This file contains all the core TypeScript type definitions used throughout the application.
 * Defining types here ensures consistency and provides autocompletion and error-checking benefits.
 */

import { LucideIcon } from "lucide-react";

// Represents the different stages a lead can be in.
export type KanbanStage = 'New' | 'Contacted' | 'Qualified' | 'Application' | 'Enrolled' | 'Dropped';

// An array of all possible Kanban stages, useful for iterating.
export const KANBAN_STAGES: KanbanStage[] = ['New', 'Contacted', 'Qualified', 'Application', 'Enrolled', 'Dropped'];

// Represents a single activity, like a call or email, logged for a lead.
export type Activity = {
  id: string;
  type: 'Call' | 'Email' | 'SMS' | 'WhatsApp' | 'Walk in' | 'System';
  timestamp: string; // The date and time the activity occurred.
  outcome: string; // A brief summary of the result (e.g., "Demo scheduled").
  notes: string; // Detailed notes about the activity.
  userId: string; // The ID of the user who performed the activity.
};

// Represents a single to-do item or task associated with a lead.
export type Task = {
  id: string;
  leadId: string; // The ID of the lead this task belongs to.
  type: 'Follow-up' | 'Meeting' | 'Documentation';
  dueDate: string; // The date the task is due.
  status: 'Pending' | 'Completed' | 'Overdue';
  priority: 'High' | 'Medium' | 'Low';
  notes: string; // A description of the task.
  assignedUserId: string; // The ID of the user this task is assigned to.
};

// Represents a document uploaded for a lead, like a marksheet or ID.
export type Document = {
  id: string;
  type: '10th Marksheet' | '12th Marksheet' | 'Photo ID' | 'Application Form';
  uploadDate: string;
  url: string; // A link to the document file.
  verified: boolean; // Whether the document has been verified.
};

// Represents a single contact person associated with a lead (e.g., a parent).
export type LeadContact = {
  id: string;
  name: string;
  relation: 'Father' | 'Mother' | 'Guardian' | 'Other';
  phone?: string;
  email?: string;
};

// Represents a single phone number entry for a lead.
export type LeadPhoneNumber = {
  title: string;
  number: string;
}

// Represents the core data structure for a lead.
export type Lead = {
  id: string;
  name: string;
  avatarUrl: string; // A URL or ID for the lead's profile picture.
  email: string;
  stage: KanbanStage; // The current stage of the lead in the pipeline.
  source: string; // How the lead was acquired (e.g., "Website", "Referral").
  assignedUserId: string; // The ID of the counselor assigned to this lead.
  createdAt: string; // The date the lead was created.
  phoneNumbers: LeadPhoneNumber[];
  education?: string; // The lead's educational background.
  college?: string; // The lead's college or university.
  status?: 'Passed' | 'Pursuing'; // The lead's current academic status.
  courseInterest?: string; // The course the lead is interested in.
  address?: string;
  city?: string;
  gender?: 'Male' | 'Female' | 'Other';
  dob?: string;
  activities: Activity[]; // A list of all activities logged for this lead.
  tasks: Task[]; // A list of all tasks for this lead.
  documents: Document[]; // A list of all documents for this lead.
  contacts: LeadContact[]; // A list of associated contacts for the lead.
};

// Represents a single contact person at an institution.
export type InstitutionContact = {
  id: string;
  name: string;
  designation: string;
  email: string;
  phone: string;
};

// Represents an educational institution or corporate partner.
export type Institution = {
  id: string;
  name: string;
  type: 'College' | 'University' | 'Corporate' | 'School';
  city: string;
  state: string;
  country: string;
  website?: string;
  contacts: InstitutionContact[];
  activities: Activity[];
  assignedUserId: string; // User responsible for this institutional account
};


// Represents the data structure for a course.
export type Course = {
  id: string;
  title: string;
  description: string;
  duration: string; // e.g., "6 Months".
  fees: number; // The course fee in rupees.
  instructor: string;
  imageUrl: string; // A URL or ID for the course's image.
};

// Represents the data structure for a user of the application.
export type User = {
    id: string;
    name: string;
    email: string;
    role: { id: string; name: string }; // The user's role, linking to the Role type.
};

/**
 * Defines the structure for a single navigation item.
 * This is used to build the sidebar and other navigation menus.
 */
export type NavItem = {
    href: string;
    label: string;
    icon: LucideIcon;
};
