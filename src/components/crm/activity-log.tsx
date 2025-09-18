/**
 * @file This component displays a chronological log of activities for a lead,
 * such as calls, emails, and meetings, in a visually appealing timeline format.
 */
"use client";

import { Activity } from "@/lib/types";
import { users } from "@/lib/users-data";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { formatDistanceToNow } from 'date-fns';
import { Mail, Phone, MessageSquare, Bot, Building } from "lucide-react";
import { ScrollArea } from "../ui/scroll-area";
import { cn } from "@/lib/utils";

// Helper function to get the placeholder image URL for a given ID.
const getImage = (id: string) => PlaceHolderImages.find((img) => img.id === id)?.imageUrl || "";

// Maps activity types to their corresponding icons.
const activityIcons = {
    Call: Phone,
    Email: Mail,
    SMS: MessageSquare,
    WhatsApp: Bot, // Using Bot icon for WhatsApp as an example
    'Walk in': Building,
    System: Bot, // Using Bot icon for system-generated activities
};

/**
 * ActivityLog component.
 * Renders a list of activities as a vertical timeline.
 * @param {object} props - The component props.
 * @param {Activity[]} props.activities - An array of activity objects to display.
 * @returns A JSX element rendering the activity log timeline.
 */
export function ActivityLog({ activities }: { activities: Activity[] }) {
    // If there are no activities, display a message.
    if (!activities || activities.length === 0) {
        return (
             <div className="h-full rounded-lg border bg-secondary/50 flex items-center justify-center">
                <p className="text-sm text-muted-foreground">No activities logged yet.</p>
            </div>
        );
    }

    return (
        <ScrollArea className="h-96 w-full">
            <div className="relative pl-6">
                {/* The main timeline vertical bar */}
                <div className="absolute left-6 top-0 h-full w-px bg-border" />
                
                <div className="space-y-8">
                    {activities.map((activity) => {
                        const user = users.find(u => u.id === activity.userId);
                        const Icon = activityIcons[activity.type] || Bot;
                        return (
                            <div key={activity.id} className="relative flex items-start gap-4">
                                {/* Timeline Dot and Icon */}
                                <div className="absolute left-0 top-0 flex h-12 w-12 -translate-x-1/2 items-center justify-center rounded-full bg-background">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full border bg-card">
                                        <Icon className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                </div>

                                <div className="w-full space-y-1 pl-12">
                                     {/* Header: User Avatar, Name, and Timestamp */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Avatar className="h-6 w-6 border">
                                                <AvatarImage src={user ? getImage(user.id.replace('user-', '')) : ''} />
                                                <AvatarFallback className="text-xs">{user ? user.name.charAt(0) : 'S'}</AvatarFallback>
                                            </Avatar>
                                            <p className="text-sm font-medium">{user?.name || "System"}</p>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                                        </p>
                                    </div>
                                    {/* Content: Activity details */}
                                    <div className="text-sm p-3 rounded-md bg-secondary/50 border">
                                        <p className="flex items-center">
                                            <span className="font-medium text-foreground/90">{activity.type}:</span>&nbsp;
                                            <span className="text-muted-foreground">{activity.outcome}</span>
                                        </p>
                                        <p className="text-muted-foreground mt-1 italic">"{activity.notes}"</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </ScrollArea>
    );
}
