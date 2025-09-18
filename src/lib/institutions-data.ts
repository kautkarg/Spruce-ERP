/**
 * @file This file contains the mock data and data management functions for institutions.
 * In a real application, this would be replaced with API calls to a database.
 */
import { Institution } from "./types";
import { users } from "./users-data";

const salesTeam = users.filter(u => u.role.id === 'counselor' || u.role.id === 'admin');

// Initial array of institution data.
export let institutions: Institution[] = [
    {
        id: "INST-001",
        name: "IIT Delhi",
        type: "University",
        city: "New Delhi",
        state: "Delhi",
        country: "India",
        website: "home.iitd.ac.in",
        contacts: [
            { id: "ICON-001-1", name: "Dr. Anish Kapoor", designation: "Dean of Admissions", email: "dean.admissions@iitd.ac.in", phone: "9876543210" },
            { id: "ICON-001-2", name: "Ms. Sunita Sharma", designation: "Admissions Officer", email: "sunita.s@iitd.ac.in", phone: "9876543211" }
        ],
        activities: [
            { id: "ACT-I1-1", type: 'Call', timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), outcome: 'Discussed partnership for 2025.', notes: 'Positive response. Scheduled a follow-up meeting.', userId: 'user-5' }
        ],
        assignedUserId: 'user-5',
    },
    {
        id: "INST-002",
        name: "St. Xavier's College, Mumbai",
        type: "College",
        city: "Mumbai",
        state: "Maharashtra",
        country: "India",
        website: "xaviers.edu",
        contacts: [
            { id: "ICON-002-1", name: "Fr. John Almeida", designation: "Principal", email: "principal@xaviers.edu", phone: "9988776655" }
        ],
        activities: [],
        assignedUserId: 'user-6',
    },
    {
        id: "INST-003",
        name: "Tech Solutions Inc.",
        type: "Corporate",
        city: "Bengaluru",
        state: "Karnataka",
        country: "India",
        website: "techsolutions.com",
        contacts: [
            { id: "ICON-003-1", name: "Mr. Rajesh Kumar", designation: "HR Manager", email: "rajesh.k@techsolutions.com", phone: "9123456789" }
        ],
        activities: [
             { id: "ACT-I3-1", type: 'Email', timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), outcome: 'Sent proposal for corporate training.', notes: 'Awaiting response.', userId: 'user-5' }
        ],
        assignedUserId: 'user-5',
    },
    {
        id: "INST-004",
        name: "Delhi Public School, R.K. Puram",
        type: "School",
        city: "New Delhi",
        state: "Delhi",
        country: "India",
        website: "dpsrkp.net",
        contacts: [
            { id: "ICON-004-1", name: "Mrs. Vandana Dhawan", designation: "Principal", email: "principal@dpsrkp.net", phone: "9811223344" }
        ],
        activities: [],
        assignedUserId: 'user-6',
    }
];

export function getInstitutions(): Institution[] {
    return institutions;
}

export function addInstitution(institution: Omit<Institution, 'id' | 'contacts' | 'activities'>): Institution {
    const newId = `INST-${String(institutions.length + 1).padStart(3, '0')}`;
    const newInstitution: Institution = {
        ...institution,
        id: newId,
        contacts: [],
        activities: [],
    };
    institutions.unshift(newInstitution);
    return newInstitution;
}
