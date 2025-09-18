/**
 * @file This file manages the mock data for tasks. It provides functions to get all tasks
 * and to add a new task for a specific lead.
 */

import { getLeads } from './data';
import type { Task } from './types';

// In-memory cache for all tasks.
let allTasks: Task[] | null = null;

/**
 * Retrieves all tasks by flattening the tasks array from all leads.
 * Caches the result to avoid re-computation.
 * @returns An array of all task objects.
 */
function getAllTasks(): Task[] {
    if (!allTasks) {
        allTasks = getLeads().flatMap(lead => lead.tasks);
    }
    return allTasks;
}

// Exported list of all tasks.
export const tasks: Task[] = getAllTasks();

/**
 * Adds a new task for a specific lead and updates the in-memory stores.
 * @param leadId - The ID of the lead to which the task should be added.
 * @param taskData - The data for the new task.
 * @returns The newly created task object.
 * @throws Will throw an error if the lead is not found.
 */
export function addTask(leadId: string, taskData: Omit<Task, 'id' | 'status' | 'leadId'>): Task {
    const leads = getLeads();
    const lead = leads.find(l => l.id === leadId);

    if (!lead) {
        throw new Error("Lead not found");
    }

    const newTask: Task = {
        id: `TSK-${Date.now()}`,
        status: 'Pending',
        leadId: leadId,
        ...taskData,
    };

    // Add the task to both the lead's task list and the global task list.
    lead.tasks.push(newTask);
    tasks.push(newTask);

    return newTask;
}
