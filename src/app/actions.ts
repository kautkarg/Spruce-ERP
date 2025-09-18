/**
 * @file This file contains all the server-side functions (Server Actions)
 * that handle form submissions and data mutations for the application.
 * These actions are secure and run only on the server, ensuring data integrity.
 */
"use server"

import { z } from "zod"
import { addUser as addUserToStore, users } from "@/lib/users-data"
import { addCourse as addCourseToStore } from "@/lib/courses-data"
import { addLead as addLeadToStore, updateLead as updateLeadInStore, addActivity as addActivityToStore, bulkUpdateLeads as bulkUpdateLeadsInStore, bulkDeleteLeads as bulkDeleteLeadsInStore } from "@/lib/data";
import { roles } from "@/lib/roles-data"
import { revalidatePath } from "next/cache"
import { KANBAN_STAGES, KanbanStage } from "@/lib/types";
import { addTask as addTaskToStore } from "@/lib/tasks-data";

// Defines the expected data structure for the "Add User" form.
const addUserFormSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters."),
    email: z.string().email("Invalid email address."),
    roleId: z.string(),
});

// Defines the possible states for the addUserAction (e.g., success message or error).
export type AddUserState = {
    message?: string;
    error?: string;
}

/**
 * Server action to add a new user to the system.
 * It validates the form data and calls the data store function.
 * @param prevState - The previous state of the form action.
 * @param formData - The data submitted from the "Add User" form.
 * @returns An object with a success message or an error message.
 */
export async function addUserAction(prevState: AddUserState, formData: FormData): Promise<AddUserState> {
    const validatedFields = addUserFormSchema.safeParse({
        name: formData.get("name"),
        email: formData.get("email"),
        roleId: formData.get("role"),
    });

    if (!validatedFields.success) {
        return {
            error: "Invalid form data. Please check your inputs.",
        };
    }

    const { name, email, roleId } = validatedFields.data;
    const role = roles.find(r => r.id === roleId);

    if (!role) {
        return { error: "Invalid role selected." };
    }

    try {
        addUserToStore({ name, email, role });
        revalidatePath("/dashboard/settings/users"); // Refreshes the user list page
        return { message: `User ${name} created successfully.` };
    } catch (e) {
        return { error: "Failed to create user." };
    }
}

// Defines the expected data structure for the "Add Course" form.
const addCourseFormSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters."),
    description: z.string().min(10, "Description must be at least 10 characters."),
    duration: z.string().min(2, "Duration must be at least 2 characters."),
    fees: z.coerce.number().min(0, "Fees must be a positive number."),
    instructor: z.string().min(2, "Instructor name must be at least 2 characters."),
});

// Defines the possible states for the addCourseAction.
export type AddCourseState = {
    message?: string;
    error?: string;
}

/**
 * Server action to add a new course.
 * It validates the course data and adds it to the course list.
 * @param prevState - The previous state of the form action.
 * @param formData - The data from the "Add Course" form.
 * @returns An object with a success or error message.
 */
export async function addCourseAction(prevState: AddCourseState, formData: FormData): Promise<AddCourseState> {
    const validatedFields = addCourseFormSchema.safeParse({
        title: formData.get("title"),
        description: formData.get("description"),
        duration: formData.get("duration"),
        fees: formData.get("fees"),
        instructor: formData.get("instructor"),
    });

    if (!validatedFields.success) {
        const errorMessages = Object.values(validatedFields.error.flatten().fieldErrors).join(', ');
        return {
            error: `Invalid form data: ${errorMessages}`,
        };
    }

    try {
        addCourseToStore(validatedFields.data);
        revalidatePath("/dashboard/courses"); // Refreshes the courses page
        return { message: `Course "${validatedFields.data.title}" created successfully.` };
    } catch (e) {
        return { error: "Failed to create course." };
    }
}

// Regular expression to validate a phone number.
const phoneRegex = /^\+?[1-9]\d{9,14}$/;

