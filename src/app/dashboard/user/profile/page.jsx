import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import ProfileClient from './ProfileClient';

export default async function ProfilePage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    // Handle unauthorized - redirect or show error
    return <div>Please log in</div>;
  }

  return <ProfileClient user={session.user} />;
}