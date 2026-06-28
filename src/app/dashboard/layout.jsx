import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import DashboardSidebar from './DashboardSidebar';

const BASE_URL = (process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:8000').replace(/\/$/, '');

export default async function DashboardLayout({ children }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    // If not logged in, redirect or show a message
    return <div className="p-6 text-center text-gray-500">Please log in.</div>;
  }

  // ── Fetch backend user to get `isPremium` ──
  let backendUser = null;
  try {
    const res = await fetch(`${BASE_URL}/api/users/me`, {
      headers: { 'user-email': session.user.email },
      cache: 'no-store', // always fresh
    });
    if (res.ok) backendUser = await res.json();
  } catch (err) {
    console.error('Failed to fetch backend user:', err);
  }

  // Merge: backendUser has isPremium; session.user has auth fields
  const user = backendUser ? { ...session.user, ...backendUser } : session.user;

  return (
    <div className="flex min-h-screen">
      <DashboardSidebar user={user} />
      <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-[#0f1117]">
        {children}
      </main>
    </div>
  );
}