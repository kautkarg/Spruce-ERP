# Spruce ERP: Project Brief & Technical Documentation

This document provides a comprehensive overview of the Spruce ERP application, its core features, and the technical implementation details. This is a production-ready application, not a minimum viable product.

---

## 1. Project Brief

### **1.1 App Name**
Spruce ERP

### **1.2 Core Purpose**
Spruce ERP is a modern, web-based Enterprise Resource Planning application designed for educational institutions. It provides a centralized platform to manage leads, courses, students, and administrative tasks, aiming to streamline operations and improve efficiency.

### **1.3 Key Features**
- **Role-Based Access Control:** Foundation for different user permissions.
- **Lead & CRM Management:** A robust system to capture, track, and manage leads through a visual Kanban pipeline and a detailed contacts table.
- **Course Management:** Functionality to create, view, and manage the institution's course offerings.
- **Departmental Overview:** A section to display and manage organizational departments.
- **Dashboard & Reporting:** A central dashboard for key metrics and a dedicated section for generating reports.

### **1.4 Technology Stack (Reference Implementation)**
- **Framework:** Next.js (with App Router)
- **Language:** TypeScript
- **UI:** React, ShadCN UI Components, Tailwind CSS
- **Styling:** Tailwind CSS with CSS Variables for theming.
- **Icons:** `lucide-react`

---

## 2. Technical Documentation (TDD)

This section details the required implementation for each major feature, described in a technology-agnostic way.

### **2.1 Dashboard**
- **Objective:** Provide a high-level, at-a-glance overview of the institution's performance.
- **Implementation:**
    - The UI should be composed of dynamic components capable of fetching and displaying real-time data.
    - **Stat Cards:** Display key metrics like Total Revenue, New Leads, Conversion Rate, etc. Data should be fetched from a relevant backend service.
    - **Lead Conversion Funnel:** A visual representation of the lead pipeline stages. This must be data-driven, calculating and reflecting the actual distribution of leads across each stage.
    - **Revenue Chart:** A bar chart displaying revenue over a selectable time period (e.g., monthly).
    - **Upcoming Tasks & Recent Activity:** Two separate lists that fetch and display pending tasks and recent lead activities from the database.
    - **Missed Follow-up Card:** A dynamic card that appears if a lead has a follow-up task due today but has no logged contact activity for the same day. This requires logic to compare task due dates with activity timestamps.

### **2.2 CRM / Lead Management**
- **Objective:** Provide comprehensive tools for managing the sales and admissions pipeline.
- **Implementation:**
    - **Main View:** The main page should fetch all lead data from the backend upon loading. A client-side state should manage the active view (Pipeline vs. Contacts). After any data modification (add, edit, delete), the view must be refreshed to show the latest data.
    - **Kanban Board:**
        - Visually organizes leads into columns based on their stage (e.g., 'New', 'Contacted', 'Qualified').
        - Supports sorting leads within columns by a 'priority' flag, which can be toggled by the user. A visual indicator should show when this sorting is active.
        - Lead cards display key info, including next follow-up date and priority.
    - **Contacts Table:**
        - A paginated, sortable, and filterable table of all leads.
        - **Sorting:** Must be enabled for Name, Assigned Counselor, Source, and Last Modified date.
        - **Filtering:**
            - A text input should filter contacts by name.
            - A calendar input should filter leads to show only those with logged activity on a specific date.
        - **Bulk Actions:**
            - Checkboxes must allow for multi-selecting leads.
            - A contextual toolbar should appear upon selection, showing the number of selected items.
            - **Bulk Stage Change:** A dialog must allow moving all selected leads to a new stage. This triggers a bulk update operation on the backend.
            - **Bulk Delete:** A secure dialog must require the user to type "DELETE" to confirm the permanent deletion of selected leads before sending the bulk delete request.
    - **Add/Edit Leads:**
        - **Add Lead Form:** A dialog-based form with both client-side and server-side validation for creating new leads.
        - **Lead Profile Dialog:** A comprehensive modal to view and edit all details of a single lead. It should use a tabbed interface for:
            - **Details:** An editable form for all lead properties.
            - **Activity:** A log of all past communications for that lead.
            - **Tasks:** A list of tasks for the lead, with a form to add new ones.
            - **Communication:** A form to log new activities (calls, emails, etc.).
        - **Conditional Source Fields:** When "Social Media" or "Other" is chosen as a source, a secondary input must appear to specify the channel or details. This requires client-side logic to watch the form's value.
- **Backend API / Actions:**
    - Must provide endpoints/functions for:
        - `createLead(data)`
        - `updateLead(id, data)`
        - `bulkUpdateLeads(ids, data)`
        - `bulkDeleteLeads(ids)`
    - All data submissions must be validated against a strict schema (e.g., using Zod, Laravel validation rules, etc.).

### **2.3 Course Management**
- **Objective:** To list, create, and view details of courses.
- **Implementation:**
    - **Courses Page:** Displays a grid of course cards.
    - **Add Course Form:** A dialog form that calls a backend endpoint to create a new course.
    - **Course Detail Page:** A dynamic route (e.g., `/courses/{id}`) that displays detailed information about a single course, including a hero image, syllabus, and instructor details, fetched from the backend.

### **2.4 Settings**
- **Objective:** Manage application users and roles.
- **Implementation:**
    - Use a nested layout to provide consistent navigation for the settings section.
    - **Users Page:** Displays a table of all users. Includes a form to add new users and assign them a role via a backend endpoint.
    - **Roles Page:** Displays a table detailing the different user roles and their associated permissions, fetched from a backend source.

### **2.5 Other Features**
- **Departments & Reports:** Pages that display mock data for organizational departments and downloadable reports.
- **Navigation:**
    - A primary navigation menu (sidebar on desktop, sheet on mobile) that is collapsible on desktop.
    - The navigation should highlight the currently active link based on the URL path.
- **Styling:**
    - A global stylesheet should define CSS variables for the color theme (primary, accent, background, etc.) to allow for easy theming.
    - A utility-class CSS framework (like Tailwind) should be used for all component styling.