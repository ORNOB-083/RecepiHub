'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
    Heart, Star, ChefHat, Crown, ArrowRight,
    Loader2, BookOpen, ShoppingBag, Plus,
} from 'lucide-react';
import { useSession } from '@/lib/auth-client';
import toast from 'react-hot-toast';
import {
    PieChart, Pie, Cell, Tooltip,
    ResponsiveContainer, Legend
} from 'recharts';

const BASE_URL = (process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:8000').replace(/\/$/, '');
const SYNCED_KEY = 'recipehub_user_synced';

async function syncUser(email, name, image) {
    try {
        const res = await fetch(`${BASE_URL}/api/auth/sync`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, name, image: image || 'https://placehold.co/100' }),
        });
        if (res.ok) { localStorage.setItem(SYNCED_KEY, 'true'); return true; }
        return false;
    } catch { return false; }
}

const CHART_COLORS = {
    recipes: '#f97316',
    favorites: '#eab308',
    likes: '#ef4444',
    purchased: '#8b5cf6',
};

export default function UserOverviewClient({ user: serverUser }) {
    const { data: session } = useSession();
    const user = session?.user || serverUser;
    const userEmail = user?.email;

    const [stats, setStats] = useState({
        totalRecipes: 0,
        totalFavorites: 0,
        totalLikesReceived: 0,
        isPremium: false,
    });
    const [recentRecipes, setRecentRecipes] = useState([]);
    const [recentFavorites, setRecentFavorites] = useState([]);
    const [purchases, setPurchases] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // ── Sync user on mount ──
    useEffect(() => {
        if (userEmail) {
            const synced = localStorage.getItem(SYNCED_KEY);
            if (!synced) syncUser(userEmail, user?.name, user?.image);
        }
    }, [userEmail]);

    // ── Fetch dashboard data ──
    useEffect(() => {
        if (!userEmail) return;
        // eslint-disable-next-line react-hooks/immutability
        fetchData();
    }, [userEmail]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const headers = { 'user-email': userEmail };

            const [statsRes, recipesRes, favRes, purchasesRes] = await Promise.all([
                fetch(`${BASE_URL}/api/users/me/stats`, { headers }),
                fetch(`${BASE_URL}/api/recipes?authorEmail=${userEmail}&perPage=3`, { headers }),
                fetch(`${BASE_URL}/api/favorites`, { headers }),
                fetch(`${BASE_URL}/api/purchases`, { headers }),
            ]);

            if (statsRes.ok) {
                const data = await statsRes.json();
                setStats(data);
            }
            if (recipesRes.ok) {
                const data = await recipesRes.json();
                setRecentRecipes(data.recipes || []);
            }
            if (favRes.ok) {
                const data = await favRes.json();
                setRecentFavorites(Array.isArray(data) ? data.slice(0, 3) : []);
            }
            if (purchasesRes.ok) {
                const data = await purchasesRes.json();
                setPurchases(Array.isArray(data) ? data : []);
            }
        } catch (err) {
            console.error('Dashboard fetch error:', err);
            toast.error('Failed to load dashboard');
        } finally {
            setIsLoading(false);
        }
    };

    const pieData = [
        { name: 'My Recipes', value: stats.totalRecipes, color: CHART_COLORS.recipes },
        { name: 'Favorites', value: stats.totalFavorites, color: CHART_COLORS.favorites },
        { name: 'Likes Received', value: stats.totalLikesReceived, color: CHART_COLORS.likes },
        { name: 'Purchased', value: purchases.length, color: CHART_COLORS.purchased },
    ].filter(d => d.value > 0);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full py-32">
                <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 pt-8 max-w-6xl mx-auto space-y-6">

            {/* ── Welcome Banner ── */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 rounded-2xl p-6 text-white"
            >
                <div
                    className="absolute inset-0 opacity-10"
                    style={{ backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`, backgroundSize: '24px 24px' }}
                />
                <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <p className="text-white/70 text-sm font-medium mb-1">Welcome back 👋</p>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            {user?.name || 'User'}
                            {(stats.isPremium || user?.isPremium) && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/20 text-xs font-bold border border-white/30">
                                    <Crown className="w-3 h-3" /> Premium
                                </span>
                            )}
                        </h1>
                        <p className="text-white/60 text-sm mt-1">Here&apos;s your RecipeHub summary</p>
                    </div>
                    <Link
                        href="/dashboard/user/add-recipe"
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl text-white text-sm font-semibold transition-all border border-white/20 whitespace-nowrap"
                    >
                        <Plus className="w-4 h-4" /> Add Recipe
                    </Link>
                </div>
            </motion.div>

            {/* ── Stats Cards ── */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-2 lg:grid-cols-4 gap-4"
            >
                {[
                    {
                        label: 'My Recipes',
                        value: stats.totalRecipes,
                        icon: ChefHat,
                        color: 'text-orange-600 dark:text-orange-400',
                        bg: 'bg-orange-50 dark:bg-orange-900/20',
                        border: 'border-orange-100 dark:border-orange-800',
                        href: '/dashboard/user/my-recipes',
                    },
                    {
                        label: 'Favorites',
                        value: stats.totalFavorites,
                        icon: Star,
                        color: 'text-yellow-600 dark:text-yellow-400',
                        bg: 'bg-yellow-50 dark:bg-yellow-900/20',
                        border: 'border-yellow-100 dark:border-yellow-800',
                        href: '/dashboard/user/favourites',
                    },
                    {
                        label: 'Likes Received',
                        value: stats.totalLikesReceived,
                        icon: Heart,
                        color: 'text-red-600 dark:text-red-400',
                        bg: 'bg-red-50 dark:bg-red-900/20',
                        border: 'border-red-100 dark:border-red-800',
                        href: '/dashboard/user/my-recipes',
                    },
                    {
                        label: 'Purchased',
                        value: purchases.length,
                        icon: ShoppingBag,
                        color: 'text-purple-600 dark:text-purple-400',
                        bg: 'bg-purple-50 dark:bg-purple-900/20',
                        border: 'border-purple-100 dark:border-purple-800',
                        href: '/dashboard/user/purchased',
                    },
                ].map((stat, i) => (
                    <Link key={i} href={stat.href}>
                        <div className={`bg-white dark:bg-[#1a1d24] rounded-2xl p-5 border ${stat.border} shadow-sm hover:shadow-md transition-all cursor-pointer hover:scale-[1.02]`}>
                            <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
                                <stat.icon className={`w-5 h-5 ${stat.color}`} />
                            </div>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">{stat.label}</p>
                            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                        </div>
                    </Link>
                ))}
            </motion.div>

            {/* ── Chart + Recent Recipes ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Pie Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white dark:bg-[#1a1d24] rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm"
                >
                    <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                        Activity Overview
                    </h2>
                    {pieData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={220}>
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={90}
                                    paddingAngle={3}
                                    dataKey="value"
                                >
                                    {pieData.map((entry, i) => (
                                        <Cell key={i} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        background: '#1a1d24',
                                        border: '1px solid #374151',
                                        borderRadius: '12px',
                                        fontSize: '12px',
                                        color: '#fff',
                                    }}
                                />
                                <Legend
                                    iconType="circle"
                                    iconSize={8}
                                    formatter={(value) => (
                                        <span style={{ fontSize: '12px', color: '#9ca3af' }}>{value}</span>
                                    )}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-[220px] gap-2">
                            <ChefHat className="w-10 h-10 text-gray-200 dark:text-gray-700" />
                            <p className="text-sm text-gray-400">No activity yet</p>
                            <Link
                                href="/dashboard/user/add-recipe"
                                className="text-xs text-orange-500 hover:underline"
                            >
                                Add your first recipe →
                            </Link>
                        </div>
                    )}
                </motion.div>

                {/* Recent Recipes */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="bg-white dark:bg-[#1a1d24] rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">My Recent Recipes</h2>
                        <Link
                            href="/dashboard/user/my-recipes"
                            className="text-xs text-orange-500 hover:underline flex items-center gap-1"
                        >
                            View all <ArrowRight className="w-3 h-3" />
                        </Link>
                    </div>

                    {recentRecipes.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 gap-2">
                            <ChefHat className="w-8 h-8 text-gray-300 dark:text-gray-600" />
                            <p className="text-xs text-gray-400">No recipes yet</p>
                            <Link
                                href="/dashboard/user/add-recipe"
                                className="text-xs text-orange-500 hover:underline"
                            >
                                Add your first recipe →
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {recentRecipes.map((recipe, i) => (
                                <Link key={i} href={`/recipes/${recipe._id}`}>
                                    <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-orange-50 dark:hover:bg-orange-900/10 transition-colors">
                                        <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center flex-shrink-0">
                                            <ChefHat className="w-4 h-4 text-orange-500" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                                                {recipe.recipeName}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-0.5 capitalize">
                                                {recipe.category} · {recipe.cuisineType}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-1 text-xs text-red-400">
                                            <Heart className="w-3 h-3 fill-red-400" />
                                            {recipe.likesCount || 0}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </motion.div>
            </div>

            {/* ── Recent Favorites + Purchases ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Recent Favorites */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white dark:bg-[#1a1d24] rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Recent Favorites</h2>
                        <Link
                            href="/dashboard/user/favourites"
                            className="text-xs text-orange-500 hover:underline flex items-center gap-1"
                        >
                            View all <ArrowRight className="w-3 h-3" />
                        </Link>
                    </div>

                    {recentFavorites.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 gap-2">
                            <Star className="w-8 h-8 text-gray-300 dark:text-gray-600" />
                            <p className="text-xs text-gray-400">No favorites yet</p>
                            <Link href="/recipes" className="text-xs text-orange-500 hover:underline">
                                Browse recipes →
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {recentFavorites.map((fav, i) => {
                                const recipe = fav.recipe;
                                return (
                                    <Link key={i} href={`/recipes/${fav.recipeId}`}>
                                        <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-yellow-50 dark:hover:bg-yellow-900/10 transition-colors">
                                            <div className="w-10 h-10 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 flex items-center justify-center flex-shrink-0">
                                                <Star className="w-4 h-4 text-yellow-500" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                                                    {recipe?.recipeName || 'Recipe'}
                                                </p>
                                                <p className="text-xs text-gray-400 mt-0.5 capitalize">
                                                    {recipe?.category || ''} {recipe?.cuisineType ? `· ${recipe.cuisineType}` : ''}
                                                </p>
                                            </div>
                                            <ArrowRight className="w-3 h-3 text-gray-400 flex-shrink-0" />
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </motion.div>

                {/* Recent Purchases */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    className="bg-white dark:bg-[#1a1d24] rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Recent Purchases</h2>
                        <Link
                            href="/dashboard/user/purchased"
                            className="text-xs text-orange-500 hover:underline flex items-center gap-1"
                        >
                            View all <ArrowRight className="w-3 h-3" />
                        </Link>
                    </div>

                    {purchases.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 gap-2">
                            <ShoppingBag className="w-8 h-8 text-gray-300 dark:text-gray-600" />
                            <p className="text-xs text-gray-400">No purchases yet</p>
                            <Link href="/recipes" className="text-xs text-orange-500 hover:underline">
                                Browse premium recipes →
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {purchases.slice(0, 3).map((purchase, i) => {
                                const recipe = purchase.recipe;
                                return (
                                    <Link key={i} href={`/recipes/${purchase.recipeId}`}>
                                        <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-colors">
                                            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center flex-shrink-0">
                                                <ShoppingBag className="w-4 h-4 text-purple-500" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                                                    {recipe?.recipeName || 'Recipe'}
                                                </p>
                                                <p className="text-xs text-gray-400 mt-0.5">
                                                    ৳{recipe?.price || 0} · {new Date(purchase.purchasedAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <span className="text-xs font-semibold px-2 py-1 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400">
                                                Owned
                                            </span>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </motion.div>
            </div>

            {/* ── Premium Upgrade Banner ── */}
            {!stats.isPremium && !user?.isPremium && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="relative overflow-hidden bg-gradient-to-r from-purple-600 to-violet-600 rounded-2xl p-6 text-white"
                >
                    <div
                        className="absolute inset-0 opacity-10"
                        style={{ backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`, backgroundSize: '24px 24px' }}
                    />
                    <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <Crown className="w-5 h-5 text-yellow-300" />
                                <p className="text-white/80 text-sm font-medium">Upgrade to Premium</p>
                            </div>
                            <h2 className="text-xl font-bold">Unlock Unlimited Recipes</h2>
                            <p className="text-white/60 text-sm mt-1">
                                Free users can only add 2 recipes. Go premium for unlimited uploads + badge.
                            </p>
                        </div>
                        <Link
                            href="/dashboard/user/upgrade"
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-purple-600 hover:bg-white/90 rounded-xl text-sm font-bold transition-all whitespace-nowrap shadow-lg"
                        >
                            <Crown className="w-4 h-4" /> Get Premium — ৳999
                        </Link>
                    </div>
                </motion.div>
            )}
        </div>
    );
}