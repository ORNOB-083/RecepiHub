import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';

export default async function UserLayout({ children }) {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session) redirect('/auth/login'); // adjust to your login route

  const role = session.user?.role || 'user';

  // If the user is not a regular user, redirect (admin should go to admin dashboard)
  if (role !== 'user') {
    redirect('/dashboard/admin');
  }

  // You can optionally render the sidebar here, or rely on the global dashboard layout
  return children;
}