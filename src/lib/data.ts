/**
 * @file This file is the central source for mock data generation and management.
 * It creates random leads, activities, and tasks, and provides functions
 * to access and manipulate this data in-memory. In a real application,
 * these functions would interact with a database.
 */

import type { Lead, KanbanStage, Activity, LeadContact, LeadPhoneNumber } from '@/lib/types';
import { PlaceHolderImages } from './placeholder-images';
import { courses } from './courses-data';
import { users } from './users-data';

// Arrays of possible values to generate random data.
const firstNames = ['Aarav', 'Sanya', 'Rohan', 'Priya', 'Aditya', 'Diya', 'Vivaan', 'Ananya', 'Kabir', 'Ishaan', 'Mira', 'Arjun', 'Zoya', 'Kian', 'Anika', 'Reyansh', 'Saanvi', 'Advik', 'Kiara', 'Ayaan', 'Aadhya', 'Dhruv', 'Myra', 'Vihaan', 'Anvi', 'Sai', 'Riya', 'Arnav', 'Pari', 'Neel', 'Ira', 'Krish', 'Sia', 'Shaurya', 'Navya', 'Dev', 'Avani', 'Yash', 'Zara', 'Aryan'];
const lastNames = ['Sharma', 'Iyer', 'Mehta', 'Patel', 'Singh', 'Gupta', 'Kumar', 'Reddy', 'Das', 'Joshi', 'Kapoor', 'Nair', 'Khan', 'Malhotra', 'Verma', 'Biswas', 'Chopra', 'Dubey', 'Ghosh', 'Jain', 'Kulkarni', 'Menon', 'Mishra', 'Pandey', 'Rao', 'Saxena', 'Shah', 'Thakur', 'Trivedi', 'Varma'];
const sources = ['Website', 'Referral', 'Social Media', 'Walk-in', 'Online', 'College Seminar', 'Other'];
const statuses: ('Passed' | 'Pursuing')[] = ['Passed', 'Pursuing'];
const educations = ['B.Tech CSE', 'B.Com', '12th Grade', 'M.Sc IT', 'BCA', 'B.A. English', 'B.Tech ECE', 'B.Sc Physics', 'Diploma in IT', 'MBA', 'B.E. Mechanical', 'MBBS', 'B.Arch', 'LLB'];
const colleges = ['IIT Delhi', 'Mumbai University', 'Nirma University', 'IGNOU', 'St. Xavier\'s College', 'VIT Vellore', 'IISc Bangalore', 'IIM Ahmedabad', 'Anna University', 'Jadavpur University', 'SPPU', 'Christ University'];
const counselors = users.filter(u => u.role.id === 'counselor').map(c => c.id);
const KANBAN_STAGES_FOR_GENERATION: KanbanStage[] = ['New', 'Contacted', 'Qualified', 'Application', 'Enrolled', 'Dropped'];
const cities = ['Delhi', 'Mumbai', 'Ahmedabad', 'Pune', 'Bangalore', 'Chennai', 'Kolkata'];
const genders: ('Male' | 'Female' | 'Other')[] = ['Male', 'Female', 'Other'];

// In-memory cache for generated leads.
let leads: Lead[] = [];

/**
 * Generates a specified number of random leads.
 * If leads have already been generated, it returns the cached list.
 * @param count - The number of leads to generate.
 * @returns An array of generated lead objects.
 */