// Defines the expected structure for the "Add Lead" form.
const addLeadFormSchema = z.object({
    name: z.string().min(2, { message: "Name must be at least 2 characters."}),
    email: z.string().email({ message: "Please enter a valid email address."}),
    phoneNumbers: z.array(z.object({
        title: z.string().min(1, "Title is required"),
        number: z.string().refine(val => phoneRegex.test(val), {
            message: "Please enter a valid phone number.",
        })
    })).optional(),
    source: z.string().min(1, { message: "Source is required."}),
    socialMediaSource: z.string().optional(),
    otherSource: z.string().optional(),
    referralSource: z.string().optional(),
    education: z.string().optional(),
    college: z.string().optional(),
    status: z.enum(['Passed', 'Pursuing']).optional(),
    courseInterest: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    gender: z.enum(['Male', 'Female', 'Other']).optional(),
    dob: z.string().optional(),
}).refine(data => !(data.source === 'Other' && !data.otherSource), {
    message: "Please specify the source if 'Other' is selected.",
    path: ["otherSource"],
}).refine(data => !(data.source === 'Social Media' && !data.socialMediaSource), {
    message: "Please specify the social media channel.",
    path: ["socialMediaSource"],
}).refine(data => !(data.source === 'Referral' && !data.referralSource), {
    message: "Please specify the referrer name.",
    path: ["referralSource"],
});

// Defines the state for the addLeadAction, including potential validation errors.
export type AddLeadState = {
    message?: string;
    errors?: {
        name?: string[];
        email?: string[];
        phoneNumbers?: { title: string, number: string }[][];
        source?: string[];
        socialMediaSource?: string[];
        otherSource?: string[];
        referralSource?: string[];
        college?: string[];
        education?: string[];
        address?: string[];
        city?: string[];
        gender?: string[];
        dob?: string[];
    }
};

/**
 * Server action to add a new lead.
 * It validates lead details and adds the lead to the system.
 * @param prevState - The previous state of the form action.
 * @param formData - The data from the "Add Lead" form.
 * @returns An object with a success message or validation errors.
 */
export async function addLeadAction(prevState: AddLeadState, formData: FormData): Promise<AddLeadState> {
    const phoneTitles = formData.getAll("phoneTitles");
    const phoneNumbersData = formData.getAll("phoneNumbers");

    const phoneNumbers = phoneTitles.map((title, index) => ({
        title: title as string,
        number: phoneNumbersData[index] as string
    })).filter(p => p.number); // filter out empty numbers

    const rawData = {
        name: formData.get("name"),
        email: formData.get("email"),
        phoneNumbers: phoneNumbers.length > 0 ? phoneNumbers : undefined,
        source: formData.get("source"),
        socialMediaSource: formData.get("socialMediaSource"),
        otherSource: formData.get("otherSource"),
        referralSource: formData.get("referralSource"),
        education: formData.get("education"),
        college: formData.get("college"),
        status: formData.get("status"),
        courseInterest: formData.get("courseInterest"),
        address: formData.get("address"),
        city: formData.get("city"),
        gender: formData.get("gender"),
        dob: formData.get("dob"),
    };

    const validatedFields = addLeadFormSchema.safeParse(rawData);

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors as any,
        };
    }
    
    const { source, otherSource, socialMediaSource, referralSource, ...restOfData } = validatedFields.data;
    let finalSource = source;
    if (source === 'Other') {
        finalSource = otherSource!;
    } else if (source === 'Social Media') {
        finalSource = `${source} - ${socialMediaSource!}`;
    } else if (source === 'Referral') {
        finalSource = `${source} - ${referralSource!}`;
    }

    try {
        addLeadToStore({ ...restOfData, source: finalSource });
        revalidatePath("/dashboard/crm"); // Refreshes the CRM page
        return { message: `Lead "${validatedFields.data.name}" created successfully.` };
    } catch (e) {
        return { errors: { name: ["Failed to create lead."] } };
    }
}

// Defines the expected structure for updating an existing lead.
const updateLeadFormSchema = z.object({
    id: z.string(),
    name: z.string().min(2, { message: "Name must be at least 2 characters."}),
    email: z.string().email({ message: "Please enter a valid email address."}),
    assignedUserId: z.string(),
    phoneNumbers: z.array(z.object({
        title: z.string().min(1, "Title is required"),
        number: z.string().refine(val => phoneRegex.test(val), {
            message: "Please enter a valid phone number.",
        })
    })).optional(),
    source: z.string().min(1, { message: "Source is required."}),
    courseInterest: z.string().optional(),
    education: z.string().optional(),
    college: z.string().optional(),
    status: z.enum(['Passed', 'Pursuing']).optional(),
});

// The state for updating a lead is the same as adding one.
export type UpdateLeadState = AddLeadState;

/**
 * Server action to update an existing lead's details.
 * @param prevState - The previous state of the form action.
 * @param formData - The data from the "Update Lead" form.
 * @returns An object with a success message or validation errors.
 */
