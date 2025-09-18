/**
 * @file This file defines the main layout for the entire dashboard.
 * It includes the consistent header, the collapsible sidebar navigation for desktop,
 * and the sheet-based navigation for mobile devices. It now features dynamic navigation
 * based on user roles, ensuring users only see links relevant to them.
 */
"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Search, Bell, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Toaster } from "@/components/ui/toaster";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { navConfig } from "@/lib/nav-config";
import type { NavItem } from "@/lib/types";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

/**
 * In a real production application, this function would securely get the
 * user's session from the request headers or an encrypted cookie.
 * For this demo, we are hardcoding it to allow easy switching between user roles for testing.
 * @returns The current user object or undefined.
 */
const getCurrentUser = () => {
    // You can change the user ID to test different roles.
    // 'user-1' is a Super Admin.
    // 'user-5' is a Counselor.
    // 'user-6' is another Counselor.
    // 'user-2' is a Department Admin.
    return { id: 'user-1', name: 'Super Admin', email: 'admin@spruce.com', roleId: 'super-admin' };
}
const currentUser = getCurrentUser();


/**
 * A single navigation link component used in both desktop and mobile navigation.
 * It highlights itself if the current URL path matches its href, indicating the active page.
 * It also adapts its appearance based on whether the sidebar is expanded or collapsed.
 * @param {object} props - Component props.
 * @param {NavItem} props.item - The navigation item data (href, label, icon).
 * @param {boolean} [props.isMobile=false] - True if the link is for the mobile navigation sheet.
 * @param {boolean} [props.isExpanded=true] - True if the desktop sidebar is expanded.
 */
