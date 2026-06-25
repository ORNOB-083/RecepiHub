'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import {
    Search,
    Clock,
    Star,
    Flame,
    Utensils,
    Shield,
    X,
    ChefHat,
    Heart,
    Sparkles,
    Flag,
    ShoppingCart,
    Crown,
    Loader2,
} from 'lucide-react';
import { useSession, authClient } from '@/lib/auth-client';
import toast from 'react-hot-toast';

// ---------------------- CONFIG ----------------------
const CATEGORY_CONFIG = {
    appetizer: {
        icon: Utensils,
        color: 'from-amber-500 to-orange-500',
        bg: 'bg-amber-50 dark:bg-amber-900/20',
        text: 'text-amber-600 dark:text-amber-400',
    },
    'main course': {
        icon: ChefHat,
        color: 'from-emerald-500 to-teal-500',
        bg: 'bg-emerald-50 dark:bg-emerald-900/20',
        text: 'text-emerald-600 dark:text-emerald-400',
    },
    dessert: {
        icon: Sparkles,
        color: 'from-pink-500 to-rose-500',
        bg: 'bg-pink-50 dark:bg-pink-900/20',
        text: 'text-pink-600 dark:text-pink-400',
    },
    soup: {
        icon: Flame,
        color: 'from-red-500 to-orange-500',
        bg: 'bg-red-50 dark:bg-red-900/20',
        text: 'text-red-600 dark:text-red-400',
    },
    salad: {
        icon: Utensils,
        color: 'from-green-500 to-emerald-500',
        bg: 'bg-green-50 dark:bg-green-900/20',
        text: 'text-green-600 dark:text-green-400',
    },
    beverage: {
        icon: Sparkles,
        color: 'from-cyan-500 to-blue-500',
        bg: 'bg-cyan-50 dark:bg-cyan-900/20',
        text: 'text-cyan-600 dark:text-cyan-400',
    },
};

const DEFAULT_CONFIG = {
    icon: Utensils,
    color: 'from-gray-500 to-gray-600',
    bg: 'bg-gray-50 dark:bg-gray-800/20',
    text: 'text-gray-600 dark:text-gray-400',
};

const REPORT_REASONS = ['Spam', 'Offensive Content', 'Copyright Issue', 'Other'];

const API_BASE = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:8000/';

// ---------------------- MODALS ----------------------
function PurchaseModal({ recipe, onClose }) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handlePurchase = async () => {
        setIsLoading(true);
        try {
            const session = await authClient.getSession();
            const token = session?.data?.session?.token;
            if (!token) {
                toast.error('Please sign in to purchase');
                return;
            }

            const res = await fetch(`${API_BASE}api/payments/purchase-recipe`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ recipeId: recipe._id }),
            });

            const data = await res.json();
            if (data.url) {
                window.location.href = data.url; // redirect to Stripe Checkout
            } else {
                toast.error(data.message || 'Payment initiation failed');
            }
        } catch (err) {
            console.error(err);
            toast.error('Something went wrong');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            onClick={onClose}
        >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.2 }}
                className="relative z-10 w-full max-w-md bg-white dark:bg-[#1a1d24] rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="relative h-32 bg-gradient-to-r from-orange-500 to-amber-600 p-5 flex flex-col justify-end">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                    <h3 className="text-white font-bold text-lg">{recipe.recipeName}</h3>
                    <p className="text-white/80 text-xs">Premium Recipe</p>
                </div>

                <div className="p-5 space-y-4">
                    <div className="space-y-2 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700">
                        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                            <span>Recipe Price</span>
                            <span className="font-semibold text-gray-900 dark:text-gray-100">
                                ${(recipe.price || 4.99).toFixed(2)}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                            <span>Platform fee (3%)</span>
                            <span>${((recipe.price || 4.99) * 0.03).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-gray-900 dark:text-gray-100 pt-2 border-t border-gray-200 dark:border-gray-700">
                            <span>Total</span>
                            <span className="text-orange-600 dark:text-orange-400">
                                ${((recipe.price || 4.99) * 1.03).toFixed(2)}
                            </span>
                        </div>
                    </div>

                    <button
                        onClick={handlePurchase}
                        disabled={isLoading}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold text-sm shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <>Purchase Now — ${((recipe.price || 4.99) * 1.03).toFixed(2)}</>
                        )}
                    </button>

                    <p className="text-center text-xs text-gray-400 flex items-center justify-center gap-1">
                        <Shield className="w-3 h-3" /> Secure payment via Stripe
                    </p>
                </div>
            </motion.div>
        </motion.div>
    );
}

