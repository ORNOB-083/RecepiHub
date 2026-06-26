import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import AdminProfileClient from './AdminProfileClient';

export default async function AdminProfilePage() {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
        return <div className="p-6 text-center text-gray-500 dark:text-gray-400">Please log in.</div>;
    }

    return <AdminProfileClient user={session.user} />;
}