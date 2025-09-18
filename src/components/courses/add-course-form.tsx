/**
 * @file This component provides a dialog form for adding a new course to the system.
 * It handles form state, validation, and submission using a server action.
 */
"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, Loader2 } from "lucide-react";
import { addCourseAction, type AddCourseState } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";

const initialState: AddCourseState = {};

/**
 * A submit button that shows a loading spinner while the form is being submitted.
 * It uses the `useFormStatus` hook to track the submission state of the parent form.
 * @returns {JSX.Element} A button with a loading indicator.
 */
function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save course
        </Button>
    )
}

/**
 * The AddCourseForm component.
 * It consists of a trigger button ("Add Course") and a dialog that contains the form fields.
 * The form submission is handled by a server action (`addCourseAction`).
 * @returns {JSX.Element} A JSX element rendering the "Add Course" button and dialog.
 */
export function AddCourseForm() {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState(addCourseAction, initialState);
  const { toast } = useToast();

  // Effect to handle feedback from the server action (e.g., show success/error toast).
  useEffect(() => {
    if (state.message) {
      toast({ title: "Success", description: state.message });
      setOpen(false); // Close the dialog on success.
    } else if (state.error) {
      toast({ variant: "destructive", title: "Error", description: state.error });
    }
  }, [state, toast]);


  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Course
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Add New Course</DialogTitle>
          <DialogDescription>
            Enter the details for the new course. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input id="title" name="title" className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea id="description" name="description" className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="duration" className="text-right">
                Duration
              </Label>
              <Input id="duration" name="duration" className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="fees" className="text-right">
                Fees
              </Label>
              <Input id="fees" name="fees" type="number" className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="instructor" className="text-right">
                Instructor
              </Label>
              <Input id="instructor" name="instructor" className="col-span-3" required />
            </div>
          <DialogFooter>
            <SubmitButton />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