export async function updateLeadAction(prevState: UpdateLeadState, formData: FormData): Promise<UpdateLeadState> {
    const phoneTitles = formData.getAll("phoneTitles");
    const phoneNumbersData = formData.getAll("phoneNumbers");

    const phoneNumbers = phoneTitles.map((title, index) => ({
        title: title as string,
        number: phoneNumbersData[index] as string
    })).filter(p => p.number);

    const rawData = {
        id: formData.get("id"),
        name: formData.get("name"),
        email: formData.get("email"),
        assignedUserId: formData.get("assignedUserId"),
        phoneNumbers: phoneNumbers.length > 0 ? phoneNumbers : undefined,
        source: formData.get("source"),
        courseInterest: formData.get("courseInterest") || undefined,
        education: formData.get("education") || undefined,
        college: formData.get("college") || undefined,
        status: formData.get("status") || undefined,
    };

    const validatedFields = updateLeadFormSchema.safeParse(rawData);
    
    if (!validatedFields.success) {
        console.log(validatedFields.error.flatten().fieldErrors);
        return {
            errors: validatedFields.error.flatten().fieldErrors as any,
        };
    }
    
    try {
        updateLeadInStore(validatedFields.data);
        revalidatePath("/dashboard/crm"); // Refreshes the CRM page
        return { message: `Lead "${validatedFields.data.name}" updated successfully.` };
    } catch (e) {
        return { errors: { name: ["Failed to update lead."] } };
    }
}

// Defines the expected structure for the "Add Task" form.
const addTaskFormSchema = z.object({
  leadId: z.string(),
  type: z.enum(['Follow-up', 'Meeting', 'Documentation']),
  dueDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date" }),
  priority: z.enum(['High', 'Medium', 'Low']),
  notes: z.string().min(3, { message: "Notes must be at least 3 characters." }),
  assignedUserId: z.string(),
});

// Defines the state for the addTaskAction.
export type AddTaskState = {
    message?: string;
    error?: string;
};

/**
 * Server action to add a new task for a lead.
 * @param prevState - The previous state of the form action.
 * @param formData - The data from the "Add Task" form.
 * @returns An object with a success or error message.
 */
export async function addTaskAction(prevState: AddTaskState, formData: FormData): Promise<AddTaskState> {
    const validatedFields = addTaskFormSchema.safeParse({
        leadId: formData.get("leadId"),
        type: formData.get("type"),
        dueDate: formData.get("dueDate"),
        priority: formData.get("priority"),
        notes: formData.get("notes"),
        assignedUserId: formData.get("assignedUserId"),
    });

    if (!validatedFields.success) {
        const errorMessages = Object.values(validatedFields.error.flatten().fieldErrors).join(' ');
        return {
            error: `Invalid form data: ${errorMessages}`,
        };
    }

    try {
        addTaskToStore(validatedFields.data.leadId, validatedFields.data);
        revalidatePath("/dashboard/crm"); // Refreshes the CRM page
        return { message: "Task created successfully." };
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : "Failed to create task.";
        return { error: errorMessage };
    }
}

// Defines the expected structure for the "Add Activity" form.
const addActivityFormSchema = z.object({
  leadId: z.string(),
  type: z.enum(['Call', 'Email', 'SMS', 'WhatsApp', 'Walk in']),
  outcome: z.string().min(3, { message: "Outcome must be at least 3 characters." }),
  notes: z.string().min(3, { message: "Notes must be at least 3 characters." }),
  userId: z.string(),
  courseInterest: z.string().optional(),
  stage: z.enum(KANBAN_STAGES).optional(),
});

// Defines the state for the addActivityAction.
export type AddActivityState = {
    message?: string;
    error?: string;
};

/**
 * Server action to log a new activity (like a call or email) for a lead.
 * This action can also simultaneously update the lead's course interest.
 * @param prevState - The previous state of the form action.
 * @param formData - The data from the "Add Activity" form.
 * @returns An object with a success or error message.
 */
export async function addActivityAction(prevState: AddActivityState, formData: FormData): Promise<AddActivityState> {
    const validatedFields = addActivityFormSchema.safeParse({
        leadId: formData.get("leadId"),
        type: formData.get("type"),
        outcome: formData.get("outcome"),
        notes: formData.get("notes"),
        userId: formData.get("userId"),
        courseInterest: formData.get("courseInterest"),
        stage: formData.get("stage"),
    });

    if (!validatedFields.success) {
        const errorMessages = Object.values(validatedFields.error.flatten().fieldErrors).join(' ');
        return {
            error: `Invalid form data: ${errorMessages}`,
        };
    }

    try {
        const { leadId, courseInterest, stage, ...activityData } = validatedFields.data;
        addActivityToStore(leadId, activityData);
        
        const leadUpdates: { courseInterest?: string; stage?: z.infer<typeof KANBAN_STAGES>; status?: 'Passed' | 'Pursuing' } = {};
        // If a course interest was specified, update the lead with it.
        if (courseInterest) {
            leadUpdates.courseInterest = courseInterest;
        }
        if (stage) {
            leadUpdates.stage = stage;
        }
        
        if (Object.keys(leadUpdates).length > 0) {
            updateLeadInStore({ id: leadId, ...leadUpdates });
        }

        revalidatePath("/dashboard/crm"); // Refreshes the CRM page
        return { message: "Activity logged successfully." };
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : "Failed to log activity.";
        return { error: errorMessage };
    }
}

