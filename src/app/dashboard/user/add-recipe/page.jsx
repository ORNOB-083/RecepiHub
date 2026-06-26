import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import AddRecipeClient from './AddRecipeClient';

export default async function AddRecipePage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return <div className="p-6 text-center text-gray-500 dark:text-gray-400">Please log in.</div>;
  }

  // Fetch user's current recipe count to display limit info
  // We'll fetch it on the client, so we just pass the user.
  return <AddRecipeClient user={session.user} />;
}