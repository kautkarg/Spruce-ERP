/**
 * @file This component provides a dialog for assigning selected leads to a counselor.
 * It's used for the bulk action in the contacts table.
 */
"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { users } from "@/lib/users-data";

interface AssignCounselorDialogProps {
  children: React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAssign: (counselorId: string) => void;
  isPending: boolean;
}

const counselors = users.filter(u => u.role.id === 'counselor' || u.role.id === 'admin');

/**
 * AssignCounselorDialog component.
 * @param {AssignCounselorDialogProps} props - The component props.
 * @returns {JSX.Element} A JSX element rendering the assign counselor dialog. The dialog's trigger
 * is passed as `children`.
 */
export function AssignCounselorDialog({ children, open, onOpenChange, onAssign, isPending }: AssignCounselorDialogProps) {
  const [selectedCounselor, setSelectedCounselor] = useState<string | null>(null);

  const handleSubmit = () => {
    if (selectedCounselor) {
      onAssign(selectedCounselor);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign to Counselor</DialogTitle>
          <DialogDescription>
            Select a counselor to assign the selected lead(s) to.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
            <Select onValueChange={setSelectedCounselor}>
                <SelectTrigger>
                    <SelectValue placeholder="Select a counselor" />
                </SelectTrigger>
                <SelectContent>
                    {counselors.map((counselor) => (
                        <SelectItem key={counselor.id} value={counselor.id}>
                            {counselor.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!selectedCounselor || isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Assign
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
