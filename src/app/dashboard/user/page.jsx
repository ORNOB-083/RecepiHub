import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import UserOverviewClient from './UserOverviewClient';

const BASE_URL = (process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:8000').replace(/\/$/, '');

export default async function UserDashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect('/auth/signin');

  let backendUser = null;
  try {
    const res = await fetch(`${BASE_URL}/api/users/me`, {
      headers: { 'user-email': session.user.email },
      cache: 'no-store',
    });
    if (res.ok) backendUser = await res.json();
  } catch (err) {
    console.error('Failed to fetch backend user:', err);
  }

  return <UserOverviewClient user={backendUser || session.user} />;
}