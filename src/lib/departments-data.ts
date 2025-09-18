/**
 * @file This file contains the mock data for organizational departments.
 * It assembles data from users and tasks to create a structured overview of each department.
 */
import { User, users } from './users-data';
import { Task, tasks } from './tasks-data';

// Defines the structure for a team within a department.
export interface Team {
    id: string;
    name: string;
    adminId: string;
    members: User[];
    tasks: Task[];
}

// Defines the structure for a department.
export interface Department {
    id:string;
    name: string;
    adminId: string;
    teams: Team[];
    totalMembers: number;
    tasks: {
        total: number;
        completed: number;
        pending: number;
        overdue: number;
    };
}

// Assign admins and members to departments from the mock user data.
const dept1Admin = users.find(u => u.role.id === 'admin' && u.id === 'user-2')!;
const dept2Admin = users.find(u => u.role.id === 'admin' && u.id === 'user-4')!;
const dept3Admin = users.find(u => u.role.id === 'admin' && u.id === 'user-3')!;

const membersDept1 = users.filter(u => ['counselor', 'branch-manager'].includes(u.role.id));
const membersDept2 = users.filter(u => u.role.id === 'faculty-trainer');
const membersDept3 = users.filter(u => u.role.id === 'finance');

// Assign tasks to departments from the mock task data.
const tasksDept1 = tasks.slice(0, 5);
const tasksDept2 = tasks.slice(5, 10);
const tasksDept3 = tasks.slice(10, 15);

// The main array of department data.
export const departments: Department[] = [
    {
        id: 'dept-1',
        name: 'Admissions & Counseling',
        adminId: dept1Admin.id,
        teams: [
            { id: 'team-1-1', name: 'Domestic Admissions', adminId: dept1Admin.id, members: membersDept1.slice(0, 2), tasks: tasksDept1.slice(0,3) },
            { id: 'team-1-2', name: 'International Admissions', adminId: dept1Admin.id, members: membersDept1.slice(2, 4), tasks: tasksDept1.slice(3,5) }
        ],
        totalMembers: membersDept1.length,
        tasks: {
            total: tasksDept1.length,
            completed: tasksDept1.filter(t => t.status === 'Completed').length,
            pending: tasksDept1.filter(t => t.status === 'Pending').length,
            overdue: tasksDept1.filter(t => t.status === 'Overdue').length
        }
    },
    {
        id: 'dept-2',
        name: 'Academics & Training',
        adminId: dept2Admin.id,
        teams: [
            { id: 'team-2-1', name: 'Web Development Faculty', adminId: dept2Admin.id, members: membersDept2.slice(0,1), tasks: tasksDept2.slice(0,2) },
            { id: 'team-2-2', name: 'Data Science Faculty', adminId: dept2Admin.id, members: membersDept2.slice(1,2), tasks: tasksDept2.slice(2,5) }
        ],
        totalMembers: membersDept2.length,
        tasks: {
            total: tasksDept2.length,
            completed: tasksDept2.filter(t => t.status === 'Completed').length,
            pending: tasksDept2.filter(t => t.status === 'Pending').length,
            overdue: tasksDept2.filter(t => t.status === 'Overdue').length
        }
    },
    {
        id: 'dept-3',
        name: 'Finance & Operations',
        adminId: dept3Admin.id,
        teams: [
            { id: 'team-3-1', name: 'Billing', adminId: dept3Admin.id, members: membersDept3.slice(0,1), tasks: tasksDept3.slice(0,3) },
            { id: 'team-3-2', name: 'Operations', adminId: dept3Admin.id, members: membersDept3.slice(1,2), tasks: tasksDept3.slice(3,5) }
        ],
        totalMembers: membersDept3.length,
        tasks: {
            total: tasksDept3.length,
            completed: tasksDept3.filter(t => t.status === 'Completed').length,
            pending: tasksDept3.filter(t => t.status === 'Pending').length,
            overdue: tasksDept3.filter(t => t.status === 'Overdue').length
        }
    }
];

// An object containing summary totals for the entire organization.
export const organizationTotals = {
    totalDepartments: departments.length,
    totalAdmins: users.filter(u => u.role.id === 'admin').length,
    totalMembers: users.filter(u => u.role.id !== 'super-admin' && u.role.id !== 'admin').length,
    tasks: {
        total: departments.reduce((sum, dept) => sum + dept.tasks.total, 0),
        completed: departments.reduce((sum, dept) => sum + dept.tasks.completed, 0),
        pending: departments.reduce((sum, dept) => sum + dept.tasks.pending, 0),
        overdue: departments.reduce((sum, dept) => sum + dept.tasks.overdue, 0),
    }
};
