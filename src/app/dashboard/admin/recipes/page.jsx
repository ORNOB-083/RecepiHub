import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import AdminRecipesClient from './AdminRecipesClient';

export default async function AdminRecipesPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user || session.user.role !== 'admin') {
    return <div className="p-6 text-center text-red-500">Access denied. Admins only.</div>;
  }

  return <AdminRecipesClient user={session.user} />;
}