/**
 * @file This component provides a dialog form for adding a new user to the system.
 * It handles form state and submission via a server action, and provides feedback
 * to the user via toast notifications.
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlusCircle, Loader2 } from "lucide-react";
import { roles } from "@/lib/roles-data";
import { addUserAction, type AddUserState } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";

const initialState: AddUserState = {};

/**
 * A submit button that shows a loading spinner while the form is submitting.
 * It uses the `useFormStatus` hook to automatically track the form's pending state.
 * @returns {JSX.Element} A button with a loading indicator.
 */
function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save user
        </Button>
    )
}

/**
 * The AddUserForm component.
 * It renders a button which, when clicked, opens a dialog to add a new user.
 * The form includes fields for name, email, and role, and is submitted
 * using a server action.
 * @returns {JSX.Element} A JSX element for the add user functionality.
 */
export function AddUserForm() {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState(addUserAction, initialState);
  const { toast } = useToast();

  // This effect listens for the result of the server action and shows a toast message.
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
          Add User
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
          <DialogDescription>
            Create a new user account and assign a role. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input id="name" name="name" className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input id="email" name="email" type="email" className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
                Role
              </Label>
              <Select name="role" required>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <SubmitButton />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
