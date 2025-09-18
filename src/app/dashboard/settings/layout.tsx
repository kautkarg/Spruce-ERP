/**
 * @file This file defines the layout for the "Settings" section of the dashboard.
 * It provides a nested layout with its own sidebar navigation for settings-related pages.
 */
"use client"

import { Users, Shield, Palette } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";


// Defines the navigation items specifically for the settings area.
const settingsNav = [
    { name: "Users & Permissions", href: "/dashboard/settings/users", icon: Users },
    { name: "Roles", href: "/dashboard/settings/roles", icon: Shield },
    { name: "Appearance", href: "/dashboard/settings/appearance", icon: Palette },
];

/**
 * The layout component for all pages within the /settings route.
 * @param {object} props - The component props.
 * @param {React.ReactNode} props.children - The content of the specific settings page to render.
 * @returns A JSX element representing the settings section layout.
 */
export default function SettingsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    const currentPage = settingsNav.find(item => pathname.startsWith(item.href));

    return (
         <div className="space-y-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground">Manage your application and user settings.</p>
            </div>
            <div className="grid md:grid-cols-4 gap-8 items-start">
                <div className="md:col-span-1 flex flex-col gap-6 sticky top-24">
                     <nav className="flex flex-col gap-1">
                        {settingsNav.map(item => (
                            <Link
                                key={item.name}
                                href={item.href}
                                // Highlights the link if the current path matches the link's href.
                                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-accent ${pathname.startsWith(item.href) ? 'bg-accent text-primary font-medium' : ''}`}
                            >
                                <item.icon className="h-5 w-5" />
                                {item.name}
                            </Link>
                        ))}
                    </nav>
                </div>
                
                {/* Main content area for the specific settings page */}
                <main className="md:col-span-3">
                    {children}
                </main>
            </div>
        </div>
    );
}
