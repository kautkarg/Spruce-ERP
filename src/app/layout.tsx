/**
 * @file This file defines the root layout for the entire application.
 * It sets up the global font, theme provider, and toast notifications.
 * This component wraps every page, providing a consistent base structure.
 */
import type {Metadata} from 'next';
import './globals.css';
import { Inter } from 'next/font/google';
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from '@/components/theme-provider';

// Initializes the Inter font with the 'latin' subset and sets it as a CSS variable.
const inter = Inter({ subsets: ['latin'], variable: '--font-body' });

// Defines the default metadata for the application, used for SEO and browser tab information.
export const metadata: Metadata = {
  title: 'Spruce ERP',
  description: 'A modern ERP built with Next.js and Firebase.',
};

/**
 * The RootLayout component.
 * This is the main layout that wraps every page in the application.
 * @param {object} props - The component props.
 * @param {React.ReactNode} props.children - The content of the specific page to be rendered within this layout.
 * @returns A JSX element representing the complete application shell.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // The `suppressHydrationWarning` is used here because the `next-themes` library
    // can cause a mismatch between server and client rendered HTML, which is expected.
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-body antialiased`}>
        {/* ThemeProvider handles light/dark mode switching for the application. */}
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          {/* Toaster is the component that displays all pop-up notifications (toasts). */}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
