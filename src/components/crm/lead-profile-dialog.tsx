/**
 * @file This file defines the comprehensive dialog for viewing and editing a lead's profile.
 * It features a multi-tab layout for activities, communication logging, and task creation,
 * as well as inline editing for most lead properties.
 */
"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { useForm, Controller, useFieldArray, FormProvider, useFormContext } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogClose,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Lead, KANBAN_STAGES, KanbanStage } from "@/lib/types";
import { users } from "@/lib/users-data";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { GraduationCap, Phone, School, Mail, Info, User, Edit, Check, X, BookOpen, UserCheck, Activity, BrainCircuit, Trash2, PlusCircle } from "lucide-react";
import { Button } from "../ui/button";
import { useToast } from "@/hooks/use-toast";
import { addActivityAction, type AddActivityState, updateLeadAction, type UpdateLeadState } from "@/app/actions";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Loader2 } from "lucide-react";
import { FormMessage } from "../ui/form-message";
import { ScrollArea } from "../ui/scroll-area";
import { cn } from "@/lib/utils";
import { ActivityLog } from "./activity-log";
import { useIsMobile } from "@/hooks/use-mobile";
import { StageBadge } from "../leads/stage-badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { AddTaskForm } from "../leads/add-task-form";
import { TaskList } from "./task-list";
import { courses } from "@/lib/courses-data";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";

const getImage = (id: string) =>
  PlaceHolderImages.find((img) => img.id === id)?.imageUrl || "";

// Schema for validating the update lead form.
const phoneRegex = /^\+?[1-9]\d{9,14}$/;
const updateLeadFormSchema = z.object({
    id: z.string(),
    name: z.string().min(2, { message: "Name must be at least 2 characters." }),
    email: z.string().email({ message: "Please enter a valid email address." }),
    assignedUserId: z.string(),
    phoneNumbers: z.array(z.object({
        title: z.string().min(1, "Title is required"),
        number: z.string().refine(val => phoneRegex.test(val), {
            message: "Please enter a valid phone number.",
        })
    })).optional(),
    source: z.string(),
    courseInterest: z.string().optional(),
    education: z.string().optional(),
    college: z.string().optional(),
    status: z.enum(['Passed', 'Pursuing']).optional(),
});
type FormData = z.infer<typeof updateLeadFormSchema>;

interface LeadProfileDialogProps {
  lead: Lead | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onLeadUpdate: (lead: Lead) => void;
}

// Schema for validating the activity logging form.
const activityFormSchema = z.object({
    leadId: z.string(),
    type: z.enum(['Call', 'Email', 'SMS', 'WhatsApp', 'Walk in']),
    outcome: z.string().min(3, "Outcome is required."),
    notes: z.string().min(3, "Notes are required."),
    userId: z.string(),
    courseInterest: z.string().optional(),
    stage: z.enum(KANBAN_STAGES).optional(),
});
type ActivityFormData = z.infer<typeof activityFormSchema>;

/**
 * A form for logging communication activities (calls, emails, etc.) for a lead.
 * This form also includes a field for updating the lead's course interest,
 * as this often changes as a result of communication.
 * @param {object} props - The component props.
 * @param {Lead} props.lead - The lead to log the activity for.
 * @param {() => void} props.onSave - Callback to execute after saving.
 */