// Defines the expected structure for bulk updating leads.
const bulkUpdateLeadsSchema = z.object({
    leadIds: z.array(z.string()),
    stage: z.enum(KANBAN_STAGES).optional(),
    assignedUserId: z.string().optional(),
    distributionList: z.array(z.object({ leadId: z.string(), assignedUserId: z.string() })).optional(),
});

// Defines the state for bulk update/delete actions.
export type BulkUpdateState = {
    message?: string;
    error?: string;
};

/**
 * Server action to update multiple leads at once (e.g., change their stage).
 * @param prevState - The previous state of the form action.
 * @param formData - The data containing the lead IDs and the updates to apply.
 * @returns An object with a success or error message.
 */
export async function bulkUpdateLeadsAction(prevState: BulkUpdateState, formData: FormData): Promise<BulkUpdateState> {
    const leadIds = formData.getAll('leadIds') as string[];
    const stage = formData.get('stage') as z.infer<typeof KANBAN_STAGES> | null;
    const assignedUserId = formData.get('assignedUserId') as string | null;
    const distributionData = formData.get('distributionList');
    
    let distributionList: { leadId: string, assignedUserId: string }[] | undefined;
    if (distributionData) {
        try {
            distributionList = JSON.parse(distributionData as string);
        } catch {
            return { error: "Invalid distribution data." };
        }
    }

    const validatedFields = bulkUpdateLeadsSchema.safeParse({
        leadIds: leadIds,
        stage: stage || undefined,
        assignedUserId: assignedUserId || undefined,
        distributionList: distributionList,
    });

    if (!validatedFields.success) {
        return { error: "Invalid data for bulk update." };
    }

    try {
        const { leadIds: vLeadIds, stage: vStage, assignedUserId: vAssignedUserId, distributionList: vDistributionList } = validatedFields.data;

        if (vDistributionList && vDistributionList.length > 0) {
            bulkUpdateLeadsInStore(vDistributionList.map(d => d.leadId), {
                assignedUserIds: vDistributionList
            });
            revalidatePath("/dashboard/crm");
            return { message: `${vDistributionList.length} leads have been distributed successfully.` };
        }

        const updates: { stage?: KanbanStage, assignedUserId?: string } = {};
        if (vStage) {
             updates.stage = vStage;
        }
        if (vAssignedUserId) {
            updates.assignedUserId = vAssignedUserId;
        }

        if (Object.keys(updates).length > 0) {
            bulkUpdateLeadsInStore(vLeadIds, updates);
        }

        revalidatePath("/dashboard/crm");
        
        let message = '';
        if (updates.stage) {
            message = `${vLeadIds.length} lead(s) moved to ${updates.stage}.`;
        } else if (updates.assignedUserId) {
            const user = users.find(u => u.id === updates.assignedUserId);
            message = `${vLeadIds.length} lead(s) assigned to ${user?.name || 'N/A'}.`;
        }

        return { message: message || "No updates performed." };
    } catch (e) {
        return { error: "Failed to update leads." };
    }
}

// Defines the expected structure for bulk deleting leads.
const bulkDeleteLeadsSchema = z.object({
    leadIds: z.array(z.string()),
});

/**
 * Server action to delete multiple leads at once.
 * @param prevState - The previous state of the form action.
 * @param formData - The data containing the IDs of the leads to delete.
 * @returns An object with a success or error message.
 */
export async function bulkDeleteLeadsAction(prevState: BulkUpdateState, formData: FormData): Promise<BulkUpdateState> {
    const leadIds = formData.getAll('leadIds') as string[];
    
    const validatedFields = bulkDeleteLeadsSchema.safeParse({ leadIds });

    if (!validatedFields.success) {
        return { error: "Invalid data for bulk delete." };
    }

    try {
        bulkDeleteLeadsInStore(validatedFields.data.leadIds, {});
        revalidatePath("/dashboard/crm"); // Refreshes the CRM page
        return { message: `${validatedFields.data.leadIds.length} leads deleted successfully.` };
    } catch (e) {
        return { error: "Failed to delete leads." };
    }
}
