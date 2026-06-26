"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useSession } from "@/lib/auth-client";
import toast from "react-hot-toast";
import { Loader2, Eye, Clock, ShoppingBag, Calendar } from "lucide-react";

const BASE_URL = (process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:8000').replace(/\/$/, '');

export default function PurchasedClient({ user: initialUser }) {
    const { data: session } = useSession();
    const user = session?.user || initialUser;

    const [purchases, setPurchases] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // ── Fetch purchases ──
    const fetchPurchases = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`${BASE_URL}/api/purchases`, {
                headers: { 'user-email': user.email },
            });
            if (res.ok) {
                const data = await res.json();
                setPurchases(data || []);
            } else {
                toast.error('Failed to load purchases');
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
            fetchPurchases();
        }
    }, [user]);

    // ── Format date ──
    const formatDate = (date) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <div className="p-6 pt-8 max-w-6xl mx-auto space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Purchased Recipes</h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                    All recipes you have purchased.
                </p>
            </motion.div>

            {isLoading ? (
                <div className="flex items-center justify-center py-16">
                    <Loader2 className="w-8 h-8 text-[#F5726B] animate-spin" />
                </div>
            ) : purchases.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-[#1a1d24] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                    <ShoppingBag className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">
                        You haven&apos;t purchased any recipes yet.
                    </p>
                    <Link
                        href="/recipes"
                        className="inline-block mt-4 px-6 py-2 rounded-xl bg-[#F5726B] text-white font-semibold text-sm hover:bg-[#e85f58] transition-all"
                    >
                        Browse Premium Recipes
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {purchases.map((purchase, index) => {
                        const recipe = purchase.recipe;
                        if (!recipe) return null; // skip if recipe was deleted

                        return (
                            <motion.div
                                key={purchase._id}
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
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-green-500 text-white text-xs font-bold shadow-md">
                                        Purchased
                                    </div>
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

                                    {/* Purchase date & actions */}
                                    <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
                                        <div className="flex items-center gap-1 text-xs text-gray-400">
                                            <Calendar className="w-3.5 h-3.5" />
                                            <span>Purchased: {formatDate(purchase.purchasedAt || purchase.createdAt)}</span>
                                        </div>
                                        <Link
                                            href={`/recipes/${recipe._id}`}
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F5726B] text-white text-xs font-semibold hover:bg-[#e85f58] transition-all"
                                        >
                                            <Eye className="w-3.5 h-3.5" /> View
                                        </Link>
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