/**
 * @file This file centralizes the navigation configuration for the entire application.
 * It defines which navigation items are visible to each user role, allowing for
 * a personalized and secure user experience. By managing navigation here, we can easily
 * update or change the layout for different roles without touching the component files.
 */
import { Home, Users, Settings, School, Building, FileBarChart, Building2, User, GitBranch, Briefcase, Handshake } from "lucide-react";
import type { NavItem } from "./types";

// A map defining the navigation links available for each specific user role.
// This object's keys match the 'id' of the roles defined in 'roles-data.ts'.
const sidebarNav: Record<string, NavItem[]> = {
    'super-admin': [
        { href: "/dashboard/crm", icon: Users, label: "CRM" },
    ],
    'admin': [
        { href: "/dashboard/crm", icon: Users, label: "CRM" },
    ],
    'counselor': [
        // Counselors have a focused view on their own dashboard and leads.
        { href: "/dashboard/crm", icon: Users, label: "My Leads" },
    ],
    'student': [
        // A student would have a very limited view, focused on their own academic progress.
        { href: "/dashboard/my-courses", icon: School, label: "My Courses" },
        { href: "/dashboard/profile", icon: Users, label: "My Profile" },
    ],
    // Navigation for other roles can be defined here as their dashboards are built out.
    // For example:
    // 'finance': [ ... ],
    // 'hr': [ ... ],
};

// Defines the link for the settings page, which is common to most roles.
const settingsNav: NavItem = {
    href: "/dashboard/settings",
    icon: Settings,
    label: "Settings",
};

/**
 * The main navigation configuration object.
 * This is exported and used by the layout components to build the navigation menus.
 */
export const navConfig = {
    title: "Spruce ERP",
    logo: School, // The icon component to use as the logo.
    sidebarNav,
    settingsNav,
};