export function generateLeads(count: number): Lead[] {
    if (leads.length > 0 && leads.length === count) return leads;
    
    const newLeads: Lead[] = [];
    for (let i = 1; i <= count; i++) {
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        const name = `${firstName} ${lastName}`;
        const stage = KANBAN_STAGES_FOR_GENERATION[Math.floor(Math.random() * KANBAN_STAGES_FOR_GENERATION.length)];
        
        // Generate associated activities and tasks for each lead.
        const activities: Activity[] = [];
        if (Math.random() > 0.3) { // 70% chance of having activities
            const activityCount = Math.floor(Math.random() * 3) + 1;
            for(let j=0; j<activityCount; j++) activities.push({ id: `ACT-${i}-${j}`, type: ['Call', 'Email', 'SMS', 'WhatsApp', 'Walk in'][Math.floor(Math.random() * 5)] as any, timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(), outcome: ['Sent info', 'No answer', 'Followed up', 'Demo scheduled'][Math.floor(Math.random() * 4)], notes: 'This is a sample note for the activity.', userId: counselors[Math.floor(Math.random() * counselors.length)], });
            activities.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        }

        const tasks: Lead['tasks'] = [];
        if (stage !== 'Enrolled' && stage !== 'Dropped' && Math.random() > 0.5) {
             tasks.push({ id: `TSK-${i}`, leadId: String(i).padStart(3, '0'), type: 'Follow-up', dueDate: new Date(Date.now() + Math.random() * 14 * 24 * 60 * 60 * 1000).toISOString(), status: 'Pending', priority: ['High', 'Medium', 'Low'][Math.floor(Math.random() * 3)] as any, notes: `Follow up with ${name}`, assignedUserId: counselors[Math.floor(Math.random() * counselors.length)], });
        }
        
        const contacts: LeadContact[] = [];
        if (Math.random() > 0.7) { // 30% chance of having associated contacts
            const parentFirstName = firstNames[Math.floor(Math.random() * firstNames.length)];
            contacts.push({
                id: `CONTACT-${i}-1`,
                name: `${parentFirstName} ${lastName}`,
                relation: 'Father',
                phone: `998877${String(10000 + i).padStart(5, '0')}`,
                email: `${parentFirstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`
            })
        }

        newLeads.push({
            id: String(i).padStart(3, '0'),
            name,
            email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`,
            avatarUrl: String(i),
            stage,
            createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
            source: sources[Math.floor(Math.random() * sources.length)],
            phoneNumbers: [{ title: 'Mobile', number: `98765${String(10000 + i).padStart(5, '0')}` }],
            education: educations[Math.floor(Math.random() * educations.length)],
            college: colleges[Math.floor(Math.random() * colleges.length)],
            status: statuses[Math.floor(Math.random() * statuses.length)],
            courseInterest: courses[Math.floor(Math.random() * courses.length)].title,
            assignedUserId: counselors.length > 0 ? counselors[Math.floor(Math.random() * counselors.length)] : 'user-1',
            city: cities[Math.floor(Math.random() * cities.length)],
            gender: genders[Math.floor(Math.random() * genders.length)],
            dob: new Date(Date.now() - (18 + Math.random() * 10) * 365 * 24 * 60 * 60 * 1000).toISOString(),
            activities,
            tasks,
            documents: [],
            contacts,
        });
    }
    
    leads = newLeads;

    // Ensure placeholder images exist for all generated leads.
    const existingIds = new Set(PlaceHolderImages.map(p => p.id));
    for (let i = 1; i <= count; i++) {
        const avatarId = String(i);
        if (!existingIds.has(avatarId)) PlaceHolderImages.push({ id: avatarId, description: `User avatar ${avatarId}`, imageUrl: `https://picsum.photos/seed/${avatarId}/40/40`, imageHint: "person avatar" });
    }

    return leads;
};

/**
 * Retrieves the list of leads, generating them if they don't exist yet.
 * @returns An array of lead objects.
 */
export const getLeads = (): Lead[] => {
    if (leads.length === 0) generateLeads(100);
    return leads;
}

/**
 * Adds a new lead to the in-memory store.
 * It also automatically creates a "System" activity to log the creation event.
 * @param lead - The lead data to add. This excludes fields that are auto-generated.
 * @returns The newly created lead object, complete with all generated fields.
 */
export function addLead(lead: Omit<Lead, 'id' | 'avatarUrl' | 'createdAt' | 'stage' | 'assignedUserId' | 'activities' | 'tasks' | 'documents' | 'contacts'>): Lead {
    const currentLeads = getLeads();
    const newId = String(currentLeads.length + 1).padStart(3, '0');
    const avatarId = `${currentLeads.length + 1}`;
    
    // Automatically create a "Lead Created" activity log.
    const creationActivity: Activity = {
        id: `ACT-${newId}-0`,
        type: 'System',
        timestamp: new Date().toISOString(),
        outcome: 'Lead Created',
        notes: `Lead was created in the system via ${lead.source}.`,
        userId: 'user-1' // 'user-1' is the Super Admin, representing the system action
    };

    const newLead: Lead = { 
        id: newId, 
        ...lead,
        stage: 'New', 
        avatarUrl: avatarId, 
        createdAt: new Date().toISOString(), 
        assignedUserId: 'user-1', // Default to admin
        activities: [creationActivity], 
        tasks: [], 
        documents: [], 
        contacts: [] 
    };
    leads.unshift(newLead);

    PlaceHolderImages.push({ id: avatarId, description: `User avatar ${avatarId}`, imageUrl: `https://picsum.photos/seed/${avatarId}/40/40`, imageHint: "person avatar" });
    return newLead;
}

/**
 * Updates an existing lead in the in-memory store.
 * @param updatedLead - An object containing the lead ID and the fields to update.
 * @returns The updated lead object, or null if not found.
 */
export function updateLead(updatedLead: Partial<Lead> & { id: string }): Lead | null {
    const leadIndex = getLeads().findIndex(lead => lead.id === updatedLead.id);
    if (leadIndex === -1) return null;
    const originalLead = leads[leadIndex];
    leads[leadIndex] = { ...originalLead, ...updatedLead };
    return leads[leadIndex];
}

/**
 * Updates multiple leads at once. This can be used for changing stage,
 * assigning a single counselor, or distributing leads among multiple counselors.
 * @param leadIds - An array of lead IDs to update.
 * @param updates - An object with the new values to apply. This can be a single update
 *                  (e.g., `{ stage: 'Qualified' }`) or a distribution list for assignments.
 */
export function bulkUpdateLeads(leadIds: string[], updates: {
    stage?: KanbanStage;
    assignedUserId?: string;
    assignedUserIds?: { leadId: string, assignedUserId: string }[];
}) {
    if (updates.assignedUserIds) {
        // Handle distribution of leads to multiple counselors
        const assignmentMap = new Map(updates.assignedUserIds.map(item => [item.leadId, item.assignedUserId]));
        leads.forEach(lead => {
            if (assignmentMap.has(lead.id)) {
                lead.assignedUserId = assignmentMap.get(lead.id)!;
            }
        });
    } else {
        // Handle a single update applied to all selected leads
        const singleUpdate: Partial<Lead> = {};
        if (updates.stage) singleUpdate.stage = updates.stage;
        if (updates.assignedUserId) singleUpdate.assignedUserId = updates.assignedUserId;
        
        if (Object.keys(singleUpdate).length > 0) {
            leads.forEach(lead => {
                if (leadIds.includes(lead.id)) {
                    Object.assign(lead, singleUpdate);
                }
            });
        }
    }
}


/**
 * Deletes multiple leads from the in-memory store.
 * @param leadIds - An array of lead IDs to delete.
 */
export function bulkDeleteLeads(leadIds: string[], updates: {}) {
    leads = leads.filter(lead => !leadIds.includes(lead.id));
}

/**
 * Adds a new activity to a specific lead.
 * @param leadId - The ID of the lead to add the activity to.
 * @param activityData - The activity data to add (type, outcome, notes, userId).
 * @returns The newly created activity object.
 */
export function addActivity(leadId: string, activityData: Omit<Activity, 'id' | 'timestamp'>): Activity {
  const lead = getLeads().find(l => l.id === leadId);
  if (!lead) throw new Error('Lead not found');
  const newActivity: Activity = { ...activityData, id: `ACT-${Date.now()}`, timestamp: new Date().toISOString() };
  lead.activities.unshift(newActivity);
  return newActivity;
}

// Mock data for the dashboard charts and lists.
export const overviewChartData = [
  { name: "Jan", total: Math.floor(Math.random() * 5000) + 1000 },
  { name: "Feb", total: Math.floor(Math.random() * 5000) + 1000 },
  { name: "Mar", total: Math.floor(Math.random() * 5000) + 1000 },
  { name: "Apr", total: Math.floor(Math.random() * 5000) + 1000 },
  { name: "May", total: Math.floor(Math.random() * 5000) + 1000 },
  { name: "Jun", total: Math.floor(Math.random() * 5000) + 1000 },
  { name: "Jul", total: Math.floor(Math.random() * 5000) + 1000 },
  { name: "Aug", total: Math.floor(Math.random() * 5000) + 1000 },
  { name: "Sep", total: Math.floor(Math.random() * 5000) + 1000 },
  { name: "Oct", total: Math.floor(Math.random() * 5000) + 1000 },
  { name: "Nov", total: Math.floor(Math.random() * 5000) + 1000 },
  { name: "Dec", total: Math.floor(Math.random() * 5000) + 1000 },
];
export const recentActivities = [
    { name: "Sanya Iyer", avatarUrl: "2", email: "sanya.iyer@example.com", action: "updated stage to Qualified", timestamp: "5 minutes ago" },
    { name: "Rohan Mehta", avatarUrl: "3", email: "rohan.mehta@example.com", action: "sent a follow-up email", timestamp: "1 hour ago" },
    { name: "Priya Patel", avatarUrl: "4", email: "priya.patel@example.com", action: "submitted application", timestamp: "3 hours ago" },
    { name: "Aditya Singh", avatarUrl: "5", email: "aditya.singh@example.com", action: "scheduled an interview", timestamp: "Yesterday" },
    { name: "Diya Gupta", avatarUrl: "6", email: "diya.gupta@example.com", action: "received an offer", timestamp: "2 days ago" }
];
