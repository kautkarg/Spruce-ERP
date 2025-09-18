import { redirect } from 'next/navigation';

/**
 * @file This is the root page of the application. It immediately redirects the user
 * to the main dashboard page, which is the entry point for all application functionality.
 */

export default function Home() {
  // Redirect to the CRM page by default as other sections are locked.
  redirect('/dashboard/crm');
}