function NavLink({ 
    item, 
    isMobile = false, 
    isExpanded = true 
}: { 
    item: NavItem, 
    isMobile?: boolean, 
    isExpanded?: boolean 
}) {
    const pathname = usePathname();
    const isActive = pathname.startsWith(item.href);

    const linkContent = (
         <div className={cn("flex items-center gap-4", !isExpanded && "justify-center")}>
            <item.icon className="h-5 w-5 shrink-0" />
            <span className={cn(
                "truncate transition-all duration-200",
                isExpanded ? "opacity-100" : "opacity-0",
                isMobile && "text-base"
            )}>{item.label}</span>
        </div>
    );

    const linkClasses = cn(
        "flex items-center h-10 w-full rounded-lg px-3 text-muted-foreground transition-colors hover:text-primary",
        isActive && "bg-primary/10 text-primary font-semibold",
        !isExpanded && "justify-center",
        isMobile && "h-12"
    );

    // If the sidebar is expanded or it's a mobile view, render a standard link.
    if (isExpanded || isMobile) {
        return (
            <Link href={item.href} className={linkClasses}>
                {linkContent}
            </Link>
        );
    }
    
    // For a collapsed desktop sidebar, wrap the link in a tooltip to show the label on hover.
    return (
        <TooltipProvider>
            <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                     <Link href={item.href} className={linkClasses}>
                        {linkContent}
                    </Link>
                </TooltipTrigger>
                <TooltipContent side="right" className="ml-2">
                    <p>{item.label}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}

/**
 * The mobile navigation component, which appears as a slide-out "sheet" from the left.
 * It dynamically renders navigation items based on the user's role.
 * @param {object} props - Component props.
 * @param {string} props.roleId - The ID of the current user's role.
 */
function MobileNav({ roleId }: { roleId: string }) {
    const [isOpen, setIsOpen] = React.useState(false);
    // Get the appropriate navigation items for the user's role from the central config.
    const navItems = navConfig.sidebarNav[roleId as keyof typeof navConfig.sidebarNav] || [];
    const { logo: Logo } = navConfig;

    return (
         <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Toggle Menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="bg-card w-72 p-0 flex flex-col">
                 <SheetHeader className="p-4 border-b">
                     <SheetTitle className="sr-only">Main Menu</SheetTitle>
                     <SheetDescription className="sr-only">Navigation links for the application.</SheetDescription>
                    <Link href="/dashboard" className="flex items-center gap-3 h-10" onClick={() => setIsOpen(false)}>
                        <Logo className="h-7 w-7 text-primary" />
                        <h1 className="text-xl font-bold">{navConfig.title}</h1>
                    </Link>
                 </SheetHeader>
                 <div className="p-4 flex-1">
                    {/* When a nav link is clicked, the sheet closes to improve UX. */}
                    <nav className="flex flex-col gap-2 flex-1" onClick={() => setIsOpen(false)}>
                        {navItems.map(item => <NavLink key={item.href} item={item} isMobile />)}
                    </nav>
                 </div>
            </SheetContent>
        </Sheet>
    );
}

/**
 * The desktop sidebar navigation. It can be expanded or collapsed.
 * @param {object} props - Component props.
 * @param {boolean} props.isExpanded - Whether the sidebar is currently expanded.
 * @param {(isExpanded: boolean) => void} props.setIsExpanded - Function to toggle the sidebar state.
 * @param {string} props.roleId - The current user's role ID.
 */
function DesktopNav({isExpanded, setIsExpanded, roleId}: {isExpanded: boolean, setIsExpanded: (isExpanded: boolean) => void, roleId: string}) {
    const navItems = navConfig.sidebarNav[roleId as keyof typeof navConfig.sidebarNav] || [];
    const { logo: Logo } = navConfig;

    return (
        <aside 
            className={cn(
                "hidden md:flex flex-col fixed inset-y-0 left-0 z-30 transition-all duration-300 ease-in-out bg-card border-r",
                isExpanded ? "w-60" : "w-20"
            )}
        >
            <div className="flex-1 flex flex-col">
                <div className={cn("h-16 flex items-center border-b", isExpanded ? "px-4" : "justify-center")}>
                    <Link href="/dashboard" className="flex items-center gap-3">
                         <Logo className="h-7 w-7 text-primary shrink-0" />
                         <h1 className={cn("text-xl font-bold transition-opacity duration-200", isExpanded ? "opacity-100" : "opacity-0")}>{navConfig.title}</h1>
                    </Link>
                </div>
                <nav className="flex flex-col gap-1 w-full flex-1 p-3">
                    {navItems.map(item => <NavLink key={item.href} item={item} isExpanded={isExpanded} />)}
                </nav>
            </div>
             <div className="p-3 mt-auto">
             </div>
        </aside>
    )
}

/**
 * The main header component for the dashboard.
 * Contains the sidebar toggle, search bar, notifications, and user profile dropdown.
 */
function Header({ user, roleId, isExpanded, setIsExpanded }: { user: { name: string, email: string, id: string }, roleId: string, isExpanded: boolean, setIsExpanded: (isExpanded: boolean) => void }) {

    return (
        <header className={cn(
                "flex items-center h-16 px-4 md:px-6 shrink-0 glassmorphic border-b sticky top-0 z-20"
            )}>
             <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="hidden md:inline-flex" onClick={() => setIsExpanded(!isExpanded)}>
                    {isExpanded ? <PanelLeftClose /> : <PanelLeftOpen />}
                    <span className="sr-only">Toggle sidebar</span>
                </Button>
                <MobileNav roleId={roleId} />
             </div>

            <div className="ml-auto flex items-center gap-4">
                 <div className="relative hidden sm:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input placeholder="Search..." className="w-full max-w-sm pl-10 bg-background/70 focus:bg-card" />
                </div>
                <Button variant="ghost" size="icon" className="rounded-full">
                    <Bell className="h-5 w-5" />
                    <span className="sr-only">Notifications</span>
                </Button>
                {/* User profile dropdown menu */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                         <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                            <Avatar className="h-10 w-10">
                                <AvatarImage src={`https://picsum.photos/seed/1/40/40`} alt={user?.name} />
                                <AvatarFallback>{user?.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none">{user?.name}</p>
                                <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Profile</DropdownMenuItem>
                        <DropdownMenuItem>Billing</DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href="/dashboard/settings">Settings</Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Log out</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}

/**
 * The main DashboardLayout component.
 * It brings together the Header, DesktopNav, and the main content area (`children`).
 * It manages the state for the collapsible sidebar.
 * @param {object} props - The component props.
 * @param {React.ReactNode} props.children - The page content to be rendered within the layout.
 * @returns A JSX element representing the complete dashboard layout.
 */
export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isExpanded, setIsExpanded] = React.useState(true);
    return (
        <div className="min-h-screen w-full bg-background text-foreground flex flex-col">
            <DesktopNav isExpanded={isExpanded} setIsExpanded={setIsExpanded} roleId={currentUser.roleId} />
            <div className={cn(
                "flex flex-col flex-1 transition-all duration-300 ease-in-out",
                isExpanded ? "md:ml-60" : "md:ml-20"
            )}>
                <Header user={currentUser} roleId={currentUser.roleId} isExpanded={isExpanded} setIsExpanded={setIsExpanded}/>
                {/* The main content area where different pages will be rendered */}
                <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
                    {children}
                </main>
            </div>
            {/* The Toaster component is used to display pop-up notifications globally */}
            <Toaster />
        </div>
    );
}
