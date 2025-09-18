/**
 * @file This file defines the "Appearance" settings page, allowing users
 * to switch between light, dark, and system themes.
 */
"use client"

import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Sun, Moon, Laptop } from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"

/**
 * The main component for the Appearance settings page.
 * It provides UI for changing the application's theme.
 * @returns A JSX element rendering the appearance settings.
 */
export default function AppearancePage() {
  const { setTheme, theme } = useTheme()

  return (
    <div className="grid gap-6">
        <Card>
            <CardHeader>
                <CardTitle>Theme</CardTitle>
                <CardDescription>Select the theme for the dashboard.</CardDescription>
            </CardHeader>
            <CardContent>
                 <div className="flex items-center space-x-2 rounded-lg border p-2 max-w-fit">
                    <Button
                        variant={theme === "light" ? "secondary" : "ghost"}
                        size="sm"
                        onClick={() => setTheme("light")}
                        className="flex-1 justify-center"
                    >
                        <Sun className="mr-2 h-4 w-4" />
                        Light
                    </Button>
                    <Button
                        variant={theme === "dark" ? "secondary" : "ghost"}
                        size="sm"
                        onClick={() => setTheme("dark")}
                        className="flex-1 justify-center"
                    >
                        <Moon className="mr-2 h-4 w-4" />
                        Dark
                    </Button>
                    <Button
                        variant={theme === "system" ? "secondary" : "ghost"}
                        size="sm"
                        onClick={() => setTheme("system")}
                        className="flex-1 justify-center"
                    >
                        <Laptop className="mr-2 h-4 w-4" />
                        System
                    </Button>
                </div>
            </CardContent>
        </Card>
    </div>
  )
}
