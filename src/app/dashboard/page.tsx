/**
 * @file This file acts as a router for the main dashboard page.
 * It checks the current user's role and dynamically renders the appropriate
 * dashboard component (e.g., for Super Admin, Counselor, etc.).
 * In a real application, this logic would be more robust, involving
 * proper authentication and role management from a secure session.
 */
import SuperAdminDashboard from "./super-admin/page";
import CounselorDashboard from "./counselor/page";
import DepartmentAdminDashboard from "./department-admin/page";
import { users } from "@/lib/users-data";

/**
 * Gets the current user from the session.
 * In a real production application, this function would securely get the
 * user's session from the request headers or an encrypted cookie.
 * For this demo, we are hardcoding it to allow easy switching between user roles for testing.
 * @returns The current user object or undefined.
 */
const getCurrentUser = () => {
    // In production, this would be replaced with actual authentication logic.
    // For example:
    // const session = await getSession();
    // return session?.user;
    
    // To test different roles, change the user ID here.
    // 'user-1' -> Super Admin
    // 'user-2' -> Department Admin (Admissions)
    // 'user-5' -> Counselor (Shivani Bisen)
    // 'user-6' -> Counselor (Pooja Verma)
    return users.find(u => u.id === 'user-1');
};

/**
 * The main DashboardPage component.
 * It acts as a router to display the correct dashboard based on the user's role.
 * This is a server component, so the logic runs on the server for each request.
 * @returns {JSX.Element} The appropriate dashboard component for the user's role.
 */
export default function DashboardPage() {
    const user = getCurrentUser();

    // If no user is found (e.g., not logged in), you would typically redirect
    // to a login page. For now, we'll fall back to a default view (Super Admin).
    if (!user) {
        return <SuperAdminDashboard />;
    }

    // This switch statement renders the correct dashboard based on the user's role ID.
    switch(user.role.id) {
        case 'super-admin':
            return <SuperAdminDashboard />;
        case 'admin':
            // This logic determines which department dashboard to show for an admin.
            // In a real app, this mapping of user to department would come from your database.
            const departmentId = user.id === 'user-2' ? 'dept-1' : user.id === 'user-3' ? 'dept-3' : 'dept-2';
            return <DepartmentAdminDashboard departmentId={departmentId} />;
        case 'counselor':
            return <CounselorDashboard />;
        // TODO: Add cases for other roles like 'student', 'faculty-trainer', etc. as their dashboards are built.
        default:
            // Fallback to the Super Admin dashboard for any other case or unhandled roles.
            return <SuperAdminDashboard />;
    }
}