function CommunicationForm({ lead, onSave }: { lead: Lead; onSave: () => void }) {
    const [state, formAction] = useActionState(addActivityAction, { error: undefined, message: undefined });
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();

    const {
        register,
        handleSubmit: handleActivitySubmit,
        reset,
        control,
        formState: { errors },
    } = useForm<ActivityFormData>({
        resolver: zodResolver(activityFormSchema),
        defaultValues: { 
            leadId: lead.id, 
            userId: "user-1", 
            type: "Call", 
            stage: lead.stage,
            courseInterest: lead.courseInterest || "Yet to decide",
        }
    });

    useEffect(() => {
        if (state.message) {
            toast({ title: "Success", description: state.message });
            reset();
            onSave();
        } else if (state.error) {
            toast({ variant: "destructive", title: "Error", description: state.error });
        }
    }, [state, toast, reset, onSave]);

    const onFormSubmit = (data: ActivityFormData) => {
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
            if(value) formData.append(key, value);
        });
        startTransition(() => formAction(formData));
    };
    
    return (
        <div className="space-y-3">
             <form onSubmit={handleActivitySubmit(onFormSubmit)} className="space-y-3">
                <div className="space-y-1">
                    <Label htmlFor="stage">Stage</Label>
                    <Controller
                        name="stage"
                        control={control}
                        render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger className="h-9"><SelectValue placeholder="Select a stage" /></SelectTrigger>
                                <SelectContent>
                                    {KANBAN_STAGES.map(stage => <SelectItem key={stage} value={stage}>{stage}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        )}
                    />
                </div>
                <div className="space-y-1">
                    <Label htmlFor="courseInterest">Course Interest</Label>
                    <Controller
                        name="courseInterest"
                        control={control}
                        render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger className="h-9"><SelectValue placeholder="Select a course" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Yet to decide">Yet to decide</SelectItem>
                                    {courses.map(course => <SelectItem key={course.id} value={course.title}>{course.title}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        )}
                    />
                </div>
                <div className="space-y-1">
                    <Label htmlFor="type">Type</Label>
                    <Controller name="type" control={control} render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger className="h-9"><SelectValue placeholder="Select type" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Call">Call</SelectItem>
                                <SelectItem value="Email">Email</SelectItem>
                                <SelectItem value="SMS">SMS</SelectItem>
                                <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                                <SelectItem value="Walk in">Walk in</SelectItem>
                            </SelectContent>
                        </Select>
                    )} />
                    {errors.type && <FormMessage>{errors.type.message}</FormMessage>}
                </div>
                <div className="space-y-1">
                    <Label htmlFor="outcome">Outcome</Label>
                    <Input id="outcome" {...register("outcome")} placeholder="e.g., Follow-up scheduled" className="h-9" />
                    {errors.outcome && <FormMessage>{errors.outcome.message}</FormMessage>}
                </div>
                <div className="space-y-1">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea id="notes" {...register("notes")} placeholder="Add detailed notes..." rows={3} />
                    {errors.notes && <FormMessage>{errors.notes.message}</FormMessage>}
                </div>
                <Button type="submit" disabled={isPending} className="w-full" size="sm">{isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Log Activity"}</Button>
            </form>
        </div>
    )
}

/**
 * A reusable component for displaying a field that can be switched to an editable input.
 * This is used for inline editing of lead properties directly in the profile view.
 * It handles its own editing state, validation, and saving logic.
 * @param {object} props - The component props for the editable field.
 * @param {Lead} props.lead - The current lead object.
 * @param {keyof FormData} props.fieldName - The name of the field being edited.
 * @param {string} props.label - The label for the field.
 * @param {any} props.validation - The Zod validation schema for the field.
 * @param {React.ElementType} [props.icon] - An optional icon to display next to the field.
 * @param {(fieldName: string, value: any) => Promise<boolean>} props.onSave - The function to call when saving the change.
 * @param {string | null} [props.displayValue] - An optional display value, if it differs from the actual value.
 * @param {(value: any, setValue: (fieldName: keyof FormData, value: any) => void) => React.ReactNode} [props.children] - An optional render prop for custom input controls (e.g., a Select dropdown).
 * @returns {JSX.Element} An editable field component.
 */
