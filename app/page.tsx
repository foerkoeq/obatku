import { redirect } from 'next/navigation';

export default function RootPage() {
  // Redirect to the main dashboard page
  redirect('/dashboard');
} 