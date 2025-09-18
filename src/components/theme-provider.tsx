/**
 * @file This component provides the theme context for the entire application,
 * enabling light and dark mode functionality. It leverages the `next-themes` library.
 */
"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { type ThemeProviderProps } from "next-themes/dist/types"

/**
 * ThemeProvider component.
 * Wraps the application to provide theme switching capabilities.
 * @param {ThemeProviderProps} props - The props from `next-themes`.
 * @returns A JSX element that provides the theme context.
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
