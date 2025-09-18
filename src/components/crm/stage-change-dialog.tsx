/**
 * @file This component provides a dialog for changing the stage of one or more leads.
 * It's used for the bulk action in the contacts table, allowing a user to select
 * a new Kanban stage from a list and apply it to all selected leads.
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
import { KANBAN_STAGES, KanbanStage } from "@/lib/types";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Label } from "../ui/label";
import { Loader2 } from "lucide-react";
import { StageBadge } from "../leads/stage-badge";

interface StageChangeDialogProps {
  children: React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStageSelect: (stage: KanbanStage) => void;
  isPending: boolean;
}

/**
 * StageChangeDialog component.
 * @param {StageChangeDialogProps} props - The component props.
 * @returns {JSX.Element} A JSX element rendering the stage change dialog. The dialog's trigger
 * is passed as `children`.
 */
export function StageChangeDialog({ children, open, onOpenChange, onStageSelect, isPending }: StageChangeDialogProps) {
  const [selectedStage, setSelectedStage] = useState<KanbanStage | null>(null);

  const handleSubmit = () => {
    if (selectedStage) {
      onStageSelect(selectedStage);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Lead Stage</DialogTitle>
          <DialogDescription>
            Select the new stage for the selected lead(s).
          </DialogDescription>
        </DialogHeader>
        {/* Radio group for selecting the new stage */}
        <RadioGroup
          onValueChange={(value) => setSelectedStage(value as KanbanStage)}
          className="grid grid-cols-2 gap-4 py-4"
        >
          {KANBAN_STAGES.map((stage) => (
            <Label key={stage} htmlFor={stage} className="flex items-center gap-3 rounded-md border p-3 hover:bg-accent has-[:checked]:bg-accent has-[:checked]:text-accent-foreground">
              <RadioGroupItem value={stage} id={stage} />
              <StageBadge stage={stage} />
            </Label>
          ))}
        </RadioGroup>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!selectedStage || isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
