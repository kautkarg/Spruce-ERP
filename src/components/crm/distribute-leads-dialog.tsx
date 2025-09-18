/**
 * @file This component provides a dialog to distribute new leads equally among selected counselors.
 */
"use client";

import { useState, useEffect, useActionState, useTransition } from "react";
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
import { Loader2, GitBranchPlus, User } from "lucide-react";
import { users } from "@/lib/users-data";
import { useToast } from "@/hooks/use-toast";
import { Lead } from "@/lib/types";
import { Badge } from "../ui/badge";
import { bulkUpdateLeadsAction, type BulkUpdateState } from "@/app/actions";
import { ScrollArea } from "../ui/scroll-area";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";

const counselors = users.filter(u => u.role.id === 'counselor');
const initialState: BulkUpdateState = {};

interface DistributeLeadsDialogProps {
  leads: Lead[];
}

/**
 * A dialog component to facilitate equal distribution of new leads among selected counselors.
 * @param {DistributeLeadsDialogProps} props - The component props.
 * @returns {JSX.Element} A dialog for lead distribution.
 */
export function DistributeLeadsDialog({ leads }: DistributeLeadsDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedCounselors, setSelectedCounselors] = useState<string[]>([]);
  const { toast } = useToast();
  const [state, formAction] = useActionState(bulkUpdateLeadsAction, initialState);
  const [isPending, startTransition] = useTransition();

  const newLeads = leads.filter(lead => lead.stage === 'New');
  const leadsPerCounselor = selectedCounselors.length > 0 ? Math.floor(newLeads.length / selectedCounselors.length) : 0;
  const remainder = selectedCounselors.length > 0 ? newLeads.length % selectedCounselors.length : 0;

  useEffect(() => {
    if (state.message) {
      toast({ title: "Success", description: state.message });
      setOpen(false);
      setSelectedCounselors([]);
    } else if (state.error) {
      toast({ variant: "destructive", title: "Error", description: state.error });
    }
  }, [state, toast]);

  const handleDistribute = () => {
    if (selectedCounselors.length === 0 || newLeads.length === 0) {
      toast({
        variant: "destructive",
        title: "Cannot Distribute",
        description: selectedCounselors.length === 0 ? "Please select at least one counselor." : "No new leads to distribute."
      });
      return;
    }

    // Create the distribution list using round-robin
    const distributionList = newLeads.map((lead, index) => ({
      leadId: lead.id,
      assignedUserId: selectedCounselors[index % selectedCounselors.length],
    }));

    const formData = new FormData();
    formData.append('distributionList', JSON.stringify(distributionList));
    startTransition(() => formAction(formData));
  };
  
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setSelectedCounselors([]);
    }
    setOpen(isOpen);
  };
  
  const handleCounselorSelection = (counselorId: string, isChecked: boolean) => {
    setSelectedCounselors(current => 
      isChecked
        ? [...current, counselorId]
        : current.filter(id => id !== counselorId)
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <GitBranchPlus className="mr-2 h-4 w-4" />
          Distribute Leads
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Distribute New Leads</DialogTitle>
          <DialogDescription>
            Equally assign the {newLeads.length} newest leads among the selected counselors.
          </DialogDescription>
        </DialogHeader>
        <div className="grid md:grid-cols-2 gap-6 py-4">
            <div className="space-y-4">
               <div>
                  <Label>1. Leads to be Distributed ({newLeads.length})</Label>
                   <ScrollArea className="h-48 mt-2 rounded-md border p-2">
                        {newLeads.length > 0 ? (
                             <div className="space-y-2">
                                {newLeads.map(lead => (
                                    <div key={lead.id} className="text-sm p-1 rounded-md flex items-center gap-2">
                                      <User className="h-4 w-4 text-muted-foreground" />
                                      {lead.name}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                                No new leads to distribute.
                            </div>
                        )}
                   </ScrollArea>
               </div>
               {selectedCounselors.length > 0 && newLeads.length > 0 && (
                     <div className="text-sm text-muted-foreground p-3 bg-muted/50 rounded-md">
                        <p>Total new leads: <strong>{newLeads.length}</strong></p>
                        <p>Selected counselors: <strong>{selectedCounselors.length}</strong></p>
                        <p>Each counselor will receive approximately <strong>{leadsPerCounselor}</strong> lead(s), with the first <strong>{remainder}</strong> counselor(s) in the list receiving one extra.</p>
                    </div>
                )}
            </div>
            <div className="space-y-4">
              <div>
                <Label>2. Select Counselors</Label>
                <ScrollArea className="h-48 mt-2 rounded-md border p-2">
                  <div className="space-y-2">
                    {counselors.map((counselor) => (
                      <div key={counselor.id} className="flex items-center gap-2 rounded-md p-2 hover:bg-muted">
                        <Checkbox
                          id={`counselor-${counselor.id}`}
                          checked={selectedCounselors.includes(counselor.id)}
                          onCheckedChange={(checked) => handleCounselorSelection(counselor.id, !!checked)}
                        />
                        <Label htmlFor={`counselor-${counselor.id}`} className="w-full font-normal">
                          {counselor.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
               <div className="flex flex-wrap gap-2 min-h-[24px]">
                    {selectedCounselors.map(id => {
                        const counselor = counselors.find(c => c.id === id);
                        return counselor ? <Badge key={id} variant="secondary">{counselor.name}</Badge> : null;
                    })}
                </div>
            </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleDistribute} disabled={isPending || selectedCounselors.length === 0 || newLeads.length === 0}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Distribute {newLeads.length} Leads
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
