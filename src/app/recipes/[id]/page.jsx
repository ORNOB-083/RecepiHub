import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import RecipeDetailsClient from './RecipeDetailsClient';

const BASE_URL = (process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:8000').replace(/\/$/, '');

async function getRecipe(id) {
    const res = await fetch(`${BASE_URL}/api/recipes/${id}`, {
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
    const recipe = await getRecipe(id);

    if (!recipe) notFound();

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