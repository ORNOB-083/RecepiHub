import { Suspense } from 'react';
import { notFound, redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth'; // Adjust import to your auth setup
import RecipeDetailsClient from './RecipeDetailsClient';

const API_BASE = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:8000/';

async function getRecipe(id) {
    const res = await fetch(`${API_BASE}api/recipes/${id}`, {
        cache: 'no-store',
    });

    if (!res.ok) {
        if (res.status === 404) return null;
        throw new Error('Failed to fetch recipe');
    }

    return res.json();
}

export default async function RecipeDetailsPage({ params }) {
    const { id } = await params;

    // Optional: check authentication (if you want to protect the page)
    // const session = await auth.api.getSession({ headers: await headers() });
    // if (!session) redirect(`/login?redirect=/recipes/${id}`);

    const recipe = await getRecipe(id);
    if (!recipe) notFound();

    // You can also fetch the user's purchase status or favorites list here,
    // but we'll handle it client-side for simplicity.

    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                </div>
            }
        >
            <RecipeDetailsClient recipe={recipe} />
        </Suspense>
    );
}