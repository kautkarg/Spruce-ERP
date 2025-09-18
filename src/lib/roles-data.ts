/**
 * @file This file contains the definitions for all user roles within the application.
 * Each role has a detailed description of its responsibilities, access scope, and limitations.
 * This centralized file is the single source of truth for role-based access control.
 */

// Defines the structure for a single Role object.
export type Role = {
    id: string; // A unique identifier for the role (e.g., 'super-admin', 'counselor').
    name: string; // The human-readable display name of the role (e.g., "Super Admin").
    coreResponsibilities: string; // A description of the role's primary duties.
    accessScope: string; // The data or area of the app this role can access (e.g., "Organization-wide", "Assigned Leads").
    keyPrivileges: string; // A summary of the most important permissions for this role.
    limitations: string; // A description of what the role is explicitly not allowed to do.
};

// The array containing all role definitions for the application.
export const roles: Role[] = [
    {
        id: "super-admin",
        name: "Super Admin",
        coreResponsibilities: "Full system governance, configuration, and control. Oversees every aspect of platform configuration, role and privilege management, security, integrations, user operations, and reporting.",
        accessScope: "Organization-wide",
        keyPrivileges: "Create/assign roles, configure system/global settings, full data CRUD, audit logs, integration management, billing approvals.",
        limitations: "Cannot be deleted, only reassigned; ultimate system control.",
    },
    {
        id: "admin",
        name: "Admin",
        coreResponsibilities: "Manages daily operational settings, user accounts, and content. Ensures the platform runs smoothly for all users.",
        accessScope: "System-wide (configurable)",
        keyPrivileges: "User management (add/edit/deactivate), manage course content, oversee communication templates, view system reports.",
        limitations: "Cannot create new roles or change global system settings.",
    },
     {
        id: "branch-head",
        name: "Branch Head",
        coreResponsibilities: "Manages all sales and management activities within a specified region. Responsible for building and managing local teams and setting up incentive-based sales partners.",
        accessScope: "Assigned Region/Branch",
        keyPrivileges: "Oversee local teams, manage regional sales pipeline, set up and manage sales partners, view branch-specific reports and analytics.",
        limitations: "Cannot alter global system settings or access data from other branches.",
    },
     {
        id: "sales-head",
        name: "Sales Head",
        coreResponsibilities: "Drives the overall sales strategy and collaborates with colleges and other key institutions. Manages high-level partnerships and sales performance across the organization.",
        accessScope: "Organization-wide Sales Data",
        keyPrivileges: "View all sales pipelines, set sales targets, manage institutional partnerships, analyze sales performance reports, collaborate with branch heads.",
        limitations: "Cannot manage non-sales staff or change global system settings.",
    },
    {
        id: "counselor",
        name: "Counselor",
        coreResponsibilities: "Manages lead and student interactions, from initial contact to enrollment. Guides students through the application process.",
        accessScope: "Assigned Leads & Students",
        keyPrivileges: "Manage leads, update student status, log communications, view student profiles, access course information.",
        limitations: "Cannot access financial data or system-wide settings. View is restricted to their assigned students only.",
    },
    {
        id: "sales-partner",
        name: "Sales Partner",
        coreResponsibilities: "Generates new sales leads for the organization on an incentive or commission basis. Works externally.",
        accessScope: "Personal Partner Portal",
        keyPrivileges: "Submit new leads, track the status of their submitted leads, view personal commission reports.",
        limitations: "No access to internal CRM data, student information, or any other part of the main application.",
    },
    {
        id: "partner-institute",
        name: "Partner Institute",
        coreResponsibilities: "Collaborating institution that provides student admissions. Manages their referred students and tracks their progress.",
        accessScope: "Institute Portal",
        keyPrivileges: "Submit batches of student applications, track admission status for their students, view partnership agreement details and reports.",
        limitations: "Cannot access internal CRM data or information about students not from their institute.",
    },
    {
        id: "affiliate-partner",
        name: "Affiliate Partner",
        coreResponsibilities: "Drives traffic and generates leads through their own channels (e.g., websites, social media) in return for a commission.",
        accessScope: "Affiliate Portal",
        keyPrivileges: "Access unique tracking links, view lead generation and conversion statistics, track commission earnings.",
        limitations: "No access to lead details or any internal system data. Can only see aggregated performance data.",
    },
    {
        id: "corporate-relationship-manager",
        name: "Corporate Relationship Manager",
        coreResponsibilities: "Builds and manages relationships with corporate entities to facilitate student placements and internships.",
        accessScope: "Corporate Partner Data & Placements",
        keyPrivileges: "Manage a database of corporate partners, log interactions, track placement opportunities, coordinate interviews.",
        limitations: "Cannot access student admission or financial data.",
    },
    {
        id: "hr",
        name: "HR",
        coreResponsibilities: "Manages employee lifecycle, including recruitment, onboarding, payroll, and performance management. Note: This role might require a separate, dedicated HR module.",
        accessScope: "Employee Data",
        keyPrivileges: "Manage employee profiles, process payroll, post job openings, manage leave requests.",
        limitations: "No access to student, lead, or financial data outside of employee salaries.",
    },
    {
        id: "finance",
        name: "Finance",
        coreResponsibilities: "Handles all financial transactions, including fee collection, invoicing, and expense tracking. Manages financial reporting.",
        accessScope: "Financial Data",
        keyPrivileges: "Generate invoices, record payments, manage refunds, view financial reports, manage student accounts.",
        limitations: "Cannot access lead management or course content creation.",
    },
    {
        id: "faculty-trainer",
        name: "Faculty/Trainer",
        coreResponsibilities: "Manages course delivery, student assessment, and academic support. Responsible for curriculum execution and student performance tracking.",
        accessScope: "Assigned Courses & Batches",
        keyPrivileges: "Record attendance, grade assignments, upload materials, communicate with students, view training analytics.",
        limitations: "Cannot access student admission/financial data or edit course content.",
    },
    {
        id: "student-user",
        name: "Student/User",
        coreResponsibilities: "Accesses personal academic records, course materials, and communicates with faculty. Manages their own profile and learning progress.",
        accessScope: "Personal Data & Assigned Courses",
        keyPrivileges: "View grades, download materials, submit assignments, view personal profile.",
        limitations: "Cannot access any administrative, financial, or other students' data.",
    }
];