const EditableField = ({ lead, fieldName, label, validation, icon: Icon, onSave, displayValue, children }: { lead: Lead; fieldName: keyof FormData; label: string; validation: any; icon?: React.ElementType; onSave: (fieldName: string, value: any, secondaryValue?: any) => Promise<boolean>; displayValue?: string | null; children?: (value: any, setValue: (fieldName: keyof FormData, value: any, secondaryFieldName? : keyof FormData, secondaryValue?: any) => void, control: any) => React.ReactNode; }) => {
  const isMobile = useIsMobile();
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValueState] = useState(lead[fieldName as keyof Lead] || "");
  const [secondaryValue, setSecondaryValue] = useState(fieldName === 'education' ? lead.status : undefined);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const { control, getValues, setValue: setFormValue, register } = useFormContext();

  const handleSave = async () => {
    setError(null);
    setIsSaving(true);
    let success = false;
    if (fieldName === 'phoneNumbers') {
        const phoneNumbers = getValues().phoneNumbers;
        const result = z.array(z.object({
            title: z.string().min(1), 
            number: z.string().refine(v => phoneRegex.test(v))
        })).safeParse(phoneNumbers);
        if (!result.success) {
            setError("Invalid phone numbers.");
            setIsSaving(false);
            return;
        }
        success = await onSave(fieldName, phoneNumbers);
    } else {
        const result = validation.safeParse(value);
        if (!result.success) {
          setError(result.error.format()._errors[0] || "Invalid value");
          setIsSaving(false);
          return;
        }
        success = await onSave(fieldName, value, fieldName === 'education' ? secondaryValue : undefined);
    }
    
    if (success) setIsEditing(false);
    setIsSaving(false);
  };

  const handleCancel = () => {
    setValueState(lead[fieldName as keyof Lead] || "");
    if (fieldName === 'education') {
        setSecondaryValue(lead.status);
    }
    if (fieldName === 'phoneNumbers') {
        setFormValue('phoneNumbers', lead.phoneNumbers);
    }
    setIsEditing(false);
    setError(null);
  };
  
  useEffect(() => {
    setValueState(lead[fieldName as keyof Lead] || "");
    if (fieldName === 'education') {
        setSecondaryValue(lead.status);
    }
  }, [lead, fieldName]);

  const finalDisplayValue = displayValue !== undefined ? displayValue : value;

  if (isEditing) {
    return (
      <div className="space-y-1">
        <div className="flex items-center gap-1">
            {children ? children(value, (fieldName, val, secondaryFieldName, secondaryVal) => {
                if (fieldName === 'education') setValueState(val);
                if (secondaryFieldName === 'status' && secondaryVal) setSecondaryValue(secondaryVal);
            }, control) : <Input value={value || ''} onChange={(e) => setValueState(e.target.value)} placeholder={label} className={cn("h-8 flex-1", fieldName === 'name' && 'text-2xl font-bold')} aria-label={label} />}
          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={handleSave} disabled={isSaving}>{isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4 text-green-500" />}</Button>
          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={handleCancel}><X className="w-4 h-4 text-red-500" /></Button>
        </div>
        {error && <FormMessage className="text-xs">{error}</FormMessage>}
      </div>
    );
  }
  
  const DisplayContent = () => {
    if (fieldName === 'education') {
      return (
        <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">{value || 'Not set'}</span>
            {secondaryValue && <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-sm font-medium">{secondaryValue}</span>}
        </div>
      )
    }
    if (fieldName === 'phoneNumbers') {
        const phoneNumbers = lead.phoneNumbers;
        if (!phoneNumbers || phoneNumbers.length === 0) return <span className="text-sm text-muted-foreground">Not set</span>;
        return (
            <div className="flex flex-col gap-1">
                {phoneNumbers.map((phone, index) => (
                    <div key={index} className="flex items-center gap-2">
                        <span className="text-sm font-medium text-muted-foreground">{phone.title}:</span>
                        <span className="text-sm">{phone.number}</span>
                    </div>
                ))}
            </div>
        )
    }

    return <span className="text-sm text-muted-foreground">{finalDisplayValue || "Not set"}</span>
  }

  return (
    <div className="group relative flex items-center gap-2 py-1 min-h-[36px] pr-8">
       {Icon && <Icon className="w-4 h-4 text-muted-foreground shrink-0" />}
       {fieldName === 'name' ? <h2 className="text-2xl font-bold">{finalDisplayValue || "No Name"}</h2> : <DisplayContent />}
       
        <Button size="icon" variant="ghost" onClick={() => setIsEditing(true)} className={cn("h-6 w-6 rounded-full text-muted-foreground hover:bg-accent", isMobile ? "opacity-100" : "opacity-0 group-hover:opacity-100", "absolute right-0")}>
            <Edit className="w-3 h-3" />
        </Button>
    </div>
  );
};


/**
 * The main component for the lead profile dialog.
 * It manages the overall state and renders the header, tabs, and content sections,
 * including activity logs, communication forms, and task lists.
 * @param {LeadProfileDialogProps} props - The props for the dialog.
 * @returns {JSX.Element | null} The lead profile dialog component, or null if no lead is selected.
 */
export function LeadProfileDialog({ lead, isOpen, onOpenChange, onLeadUpdate }: LeadProfileDialogProps) {
  const { toast } = useToast();
  const [state, formAction] = useActionState(updateLeadAction, { errors: {} });
  const [isPending, startTransition] = useTransition();

  const formMethods = useForm<FormData>({ resolver: zodResolver(updateLeadFormSchema) });
  const { control, reset, getValues, setValue, handleSubmit, register } = formMethods;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "phoneNumbers",
  });
  
  useEffect(() => {
    if (lead) {
        const defaultValues: Partial<FormData> = { 
            id: lead.id, 
            name: lead.name, 
            email: lead.email, 
            assignedUserId: lead.assignedUserId, 
            phoneNumbers: lead.phoneNumbers || [], 
            source: lead.source, 
            courseInterest: lead.courseInterest || "", 
            education: lead.education || "", 
            college: lead.college || "",
            status: lead.status,
        };
        reset(defaultValues);
    }
  }, [lead, reset]);


  useEffect(() => {
    if (state?.message) {
      toast({ title: "Success", description: state.message });
      if (lead && onLeadUpdate) {
          const currentValues = getValues();
          const updatedLeadData = { ...lead, ...currentValues };
          onLeadUpdate(updatedLeadData as Lead);
      }
    } else if (state?.errors && Object.keys(state.errors).length > 0) {
        const errorMessages = Object.values(state.errors).flat().join(' ');
        toast({ variant: "destructive", title: "Error", description: errorMessages || 'An error occurred.' });
    }
  }, [state, toast, getValues, lead, onLeadUpdate]);

  if (!lead) return null;

  const handleOpenChange = (open: boolean) => {
    if (!open) reset();
    onOpenChange(open);
  };
  
  const onFormSubmit = (data: FormData) => {
    const formData = new FormData();
    const dataToSubmit: Partial<FormData> = { ...data };

    Object.entries(dataToSubmit).forEach(([key, value]) => { 
        if (key === 'phoneNumbers' && Array.isArray(value)) {
            value.forEach(phone => {
                formData.append('phoneTitles', phone.title);
                formData.append('phoneNumbers', phone.number);
            });
        } else if (value) {
            formData.append(key, value as string);
        }
     });
    startTransition(() => formAction(formData));
  };
  
  /**
   * Saves an individual field that was edited inline. This function is passed to
   * the `EditableField` component.
   * @param fieldName - The name of the field to update.
   * @param value - The new value of the field.
   * @param secondaryValue - An optional secondary value, used for fields like education status.
   * @returns A promise that resolves to true if the save was successful, false otherwise.
   */
  const handleInlineSave = async (fieldName: string, value: any, secondaryValue?: any) => {
    const newValues: Partial<FormData> = { ...getValues(), [fieldName]: value };
    if (fieldName === 'education' && secondaryValue) {
        newValues.status = secondaryValue;
    }
    if (fieldName === 'phoneNumbers') {
        setValue(fieldName as keyof FormData, value, { shouldValidate: true, shouldDirty: true });
    } else {
        setValue(fieldName as keyof FormData, value, { shouldValidate: true, shouldDirty: true });
        if (fieldName === 'education' && secondaryValue) {
            setValue('status', secondaryValue);
        }
    }
    
    return new Promise<boolean>((resolve) => {
        startTransition(() => {
            const formData = new FormData();
            
            Object.entries(newValues).forEach(([key, val]) => { 
                if (key === 'phoneNumbers' && Array.isArray(val)) {
                    val.forEach(phone => {
                        formData.append('phoneTitles', phone.title);
                        formData.append('phoneNumbers', phone.number);
                    });
                } else if (val) {
                    formData.append(key, val as string);
                }
            });

            updateLeadAction(state, formData).then((result) => {
                if (result.message) {
                    toast({ title: "Success", description: result.message });
                    if (lead && onLeadUpdate) {
                        onLeadUpdate({ ...lead, ...newValues } as Lead);
                    }
                    resolve(true);
                } else {
                    const errorMessages = result.errors ? Object.values(result.errors).flat().join(' ') : 'An error occurred.';
                    toast({ variant: "destructive", title: "Error", description: errorMessages });
                    resolve(false);
                }
            });
        });
    });
  };

  /**
   * A callback function that is triggered after a new activity is logged.
   * It ensures the UI is updated to reflect any changes.
   */
  const handleActivityLogged = () => {
    // We can refresh the lead data here if needed, but revalidatePath should handle it.
    // For now, we can just trigger the parent's update function to reflect changes if any.
    if (lead) onLeadUpdate(lead); 
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent 
        className="max-w-4xl w-[90vw] h-[90vh] p-0 flex flex-col"
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Lead Profile: {lead.name}</DialogTitle>
          <DialogDescription>View, edit, and manage lead activities, tasks, and details.</DialogDescription>
        </DialogHeader>
        <FormProvider {...formMethods}>
        <ScrollArea className="flex-1">
          {/* Header Section */}
          <div className="p-6">
             <div className="pb-4 shrink-0 space-y-4">
                <div className="flex items-start gap-4">
                    <Avatar className="w-16 h-16 border-2 shrink-0"><AvatarImage src={getImage(lead.avatarUrl)} alt={lead.name} data-ai-hint="person avatar" /><AvatarFallback>{getValues().name?.charAt(0) || 'L'}</AvatarFallback></Avatar>
                    <div className="flex-1 space-y-1">
                        <div className="flex items-start justify-between">
                            <div className="flex-1 space-y-0.5">
                                <EditableField lead={lead} fieldName="name" label="Name" validation={z.string().min(2, "Name must be at least 2 characters.")} onSave={handleInlineSave} />
                                <div className="flex items-center gap-4">
                                  <EditableField lead={lead} fieldName="college" label="College" validation={z.string().optional()} icon={School} onSave={handleInlineSave} />
                                  <EditableField lead={lead} fieldName="education" label="Education" validation={z.string().optional()} icon={GraduationCap} onSave={handleInlineSave}>
                                    {(value, setVal, control) => (
                                        <div className="flex items-center gap-2">
                                            <Input value={getValues().education || ''} onChange={(e) => setVal('education', e.target.value)} placeholder="Degree" className="h-8 flex-1" aria-label="Education" />
                                            <Controller control={control} name="status" render={({ field }) => (
                                              <Select onValueChange={(val) => setVal('status', val, 'status', val)} value={field.value}>
                                                  <SelectTrigger className="h-8 border-dashed w-32"><SelectValue placeholder="Status" /></SelectTrigger>
                                                  <SelectContent>
                                                      <SelectItem value="Passed">Passed</SelectItem>
                                                      <SelectItem value="Pursuing">Pursuing</SelectItem>
                                                  </SelectContent>
                                              </Select>
                                            )} />
                                        </div>
                                    )}
                                  </EditableField>
                                </div>
                            </div>
                            <StageBadge stage={getValues().stage} />
                        </div>
                        <div className="flex items-center gap-4">
                            <EditableField lead={lead} fieldName="email" label="Email" validation={z.string().email("Please enter a valid email address.")} icon={Mail} onSave={handleInlineSave} />
                            <EditableField lead={lead} fieldName="phoneNumbers" label="Phone" validation={z.string().optional()} icon={Phone} onSave={handleInlineSave}>
                                {(value, setVal, control) => (
                                     <div className="w-full space-y-2">
                                        {fields.map((field, index) => (
                                            <div key={field.id} className="flex items-center gap-2">
                                                <Input {...register(`phoneNumbers.${index}.title`)} placeholder="e.g. Mobile" className="w-24 h-8" />
                                                <div className="flex-1">
                                                    <Input {...register(`phoneNumbers.${index}.number`)} type="tel" placeholder="+91 98765 43210" className="h-8"/>
                                                </div>
                                                <Button type="button" variant="ghost" size="icon" className="shrink-0 h-7 w-7" onClick={() => remove(index)} disabled={fields.length <=1}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                        <Button type="button" variant="outline" size="sm" onClick={() => append({ title: '', number: '' })}>
                                            <PlusCircle className="mr-2 h-4 w-4" /> Add Phone
                                        </Button>
                                    </div>
                                )}
                            </EditableField>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2">
                             <EditableField lead={lead} fieldName="assignedUserId" label="Counselor" validation={z.string().min(1, "Counselor is required.")} icon={User} onSave={handleInlineSave} displayValue={users.find(u => u.id === getValues().assignedUserId)?.name || "Unassigned"}>
                                {(value, setVal) => (<Select onValueChange={(v) => setVal('assignedUserId', v)} value={value}><SelectTrigger className="h-8 border-dashed w-36"><SelectValue placeholder="Select Counselor" /></SelectTrigger><SelectContent>{users.filter(u => u.role.id === 'counselor' || u.role.id === 'admin').map(user => <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>)}</SelectContent></Select>)}
                            </EditableField>
                            <EditableField lead={lead} fieldName="source" label="Source" validation={z.string().min(1, "Source is required.")} icon={Info} onSave={handleInlineSave} />
                            <EditableField lead={lead} fieldName="courseInterest" label="Course Interest" validation={z.string().optional()} icon={BookOpen} onSave={handleInlineSave} displayValue={getValues().courseInterest || "Not set"}>
                                {(value, setVal) => (<Select onValueChange={(v) => setVal('courseInterest', v)} value={value}><SelectTrigger className="h-8 border-dashed w-48"><SelectValue placeholder="Select a course" /></SelectTrigger><SelectContent>{courses.map(course => <SelectItem key={course.id} value={course.title}>{course.title}</SelectItem>)}</SelectContent></Select>)}
                            </EditableField>
                        </div>
                    </div>
                </div>
            </div>
          </div>
          
          <Tabs defaultValue="activities" className="flex-1">
            <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b">
                <div className="px-6">
                    <TabsList>
                        <TabsTrigger value="activities"><Activity className="w-4 h-4 mr-2" />Activities</TabsTrigger>
                        <TabsTrigger value="communication"><Phone className="w-4 h-4 mr-2" />Communication</TabsTrigger>
                        <TabsTrigger value="tasks"><UserCheck className="w-4 h-4 mr-2" />Tasks</TabsTrigger>
                    </TabsList>
                </div>
            </div>
          
            <div className="grid md:grid-cols-5 gap-6 p-6">
                <div className="md:col-span-3">
                    <TabsContent value="activities"><ActivityLog activities={lead.activities} /></TabsContent>
                    <TabsContent value="communication"><div className="p-1"><h3 className="text-lg font-medium mb-4">Add to Communication Log</h3><CommunicationForm lead={lead} onSave={handleActivityLogged} /></div></TabsContent>
                    <TabsContent value="tasks"><div className="p-1"><AddTaskForm leadId={lead.id} /></div></TabsContent>
                </div>
                <div className="md:col-span-2">
                    <h3 className="text-lg font-medium mb-4">To Do List</h3>
                    <TaskList tasks={lead.tasks} />
                </div>
            </div>
          </Tabs>
        </ScrollArea>
        </FormProvider>

        <DialogFooter className="p-4 border-t bg-background shrink-0">
            <DialogClose asChild><Button type="button" variant="outline" size="sm">Close</Button></DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
