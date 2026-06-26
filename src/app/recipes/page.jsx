import { Suspense } from 'react';
import RecipesClient from './RecipesClient';

const SERVER_URL = (process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:8000').replace(/\/$/, '');

async function getRecipes(searchParams = {}) {
    const params = new URLSearchParams();

    Object.entries(searchParams).forEach(([key, value]) => {
        if (value) params.set(key, value);
    });

    if (!params.has('page')) params.set('page', '1');
    if (!params.has('limit')) params.set('limit', '9');

    const res = await fetch(`${SERVER_URL}/api/recipes?${params.toString()}`, {
        cache: 'no-store',
    });

    if (!res.ok) {
        throw new Error('Failed to fetch recipes');
    }

    return res.json();
}

export default async function RecipesPage({ searchParams }) {
    const params = await searchParams;
    const data = await getRecipes(params);

    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                </div>
            }
        >
            <RecipesClient initialData={data} initialParams={params} />
        </Suspense>
    );
}