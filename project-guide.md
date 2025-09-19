# Project Guide for Laravel Recreation: Spruce ERP

Welcome! This guide is designed to help you understand the Spruce ERP Next.js application and recreate its backend functionality in Laravel.

## 1. Project Overview

Spruce ERP is an Enterprise Resource Planning system for educational institutions. The key features are:

- **CRM:** Managing leads through a pipeline and a contacts table.
- **Course Management:** Creating and viewing course details.
- **User & Role Management:** Controlling access and permissions for different user types.

## 2. Technology Stack (Frontend)

The current application is built with:

- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **UI:** React, ShadCN UI Components
- **Styling:** Tailwind CSS

The frontend handles all rendering and contains the application's "backend logic" in a single file.

## 3. Core Architecture & Data Flow

This Next.js app uses a specific architecture that you will need to translate into a traditional client-server model with Laravel.

### Key Files for Backend Recreation:

1.  **Server Actions (`src/app/actions.ts`):**
    - **This is the most important file for you.**
    - All backend logic (creating, updating, deleting data) is handled here through functions called "Server Actions."
    - **Your Task:** Treat each function in this file as an API endpoint specification. For example:
        - `addLeadAction(formData)` should become a `POST /api/leads` endpoint in Laravel.
        - `updateLeadAction(formData)` should become a `PUT /api/leads/{id}` endpoint.
        - `bulkDeleteLeadsAction(formData)` should become a `POST /api/leads/bulk-delete` endpoint.
    - The Zod schemas (e.g., `addLeadFormSchema`) inside this file define the validation rules you'll need to implement in your Laravel requests.

2.  **Data Models/Types (`src/lib/types.ts`):**
    - This file defines the "database schema" for the application.
    - **Your Task:** Use the types defined here (`Lead`, `Course`, `User`, `Activity`, `Task`, etc.) as a blueprint for creating your Laravel database migrations and Eloquent models.

3.  **Mock Data & Business Logic (`src/lib/`):**
    - Files like `data.ts`, `courses-data.ts`, and `users-data.ts` act as an in-memory database. They contain the business logic for how data is generated and interconnected.
    - **Your Task:** Review these files to understand the relationships between models. For example, `addActivity` in `data.ts` shows that an `Activity` is always linked to a `Lead`.

## 4. Data Relationships Flow

Here is a simplified flow of the main data relationships:

- A **User** has a **Role** (`src/lib/roles-data.ts`).
- A **Lead** is assigned to one **User** (the `assignedUserId` field).
- A **Lead** has many **Activities** and many **Tasks**.
- An **Activity** or a **Task** is created by a **User**.

You can see these relationships clearly defined in `src/lib/types.ts`.

## 5. Summary for Laravel Implementation

1.  **Define Routes:** Create API routes in `routes/api.php` that correspond to each function in `src/app/actions.ts`.
2.  **Create Models & Migrations:** Use `src/lib/types.ts` to generate your database migrations and create corresponding Eloquent models (e.g., `Lead`, `Course`, `User`, `Activity`).
3.  **Implement Controllers:** Create controller methods to handle the logic for each API endpoint. The logic inside the server actions in `actions.ts` is what you need to replicate.
4.  **Add Validation:** Implement validation rules in your Laravel Form Requests based on the Zod schemas found in `actions.ts`.

By following this guide, you can systematically map the frontend's server logic to a robust and secure Laravel backend. Good luck!
