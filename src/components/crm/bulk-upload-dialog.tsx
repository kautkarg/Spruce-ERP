/**
 * @file This component provides a dialog for bulk uploading contacts (leads or prospects)
 * from a CSV or XLSX file. It includes a drag-and-drop area for file selection.
 * The component manages file state, upload type (leads/prospects), and simulated upload progress.
 */
"use client";

import { useState } from "react";
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
import { Upload, Loader2, UploadCloud, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Checkbox } from "../ui/checkbox";
import { users } from "@/lib/users-data";
import { ScrollArea } from "../ui/scroll-area";

const counselors = users.filter(u => u.role.id === 'counselor');

/**
 * BulkUploadDialog component.
 * Renders a button that triggers a dialog for file uploads. The dialog allows users
 * to select a file via a file input or by dragging and dropping it into a designated area.
 * @returns {JSX.Element} A JSX element rendering the bulk upload feature.
 */
export function BulkUploadDialog() {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploadType, setUploadType] = useState("leads");
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedCounselors, setSelectedCounselors] = useState<string[]>([]);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const selectedFile = event.target.files[0];
      if (selectedFile) {
        validateAndSetFile(selectedFile);
      }
    }
  };

  /**
   * Validates the selected file type (CSV or XLSX) and updates the state.
   * If the file type is invalid, it shows a destructive toast notification.
   * @param selectedFile - The file selected by the user.
   */
  const validateAndSetFile = (selectedFile: File) => {
    const allowedTypes = ["text/csv", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"];
    if (allowedTypes.includes(selectedFile.type)) {
      setFile(selectedFile);
    } else {
      toast({
          variant: "destructive",
          title: "Invalid File Type",
          description: "Please upload a .csv or .xlsx file."
      });
      setFile(null);
    }
  }
  
  /**
   * Handles the file upload process. This is a simulation that shows a loading state
   * and then a success message after a delay. In a real application, this would
   * involve an API call to a backend service.
   */
  const handleUpload = async () => {
    if (!file) {
        toast({
            variant: "destructive",
            title: "No File Selected",
            description: "Please select a file to upload."
        });
        return;
    }

    setIsUploading(true);

    // Simulate an upload process with a 2-second delay.
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsUploading(false);
    setOpen(false);
    resetState();

    const wasDistributed = selectedCounselors.length > 0;
    const description = wasDistributed
      ? `${file.name} has been processed and leads have been distributed among ${selectedCounselors.length} counselor(s).`
      : `${file.name} has been uploaded. ${uploadType === 'leads' ? 'Leads' : 'Prospects'} are being processed.`;

    toast({
        title: "Upload Successful",
        description: description
    });

  }

  const resetState = () => {
    setFile(null);
    setSelectedCounselors([]);
  }

  // Drag and drop event handlers for the file input area.
  const handleDragEnter = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      validateAndSetFile(droppedFile);
    }
  };
  
  const handleCounselorSelection = (counselorId: string, isChecked: boolean) => {
    setSelectedCounselors(current => 
      isChecked
        ? [...current, counselorId]
        : current.filter(id => id !== counselorId)
    );
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
        resetState();
    }
    setOpen(isOpen);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="mr-2 h-4 w-4" />
          Bulk Upload
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Bulk Upload Contacts</DialogTitle>
          <DialogDescription>
            Upload a CSV or XLSX file. Choose counselors to distribute new leads to immediately.
          </DialogDescription>
        </DialogHeader>
        <div className="grid md:grid-cols-2 gap-6 py-4">
            {/* Column 1: Upload options */}
            <div className="space-y-4">
                {/* Radio group to select upload type (Leads or Prospects) */}
                <div className="space-y-2">
                    <Label>1. Upload Type</Label>
                    <RadioGroup defaultValue="leads" onValueChange={setUploadType} className="flex gap-4 flex-wrap">
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="leads" id="leads" />
                            <Label htmlFor="leads" className="font-normal">Leads</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="prospects" id="prospects" />
                            <Label htmlFor="prospects" className="font-normal">Prospects</Label>
                        </div>
                         <div className="flex items-center space-x-2">
                            <RadioGroupItem value="existing-students" id="existing-students" />
                            <Label htmlFor="existing-students" className="font-normal">Existing Students</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="alumni" id="alumni" />
                            <Label htmlFor="alumni" className="font-normal">Alumni</Label>
                        </div>
                    </RadioGroup>
                </div>

                {/* Drag and drop file input area */}
                <div className="grid w-full items-center gap-1.5">
                     <Label>2. Upload File</Label>
                    <Label 
                      htmlFor="csv-file"
                      className={cn(
                        "flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer transition-colors",
                        isDragging ? "border-primary bg-primary/10" : "border-border hover:bg-muted"
                      )}
                      onDragEnter={handleDragEnter}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
                        <UploadCloud className={cn("w-8 h-8 mb-2", isDragging ? "text-primary" : "text-muted-foreground")} />
                         {file ? (
                            <p className="text-sm font-semibold text-primary">{file.name}</p>
                        ) : (
                            <>
                            <p className="mb-1 text-sm text-muted-foreground">
                              <span className="font-semibold">Click to upload</span> or drag & drop
                            </p>
                            <p className="text-xs text-muted-foreground">CSV or XLSX file</p>
                            </>
                        )}
                      </div>
                      <Input 
                        id="csv-file" 
                        type="file" 
                        className="hidden" 
                        accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" 
                        onChange={handleFileChange}
                      />
                    </Label>
                </div>
                 <p className="text-xs text-muted-foreground">
                    Download a <a href="/sample-contacts.csv" download className="underline text-primary">sample CSV template</a> to see the required format.
                </p>
            </div>
            
             {/* Column 2: Distribution options */}
            <div className="space-y-2">
                <Label>3. Distribute To Counselors (Optional)</Label>
                <ScrollArea className="h-48 rounded-md border">
                    <div className="p-2 space-y-1">
                        {counselors.map((counselor) => (
                            <div key={counselor.id} className="flex items-center gap-3 p-1.5 rounded-md hover:bg-muted">
                                 <Checkbox
                                    id={`counselor-${counselor.id}`}
                                    checked={selectedCounselors.includes(counselor.id)}
                                    onCheckedChange={(checked) => handleCounselorSelection(counselor.id, !!checked)}
                                    />
                                <Label htmlFor={`counselor-${counselor.id}`} className="flex items-center gap-2 font-normal cursor-pointer w-full">
                                    <User className="w-4 h-4 text-muted-foreground" />
                                    {counselor.name}
                                </Label>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
                {selectedCounselors.length > 0 && (
                    <p className="text-xs text-muted-foreground pt-1">
                        New leads will be distributed equally among {selectedCounselors.length} selected counselor(s) after upload.
                    </p>
                )}
            </div>
        </div>
       
        <DialogFooter>
            <Button variant="outline" onClick={() => handleOpenChange(false)}>Cancel</Button>
            <Button onClick={handleUpload} disabled={isUploading || !file}>
                {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                Upload & Process File
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
