// app/dashboard/user/layout.jsx
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';

export default async function UserLayout({ children }) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect('/auth/login');
  }

  const role = session.user?.role || 'user';

  if (role !== 'user') {
    redirect('/dashboard/admin');
  }

  return children;
}