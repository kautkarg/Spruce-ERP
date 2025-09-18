/**
 * @file This component provides a dialog form for adding a new lead.
 * It includes conditional fields (e.g., for "Social Media" or "Other" sources)
 * and uses client-side validation with Zod and server-side validation via a server action.
 */
"use client";

import { useActionState } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { PlusCircle, Loader2, Trash2, Calendar as CalendarIcon } from "lucide-react";
import { addLeadAction, type AddLeadState } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { courses } from "@/lib/courses-data";
import { z } from "zod";
import { FormMessage } from "../ui/form-message";
import { ScrollArea } from "../ui/scroll-area";
import { cn } from "@/lib/utils";
import { Popover, PopoverTrigger, PopoverContent } from "../ui/popover";
import { Calendar } from "../ui/calendar";
import { format } from "date-fns";

// Validation schema for the add lead form using Zod.
const phoneRegex = /^\+?[1-9]\d{9,14}$/;
const addLeadFormSchema = z.object({
    name: z.string().min(2, { message: "Name must be at least 2 characters."}),
    email: z.string().email({ message: "Please enter a valid email address."}),
    phoneNumbers: z.array(z.object({
        title: z.string().min(1, { message: "Title is required." }),
        number: z.string().refine(val => val ? phoneRegex.test(val) : true, {
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
    dob: z.date().optional(),
}).refine(data => !(data.source === 'Other' && !data.otherSource), { // Conditional validation for 'Other' source
    message: "Please specify the source if 'Other' is selected.",
    path: ["otherSource"],
}).refine(data => !(data.source === 'Social Media' && !data.socialMediaSource), { // Conditional validation for 'Social Media' source
    message: "Please specify the social media channel.",
    path: ["socialMediaSource"],
}).refine(data => !(data.source === 'Referral' && !data.referralSource), { // Conditional validation for 'Referral' source
    message: "Please specify the referrer name.",
    path: ["referralSource"],
});

type FormData = z.infer<typeof addLeadFormSchema>;
const initialState: AddLeadState = { errors: {} };

/**
 * A submit button that shows a loading spinner during form submission.
 * It's disabled while the form is submitting to prevent multiple submissions.
 * @param {object} props - The component props.
 * @param {boolean} props.isSubmitting - Whether the form is currently submitting.
 * @returns {JSX.Element} A submit button with a loading state.
 */
function SubmitButton({ isSubmitting }: { isSubmitting: boolean }) {
    return (
        <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save lead
        </Button>
    )
}

/**
 * The AddLeadForm component.
 * It renders a button that opens a dialog with the new lead form. The form state is managed
 * by React Hook Form, and submission is handled by a server action.
 * @returns {JSX.Element} A JSX element for the add lead functionality.
 */
export function AddLeadForm() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const [state, formAction] = useActionState(addLeadAction, initialState);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    reset,
    control
  } = useForm<FormData>({
    resolver: zodResolver(addLeadFormSchema),
    defaultValues: { name: "", email: "", phoneNumbers: [{title: 'Mobile', number: ''}], source: "", socialMediaSource: "", otherSource: "", referralSource: "", education: "", college: "", status: undefined, courseInterest: "", address: "", city: "", gender: undefined },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "phoneNumbers",
  });

  const source = watch("source"); // Watch the 'source' field to show/hide conditional fields.

  // Effect to show toast notifications based on the server action's response.
  useEffect(() => {
    if (state?.message) {
      toast({ title: "Success", description: state.message });
      setOpen(false);
      reset();
    } else if (state?.errors && Object.keys(state.errors).length > 0) {
        const errorMessages = Object.values(state.errors).flat().join(' ');
        toast({ variant: "destructive", title: "Error", description: errorMessages || 'An error occurred.' });
    }
  }, [state, toast, reset]);
  
  /**
   * Prepares the form data and calls the server action.
   * @param data - The validated form data.
   */
  const onFormSubmit = (data: FormData) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => { 
        if (key === 'phoneNumbers' && Array.isArray(value)) {
            value.forEach(phone => {
              if (phone.title && phone.number) {
                formData.append('phoneTitles', phone.title);
                formData.append('phoneNumbers', phone.number);
              }
            });
        } else if (key === 'dob' && value instanceof Date) {
            formData.append(key, value.toISOString());
        }
         else if (value) {
            formData.append(key, value as string);
        }
    });
    formAction(formData);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if(!isOpen) reset(); setOpen(isOpen); }}>
      <DialogTrigger asChild><Button><PlusCircle className="mr-2 h-4 w-4" /> Add Lead</Button></DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Lead</DialogTitle>
          <DialogDescription>Enter the details for the new lead. Click save when you&apos;re done.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onFormSubmit)} noValidate>
            <ScrollArea className="h-96">
                <div className="grid gap-4 py-4 pr-6">
                    {/* Form Fields */}
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="name" className="text-right">Name</Label>
                      <div className="col-span-3"><Input id="name" {...register("name")} /><FormMessage>{errors.name?.message || state?.errors?.name?.[0]}</FormMessage></div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="email" className="text-right">Email</Label>
                      <div className="col-span-3"><Input id="email" type="email" {...register("email")} /><FormMessage>{errors.email?.message || state?.errors?.email?.[0]}</FormMessage></div>
                    </div>

                    <div className="grid grid-cols-4 items-start gap-4">
                        <Label className="text-right pt-2">Phone</Label>
                        <div className="col-span-3 space-y-2">
                            {fields.map((field, index) => (
                                <div key={field.id} className="flex items-center gap-2">
                                    <Input {...register(`phoneNumbers.${index}.title`)} placeholder="e.g. Mobile" className="w-24" />
                                    <div className="flex-1">
                                        <Input {...register(`phoneNumbers.${index}.number`)} type="tel" placeholder="+91 98765 43210" />
                                        <FormMessage>{errors.phoneNumbers?.[index]?.number?.message}</FormMessage>
                                    </div>
                                    <Button type="button" variant="ghost" size="icon" className="shrink-0" onClick={() => remove(index)} disabled={fields.length <=1}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                             <Button type="button" variant="outline" size="sm" onClick={() => append({ title: '', number: '' })}>
                                <PlusCircle className="mr-2 h-4 w-4" /> Add Phone
                            </Button>
                        </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="dob" className="text-right">Birth Date</Label>
                        <div className="col-span-3">
                            <Controller control={control} name="dob" render={({ field }) => (
                                <Popover>
                                    <PopoverTrigger asChild>
                                    <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}>
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                    </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} captionLayout="dropdown-buttons" fromYear={1980} toYear={2010} initialFocus /></PopoverContent>
                                </Popover>
                            )} />
                            <FormMessage>{errors.dob?.message}</FormMessage>
                        </div>
                    </div>
                     <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="gender" className="text-right">Gender</Label>
                        <div className="col-span-3">
                            <Controller control={control} name="gender" render={({ field }) => (
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                                    <SelectContent><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem><SelectItem value="Other">Other</SelectItem></SelectContent>
                                </Select>
                            )} />
                            <FormMessage>{errors.gender?.message}</FormMessage>
                        </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="address" className="text-right">Address</Label>
                        <div className="col-span-3"><Input id="address" {...register("address")} placeholder="Apartment, building, street..." /><FormMessage>{errors.address?.message}</FormMessage></div>
                    </div>
                     <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="city" className="text-right">City</Label>
                        <div className="col-span-3"><Input id="city" {...register("city")} placeholder="e.g. Mumbai" /><FormMessage>{errors.city?.message}</FormMessage></div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="source" className="text-right">Source</Label>
                      <div className="col-span-3">
                          <Controller control={control} name="source" render={({ field }) => (
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <SelectTrigger><SelectValue placeholder="Select a source" /></SelectTrigger>
                                  <SelectContent><SelectItem value="College Seminar">College Seminar</SelectItem><SelectItem value="Walk in">Walk in</SelectItem><SelectItem value="Online">Online</SelectItem><SelectItem value="Referral">Referral</SelectItem><SelectItem value="Social Media">Social Media</SelectItem><SelectItem value="Other">Other</SelectItem></SelectContent>
                              </Select>
                          )} />
                          <FormMessage>{errors.source?.message || state?.errors?.source?.[0]}</FormMessage>
                      </div>
                    </div>
                    {/* Conditional field for Social Media source */}
                    {source === 'Social Media' && (
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="socialMediaSource" className="text-right">Channel</Label>
                             <div className="col-span-3">
                                <Controller control={control} name="socialMediaSource" render={({ field }) => (
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <SelectTrigger><SelectValue placeholder="Select a channel" /></SelectTrigger>
                                        <SelectContent><SelectItem value="Facebook">Facebook</SelectItem><SelectItem value="Instagram">Instagram</SelectItem><SelectItem value="LinkedIn">LinkedIn</SelectItem><SelectItem value="Twitter/X">Twitter/X</SelectItem><SelectItem value="YouTube">YouTube</SelectItem><SelectItem value="Other">Other</SelectItem></SelectContent>
                                    </Select>
                                )} />
                                <FormMessage>{errors.socialMediaSource?.message || state?.errors?.socialMediaSource?.[0]}</FormMessage>
                            </div>
                        </div>
                    )}
                    {/* Conditional field for Referral source */}
                    {source === 'Referral' && (
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="referralSource" className="text-right">Referrer</Label>
                            <div className="col-span-3"><Input id="referralSource" {...register("referralSource")} placeholder="Enter referrer name" /><FormMessage>{errors.referralSource?.message || state?.errors?.referralSource?.[0]}</FormMessage></div>
                        </div>
                    )}
                    {/* Conditional field for Other source */}
                    {source === 'Other' && (
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="otherSource" className="text-right">Specify</Label>
                            <div className="col-span-3"><Input id="otherSource" {...register("otherSource")} /><FormMessage>{errors.otherSource?.message || state?.errors?.otherSource?.[0]}</FormMessage></div>
                        </div>
                    )}
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="education" className="text-right">Education</Label>
                      <div className="col-span-3"><Input id="education" {...register("education")} placeholder="e.g. B.Tech CSE" /><FormMessage>{errors.education?.message || state?.errors?.education?.[0]}</FormMessage></div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="college" className="text-right">College</Label>
                      <div className="col-span-3"><Input id="college" {...register("college")} placeholder="e.g. IIT Delhi" /><FormMessage>{errors.college?.message || state?.errors?.college?.[0]}</FormMessage></div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="status" className="text-right">Status</Label>
                         <Controller control={control} name="status" render={({ field }) => (
                              <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="col-span-3 flex gap-4">
                                  <div className="flex items-center space-x-2"><RadioGroupItem value="Passed" id="passed" /><Label htmlFor="passed" className="font-normal">Passed</Label></div>
                                  <div className="flex items-center space-x-2"><RadioGroupItem value="Pursuing" id="pursuing" /><Label htmlFor="pursuing" className="font-normal">Pursuing</Label></div>
                              </RadioGroup>
                         )} />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="courseInterest" className="text-right">Course</Label>
                        <Controller control={control} name="courseInterest" render={({ field }) => (
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <SelectTrigger className="col-span-3"><SelectValue placeholder="Select a course" /></SelectTrigger>
                                <SelectContent>{courses.map((course) => <SelectItem key={course.id} value={course.title}>{course.title}</SelectItem>)}</SelectContent>
                            </Select>
                        )} />
                    </div>
                </div>
            </ScrollArea>
            <DialogFooter className="pt-4 border-t"><SubmitButton isSubmitting={isSubmitting} /></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
