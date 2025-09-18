/**
 * @file This component provides a form to add a new task for a specific lead.
 * It can be rendered as a dialog on mobile devices or as an inline form on desktops.
 * This adaptive behavior improves the user experience on different screen sizes.
 */
"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { PlusCircle, Loader2, Calendar as CalendarIcon } from "lucide-react";
import { addTaskAction, type AddTaskState } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "../ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar } from "../ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { users } from "@/lib/users-data";
import { useIsMobile } from "@/hooks/use-mobile";

const initialState: AddTaskState = {};

/**
 * The core form content for adding a task.
 * This is a reusable component used by both the mobile dialog and the desktop inline view.
 * It includes fields for task type, due date, priority, assignment, and notes.
 * @param {object} props - The component props.
 * @param {string} props.leadId - The ID of the lead this task is for.
 * @param {(open: boolean) => void} props.setOpen - A function to control the parent dialog's open state.
 * @param {() => void} [props.onTaskAdd] - An optional callback to run after a task is successfully added.
 * @returns {JSX.Element} A form for creating a new task.
 */
function AddTaskContent({ leadId, setOpen, onTaskAdd }: { leadId: string; setOpen: (open: boolean) => void, onTaskAdd?: () => void }) {
  const [state, formAction] = useActionState(addTaskAction, initialState);
  const { toast } = useToast();
  const [date, setDate] = useState<Date>();
  const [isPending, startTransition] = useTransition();

  // Effect to show toast notifications based on the server action's response.
  useEffect(() => {
    if (state.message) {
      toast({ title: "Success", description: state.message });
      setDate(undefined);
      if (onTaskAdd) onTaskAdd();
      setOpen(false); // Close dialog on success
    } else if (state.error) {
      toast({ variant: "destructive", title: "Error", description: state.error });
    }
  }, [state, toast, setOpen, onTaskAdd]);
  
  /**
   * Prepares form data and submits it to the server action.
   * It ensures a due date is selected before submission.
   * @param {FormData} formData - The form data to be submitted.
   */
  const handleFormSubmit = (formData: FormData) => {
    if (!date) {
        toast({ variant: "destructive", title: "Error", description: "Due date is required." });
        return;
    }
    formData.set('dueDate', date.toISOString());
    
    startTransition(() => {
        formAction(formData);
    });
  }

    return (
        <form action={handleFormSubmit} className="grid gap-4 py-4">
            <input type="hidden" name="leadId" value={leadId} />
            <div className="space-y-2">
                <Label htmlFor="type">Task Type</Label>
                <Select name="type" required defaultValue="Follow-up">
                    <SelectTrigger><SelectValue placeholder="Select task type" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Follow-up">Follow-up</SelectItem>
                        <SelectItem value="Meeting">Meeting</SelectItem>
                        <SelectItem value="Documentation">Documentation</SelectItem>
                    </SelectContent>
                </Select>
            </div>
             <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Popover>
                    <PopoverTrigger asChild>
                    <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={date} onSelect={setDate} initialFocus /></PopoverContent>
                </Popover>
            </div>
            <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select name="priority" required defaultValue="Medium">
                    <SelectTrigger><SelectValue placeholder="Select priority" /></SelectTrigger>
                    <SelectContent><SelectItem value="High">High</SelectItem><SelectItem value="Medium">Medium</SelectItem><SelectItem value="Low">Low</SelectItem></SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
                <Label htmlFor="assignedUserId">Assign To</Label>
                <Select name="assignedUserId" required defaultValue="user-1">
                    <SelectTrigger><SelectValue placeholder="Select a user" /></SelectTrigger>
                    <SelectContent>{users.map(user => <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>)}</SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" name="notes" placeholder="Add notes for the task..." required />
            </div>
            <DialogFooter>
                 <Button type="submit" disabled={isPending} className="w-full">
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Task
                </Button>
            </DialogFooter>
        </form>
    );
}

/**
 * The AddTaskForm component.
 * It conditionally renders either a dialog (mobile) or an inline form (desktop)
 * to provide the best user experience for the device.
 * @param {object} props - The component props.
 * @param {string} props.leadId - The ID of the lead to add the task for.
 * @param {() => void} [props.onTaskAdd] - An optional callback to run after a task is added.
 * @returns {JSX.Element} A JSX element for adding a task.
 */
export function AddTaskForm({ leadId, onTaskAdd }: { leadId: string, onTaskAdd?: () => void }) {
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();

  // If mobile, use a dialog. Otherwise, render the form inline.
  if (isMobile) {
      return (
        <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
            <Button className="w-full">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Task
            </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle>Add New Task</DialogTitle>
                <DialogDescription>Schedule a new task for this lead.</DialogDescription>
            </DialogHeader>
            <AddTaskContent leadId={leadId} setOpen={setOpen} onTaskAdd={onTaskAdd} />
        </DialogContent>
        </Dialog>
      )
  }

  // A simplified version for desktop to be embedded directly.
  return (
    <div className="border rounded-lg p-4">
        <p className="font-medium mb-4">Create New Task</p>
        <AddTaskContent leadId={leadId} setOpen={() => {}} onTaskAdd={onTaskAdd} />
    </div>
  );
}
