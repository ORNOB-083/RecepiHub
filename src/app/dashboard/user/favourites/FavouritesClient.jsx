"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useSession } from "@/lib/auth-client";
import toast from "react-hot-toast";
import { Loader2, Heart, Trash2, Eye, Clock, Star } from "lucide-react";

const BASE_URL = (process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:8000').replace(/\/$/, '');

export default function FavouritesClient({ user: initialUser }) {
    const { data: session } = useSession();
    const user = session?.user || initialUser;

    const [favorites, setFavorites] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [removingId, setRemovingId] = useState(null);

    // ── Fetch favorites ──
    const fetchFavorites = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`${BASE_URL}/api/favorites`, {
                headers: { 'user-email': user.email },
            });
            if (res.ok) {
                const data = await res.json();
                // The backend returns favorites with recipe populated
                setFavorites(data || []);
            } else {
                toast.error('Failed to load favorites');
            }
        } catch (err) {
            console.error(err);
            toast.error('Something went wrong');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (user?.email) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            fetchFavorites();
        }
    }, [user]);

    // ── Remove from favorites ──
    const handleRemove = async (recipeId) => {
        setRemovingId(recipeId);
        try {
            const res = await fetch(`${BASE_URL}/api/favorites/${recipeId}`, {
                method: 'DELETE',
                headers: { 'user-email': user.email },
            });
            if (res.ok) {
                toast.success('Removed from favorites');
                // Remove from local state
                setFavorites((prev) => prev.filter((fav) => fav.recipeId !== recipeId));
            } else {
                const data = await res.json();
                toast.error(data.message || 'Failed to remove');
            }
        } catch (err) {
            console.error(err);
            toast.error('Something went wrong');
        } finally {
            setRemovingId(null);
        }
    };

    return (
        <div className="p-6 pt-8 max-w-6xl mx-auto space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Favorite Recipes</h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                    Your collection of saved recipes.
                </p>
            </motion.div>

            {isLoading ? (
                <div className="flex items-center justify-center py-16">
                    <Loader2 className="w-8 h-8 text-[#F5726B] animate-spin" />
                </div>
            ) : favorites.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-[#1a1d24] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                    <Heart className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">
                        You haven&apos;t added any favorites yet.
                    </p>
                    <Link
                        href="/recipes"
                        className="inline-block mt-4 px-6 py-2 rounded-xl bg-[#F5726B] text-white font-semibold text-sm hover:bg-[#e85f58] transition-all"
                    >
                        Browse Recipes
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {favorites.map((favorite, index) => {
                        const recipe = favorite.recipe;
                        if (!recipe) return null; // skip if recipe deleted

                        return (
                            <motion.div
                                key={favorite._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                className="bg-white dark:bg-[#1a1d24] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col"
                            >
                                {/* Image */}
                                <div className="relative h-48 w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
                                    <img
                                        src={recipe.recipeImage || '/recipe-placeholder.jpg'}
                                        alt={recipe.recipeName}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    {recipe.isFeatured && (
                                        <div className="absolute top-3 left-3 px-2 py-1 rounded-full bg-yellow-500 text-white text-xs font-bold shadow-md">
                                            Featured
                                        </div>
                                    )}
                                    {recipe.isPremium && (
                                        <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full bg-purple-600 text-white text-xs font-bold shadow-md">
                                            Premium
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="p-5 flex flex-col flex-1 justify-between space-y-3">
                                    <div>
                                        <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 line-clamp-1">
                                            {recipe.recipeName}
                                        </h3>
                                        <p className="text-xs text-gray-400 mt-1">By {recipe.authorName || 'Anonymous'}</p>
                                        <div className="flex flex-wrap gap-2 mt-2 text-xs">
                                            <span className="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                                                {recipe.category || 'General'}
                                            </span>
                                            <span className="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                                                {recipe.cuisineType || 'Various'}
                                            </span>
                                            <span className="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 flex items-center gap-1">
                                                <Clock className="w-3 h-3" /> {recipe.preparationTime || 30} min
                                            </span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
                                        <div className="flex items-center gap-1 text-sm text-gray-500">
                                            <Star className="w-4 h-4 text-yellow-400" />
                                            <span>{recipe.likesCount || 0} likes</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Link
                                                href={`/recipes/${recipe._id}`}
                                                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                                title="View Details"
                                            >
                                                <Eye className="w-4 h-4 text-gray-500" />
                                            </Link>
                                            <button
                                                onClick={() => handleRemove(recipe._id)}
                                                disabled={removingId === recipe._id}
                                                className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                                                title="Remove from favorites"
                                            >
                                                {removingId === recipe._id ? (
                                                    <Loader2 className="w-4 h-4 animate-spin text-red-500" />
                                                ) : (
                                                    <Trash2 className="w-4 h-4 text-red-500" />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}