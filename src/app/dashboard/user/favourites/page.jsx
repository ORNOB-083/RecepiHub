import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import FavouritesClient from './FavouritesClient';

export default async function FavouritesPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return <div className="p-6 text-center text-gray-500 dark:text-gray-400">Please log in.</div>;
  }

  return <FavouritesClient user={session.user} />;
}