function ReportModal({ recipeId, onClose }) {
    const [reason, setReason] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleReport = async () => {
        if (!reason) {
            toast.error('Please select a reason');
            return;
        }

        setIsLoading(true);
        try {
            const session = await authClient.getSession();
            const token = session?.data?.session?.token;
            if (!token) {
                toast.error('Please sign in to report');
                return;
            }

            const res = await fetch(`${API_BASE}api/reports`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ recipeId, reason }),
            });

            const data = await res.json();
            if (data.success) {
                toast.success('Report submitted successfully');
                onClose();
            } else {
                toast.error(data.message || 'Failed to submit report');
            }
        } catch (err) {
            console.error(err);
            toast.error('Something went wrong');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            onClick={onClose}
        >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative z-10 w-full max-w-md bg-white dark:bg-[#1a1d24] rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-5 space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                            Report Recipe
                        </h3>
                        <button
                            onClick={onClose}
                            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>

                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Why are you reporting this recipe?
                    </p>

                    <div className="space-y-2">
                        {REPORT_REASONS.map((r) => (
                            <label
                                key={r}
                                className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-700 cursor-pointer transition-colors"
                            >
                                <input
                                    type="radio"
                                    name="reason"
                                    value={r}
                                    checked={reason === r}
                                    onChange={(e) => setReason(e.target.value)}
                                    className="w-4 h-4 text-orange-500 focus:ring-orange-500"
                                />
                                <span className="text-sm text-gray-700 dark:text-gray-300">{r}</span>
                            </label>
                        ))}
                    </div>

                    <button
                        onClick={handleReport}
                        disabled={isLoading || !reason}
                        className="w-full py-3 rounded-xl bg-red-500 text-white font-semibold text-sm hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                    >
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit Report'}
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}

// ---------------------- MAIN CLIENT COMPONENT ----------------------
export default function RecipesClient({ initialData, initialParams = {} }) {
    const router = useRouter();
    const searchParams = useSearchParams();

    // State
    const [recipes, setRecipes] = useState(initialData?.recipes || []);
    const [total, setTotal] = useState(initialData?.pagination?.total || 0);
    const [isLoading, setIsLoading] = useState(false);

    // Filters
    const [search, setSearch] = useState(initialParams?.search || '');
    const [selectedCategory, setSelectedCategory] = useState(
        initialParams?.category || 'all'
    );
    const [sortBy, setSortBy] = useState(initialParams?.sortBy || 'createdAt');
    const [sortOrder, setSortOrder] = useState(initialParams?.sortOrder || 'desc');
    const [page, setPage] = useState(parseInt(initialParams?.page) || 1);
    const perPage = 9;

    // Modal states
    const [purchaseRecipe, setPurchaseRecipe] = useState(null);
    const [reportRecipeId, setReportRecipeId] = useState(null);

    // Auth
    const { data: session } = useSession();
    const user = session?.user;

    // Favorited IDs (local cache)
    const [favoritedIds, setFavoritedIds] = useState([]);

    // Categories from recipes
    const categories = ['all', ...new Set(recipes.map((r) => r.category).filter(Boolean))];

    // Fetch recipes with current filters
    const fetchRecipes = useCallback(async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams();
            if (search) params.set('search', search);
            if (selectedCategory !== 'all') params.set('category', selectedCategory);
            if (sortBy !== 'createdAt') params.set('sortBy', sortBy);
            if (sortOrder !== 'desc') params.set('sortOrder', sortOrder);
            params.set('page', page);
            params.set('limit', perPage);

            const res = await fetch(`${API_BASE}api/recipes?${params.toString()}`);
            const data = await res.json();
            setRecipes(data.recipes || []);
            setTotal(data.pagination?.total || 0);
        } catch (err) {
            console.error(err);
            toast.error('Failed to fetch recipes');
        } finally {
            setIsLoading(false);
        }
    }, [search, selectedCategory, sortBy, sortOrder, page]);

    // Fetch on filter change
    useEffect(() => {
        fetchRecipes();
    }, [fetchRecipes]);

    // Fetch user's favorites on mount
    useEffect(() => {
        if (user) {
            const fetchFavorites = async () => {
                try {
                    const token = session?.session?.token;
                    const res = await fetch(`${API_BASE}api/favorites`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    const data = await res.json();
                    if (Array.isArray(data)) {
                        setFavoritedIds(data.map((f) => f.recipeId));
                    }
                } catch (err) {
                    console.error('Failed to fetch favorites', err);
                }
            };
            fetchFavorites();
        }
    }, [user, session]);

    // Update URL with filters (optional)
    const updateUrl = (params) => {
        const query = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value && value !== 'all' && value !== 'createdAt' && value !== 'desc') {
                query.set(key, value);
            }
        });
        router.push(`/recipes?${query.toString()}`, { scroll: false });
    };

    // Handlers
    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
        updateUrl({ search, category: selectedCategory, sortBy, sortOrder, page: 1 });
    };

    const handleCategoryChange = (cat) => {
        setSelectedCategory(cat);
        setPage(1);
        updateUrl({ search, category: cat, sortBy, sortOrder, page: 1 });
    };

    const handleSortChange = (e) => {
        const value = e.target.value;
        const [newSortBy, newSortOrder] = value.split('_');
        setSortBy(newSortBy);
        setSortOrder(newSortOrder);
        setPage(1);
        updateUrl({
            search,
            category: selectedCategory,
            sortBy: newSortBy,
            sortOrder: newSortOrder,
            page: 1,
        });
    };

    const handlePageChange = (newPage) => {
        setPage(newPage);
        updateUrl({
            search,
            category: selectedCategory,
            sortBy,
            sortOrder,
            page: newPage,
        });
    };

    // Like / Unlike
    const handleLike = async (recipeId) => {
        if (!user) {
            toast.error('Please sign in to like');
            return;
        }
        try {
            const token = session?.session?.token;
            const res = await fetch(`${API_BASE}api/recipes/${recipeId}/like`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await res.json();
            if (data.success) {
                // Optimistically update UI
                setRecipes((prev) =>
                    prev.map((r) =>
                        r._id === recipeId
                            ? {
                                ...r,
                                likesCount: data.likesCount,
                                likedBy: data.liked
                                    ? [...(r.likedBy || []), user.id]
                                    : (r.likedBy || []).filter((id) => id !== user.id),
                            }
                            : r
                    )
                );
                toast.success(data.liked ? 'Liked!' : 'Unliked');
            } else {
                toast.error(data.message || 'Failed to like');
            }
        } catch (err) {
            console.error(err);
            toast.error('Something went wrong');
        }
    };

    // Favorite / Unfavorite
    const handleFavorite = async (recipeId, isFavorited) => {
        if (!user) {
            toast.error('Please sign in to favorite');
            return;
        }
        try {
            const token = session?.session?.token;
            const url = `${API_BASE}api/favorites${isFavorited ? `/${recipeId}` : ''}`;
            const method = isFavorited ? 'DELETE' : 'POST';
            const body = isFavorited ? undefined : JSON.stringify({ recipeId });

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body,
            });
            const data = await res.json();
            if (data.success) {
                // Update local favorites list
                if (isFavorited) {
                    setFavoritedIds((prev) => prev.filter((id) => id !== recipeId));
                } else {
                    setFavoritedIds((prev) => [...prev, recipeId]);
                }
                toast.success(isFavorited ? 'Removed from favorites' : 'Added to favorites');
            } else {
                toast.error(data.message || 'Failed to update favorites');
            }
        } catch (err) {
            console.error(err);
            toast.error('Something went wrong');
        }
    };

    const totalPages = Math.ceil(total / perPage);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0f1117] pt-24 pb-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div className="text-center">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
                        Explore Recipes
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">
                        Discover delicious recipes from our community
                    </p>
                </div>

                {/* Search & Filters */}
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white dark:bg-[#1a1d24] p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                    <form
                        onSubmit={handleSearch}
                        className="relative w-full md:max-w-sm"
                    >
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search recipes..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:border-orange-500 transition-all"
                        />
                    </form>

                    <div className="flex flex-wrap gap-2 items-center">
                        <select
                            value={`${sortBy}_${sortOrder}`}
                            onChange={handleSortChange}
                            className="px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500/40"
                        >
                            <option value="createdAt_desc">Newest</option>
                            <option value="createdAt_asc">Oldest</option>
                            <option value="likesCount_desc">Most Liked</option>
                            <option value="likesCount_asc">Least Liked</option>
                        </select>
                    </div>
                </div>

                {/* Category pills */}
                <div className="flex flex-wrap gap-2">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => handleCategoryChange(cat)}
                            className={`px-4 py-2 rounded-xl text-xs font-semibold capitalize transition-all ${selectedCategory === cat
                                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20'
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Results count */}
                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                    <span>
                        {isLoading ? (
                            'Loading...'
                        ) : (
                            <>
                                Showing{' '}
                                <span className="font-semibold text-gray-900 dark:text-gray-100">
                                    {recipes.length}
                                </span>{' '}
                                of{' '}
                                <span className="font-semibold text-gray-900 dark:text-gray-100">
                                    {total}
                                </span>{' '}
                                recipes
                            </>
                        )}
                    </span>
                </div>

                {/* Grid */}
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <div
                                key={i}
                                className="bg-white dark:bg-[#1a1d24] rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 animate-pulse"
                            >
                                <div className="h-48 bg-gray-200 dark:bg-gray-700" />
                                <div className="p-5 space-y-3">
                                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : recipes.length === 0 ? (
                    <div className="text-center py-20 bg-white dark:bg-[#1a1d24] rounded-2xl border border-gray-100 dark:border-gray-800">
                        <p className="text-gray-400">
                            No recipes found. Try adjusting your filters.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {recipes.map((recipe, index) => {
                            const config =
                                CATEGORY_CONFIG[recipe.category?.toLowerCase()] ||
                                DEFAULT_CONFIG;
                            const ModeIcon = config.icon;
                            const isFavorited = favoritedIds.includes(recipe._id);

                            return (
                                <motion.div
                                    key={recipe._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="bg-white dark:bg-[#1a1d24] rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all group flex flex-col h-full"
                                >
                                    {/* Image */}
                                    <div className="relative h-48 w-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                                        <Image
                                            src={recipe.recipeImage || '/recipe-placeholder.jpg'}
                                            alt={recipe.recipeName}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                                        {/* Badges */}
                                        <div
                                            className={`absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full ${config.bg} border border-white/20 backdrop-blur-md`}
                                        >
                                            <ModeIcon className={`w-3 h-3 ${config.text}`} />
                                            <span
                                                className={`text-[10px] font-bold uppercase tracking-wider ${config.text}`}
                                            >
                                                {recipe.category || 'General'}
                                            </span>
                                        </div>

                                        {recipe.isFeatured && (
                                            <div className="absolute top-3 left-3 px-2 py-1 rounded-full bg-yellow-500 text-white text-xs font-bold shadow-md">
                                                Featured
                                            </div>
                                        )}

                                        {recipe.isPremium && (
                                            <div className="absolute bottom-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full bg-purple-600 text-white text-xs font-bold shadow-md">
                                                <Crown className="w-3 h-3" />
                                                Premium
                                            </div>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                                        <div>
                                            <Link
                                                href={`/recipes/${recipe._id}`}
                                                className="block"
                                            >
                                                <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 line-clamp-1 hover:text-orange-500 transition-colors">
                                                    {recipe.recipeName}
                                                </h3>
                                            </Link>
                                            <p className="text-xs text-gray-400 mt-1">
                                                By {recipe.authorName || 'Anonymous'}
                                            </p>

                                            <div className="flex flex-wrap gap-2 mt-2 text-xs">
                                                <span className="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                                                    {recipe.cuisineType || 'Various'}
                                                </span>
                                                <span className="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                                                    {recipe.difficultyLevel || 'Medium'}
                                                </span>
                                                <span className="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />{' '}
                                                    {recipe.preparationTime || 30} min
                                                </span>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
                                            <div className="flex items-center gap-1 text-sm text-gray-500">
                                                <Heart
                                                    className={`w-4 h-4 ${recipe.likesCount > 0
                                                            ? 'fill-red-500 text-red-500'
                                                            : ''
                                                        }`}
                                                />
                                                <span>{recipe.likesCount || 0}</span>
                                            </div>

                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => handleLike(recipe._id)}
                                                    className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                                    title="Like"
                                                >
                                                    <Heart className="w-4 h-4 text-gray-500 hover:text-red-500" />
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handleFavorite(recipe._id, isFavorited)
                                                    }
                                                    className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                                    title={
                                                        isFavorited
                                                            ? 'Remove from favorites'
                                                            : 'Add to favorites'
                                                    }
                                                >
                                                    <Star
                                                        className={`w-4 h-4 ${isFavorited
                                                                ? 'fill-yellow-400 text-yellow-400'
                                                                : 'text-gray-500'
                                                            }`}
                                                    />
                                                </button>
                                                <button
                                                    onClick={() => setReportRecipeId(recipe._id)}
                                                    className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                                    title="Report"
                                                >
                                                    <Flag className="w-4 h-4 text-gray-500 hover:text-red-500" />
                                                </button>
                                                {recipe.isPremium && (
                                                    <button
                                                        onClick={() => setPurchaseRecipe(recipe)}
                                                        className="p-1.5 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:shadow-md transition-all"
                                                        title="Purchase"
                                                    >
                                                        <ShoppingCart className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        <Link href={`/recipes/${recipe._id}`} className="w-full">
                                            <button className="w-full py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold text-sm hover:shadow-lg transition-all">
                                                View Details
                                            </button>
                                        </Link>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-8">
                        <button
                            onClick={() => handlePageChange(page - 1)}
                            disabled={page === 1}
                            className="px-4 py-2 rounded-xl bg-white dark:bg-[#1a1d24] border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-400 hover:border-orange-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                        >
                            Previous
                        </button>

                        {[...Array(totalPages)].map((_, i) => (
                            <button
                                key={i + 1}
                                onClick={() => handlePageChange(i + 1)}
                                className={`w-10 h-10 rounded-xl text-sm font-semibold transition-all ${page === i + 1
                                        ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/25'
                                        : 'bg-white dark:bg-[#1a1d24] border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-orange-300'
                                    }`}
                            >
                                {i + 1}
                            </button>
                        ))}

                        <button
                            onClick={() => handlePageChange(page + 1)}
                            disabled={page === totalPages}
                            className="px-4 py-2 rounded-xl bg-white dark:bg-[#1a1d24] border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-400 hover:border-orange-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>

            {/* Modals */}
            <AnimatePresence>
                {purchaseRecipe && (
                    <PurchaseModal
                        recipe={purchaseRecipe}
                        onClose={() => setPurchaseRecipe(null)}
                    />
                )}
                {reportRecipeId && (
                    <ReportModal
                        recipeId={reportRecipeId}
                        onClose={() => setReportRecipeId(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}