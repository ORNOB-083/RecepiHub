"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import toast from "react-hot-toast";
import {
    Loader2,
    UtensilsCrossed,
    Heart,
    Star,
    Crown,
    Plus,
    BookOpen,
    ShoppingBag,
    ArrowRight,
} from "lucide-react";

const BASE_URL = (process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:8000').replace(/\/$/, '');

export default function UserDashboardClient({ user: initialUser }) {
    const { data: session, status } = useSession();
    const user = session?.user || initialUser;

    const [stats, setStats] = useState({
        totalRecipes: 0,
        totalFavorites: 0,
        totalLikesReceived: 0,
        isPremium: false,
    });
    const [isLoading, setIsLoading] = useState(true);

    // ── If user is missing, show fallback ──
    if (!user) {
        return (
            <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                {status === 'loading' ? (
                    <div className="flex items-center justify-center py-16">
                        <Loader2 className="w-8 h-8 text-[#F5726B] animate-spin" />
                    </div>
                ) : (
                    'Please log in to view your dashboard.'
                )}
            </div>
        );
    }

    // ── Fetch dashboard stats ──
    const fetchStats = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`${BASE_URL}/api/users/me/stats`, {
                headers: { 'user-email': user.email },
            });
            if (res.ok) {
                const data = await res.json();
                setStats(data);
            } else {
                toast.error('Failed to load stats');
            }
        } catch (err) {
            console.error('Error fetching stats:', err);
            toast.error('Something went wrong');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (user?.email) {
            fetchStats();
        } else {
            setIsLoading(false);
        }
    }, [user]);

    // ── Loading state ──
    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-32">
                <Loader2 className="w-8 h-8 text-[#F5726B] animate-spin" />
            </div>
        );
    }

    // ── Stat Cards ──
    const statCards = [
        {
            label: 'Total Recipes',
            value: stats.totalRecipes,
            icon: UtensilsCrossed,
            color: 'text-orange-500',
            bg: 'bg-orange-50 dark:bg-orange-900/20',
            border: 'border-orange-100 dark:border-orange-800',
            href: '/dashboard/user/my-recipes',
        },
        {
            label: 'Total Favorites',
            value: stats.totalFavorites,
            icon: Heart,
            color: 'text-red-500',
            bg: 'bg-red-50 dark:bg-red-900/20',
            border: 'border-red-100 dark:border-red-800',
            href: '/dashboard/user/favourites',
        },
        {
            label: 'Total Likes Received',
            value: stats.totalLikesReceived,
            icon: Star,
            color: 'text-yellow-500',
            bg: 'bg-yellow-50 dark:bg-yellow-900/20',
            border: 'border-yellow-100 dark:border-yellow-800',
            href: '/dashboard/user/my-recipes',
        },
        {
            label: 'Account Status',
            value: stats.isPremium ? 'Premium' : 'Free',
            icon: stats.isPremium ? Crown : 'User',
            color: stats.isPremium ? 'text-purple-500' : 'text-gray-500',
            bg: stats.isPremium ? 'bg-purple-50 dark:bg-purple-900/20' : 'bg-gray-50 dark:bg-gray-800/20',
            border: stats.isPremium ? 'border-purple-100 dark:border-purple-800' : 'border-gray-100 dark:border-gray-800',
            isPremium: stats.isPremium,
        },
    ];

    // ── Quick Actions ──
    const quickActions = [
        {
            label: 'Add Recipe',
            icon: Plus,
            color: 'text-orange-500',
            bg: 'bg-orange-50 dark:bg-orange-900/20',
            href: '/dashboard/user/add-recipe',
            description: 'Share your culinary creation',
        },
        {
            label: 'My Recipes',
            icon: BookOpen,
            color: 'text-blue-500',
            bg: 'bg-blue-50 dark:bg-blue-900/20',
            href: '/dashboard/user/my-recipes',
            description: 'View your recipes',
        },
        {
            label: 'Favorites',
            icon: Heart,
            color: 'text-red-500',
            bg: 'bg-red-50 dark:bg-red-900/20',
            href: '/dashboard/user/favourites',
            description: 'Your saved recipes',
        },
        {
            label: 'Purchased',
            icon: ShoppingBag,
            color: 'text-green-500',
            bg: 'bg-green-50 dark:bg-green-900/20',
            href: '/dashboard/user/purchased',
            description: 'View purchased recipes',
        },
    ];

    return (
        <div className="p-4 sm:p-6 pt-8 max-w-6xl mx-auto space-y-6">
            {/* ── Header ── */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Welcome back, {user?.name || 'User'}!
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                            Here's an overview of your recipe activity.
                        </p>
                    </div>
                    {stats.isPremium && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-yellow-400 to-yellow-600 text-white shadow-md">
                            <Crown className="w-3.5 h-3.5" /> Premium Member
                        </span>
                    )}
                </div>
            </motion.div>

            {/* ── Stats Grid ── */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
            >
                {statCards.map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                        <Link
                            key={i}
                            href={stat.href}
                            className={`bg-white dark:bg-[#1a1d24] rounded-2xl p-6 border ${stat.border} shadow-sm hover:shadow-md transition-all hover:scale-[1.02] group relative overflow-hidden`}
                        >
                            {stat.isPremium && stat.label === 'Account Status' && (
                                <div className="absolute -top-1 -right-1">
                                    <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-bl-2xl flex items-center justify-center shadow-md">
                                        <Crown className="w-4 h-4 text-white" />
                                    </div>
                                </div>
                            )}
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{stat.label}</p>
                                    {stat.label === 'Account Status' ? (
                                        <p className={`text-xl font-bold flex items-center gap-1.5 ${stat.color}`}>
                                            {stat.isPremium && <Crown className="w-4 h-4" />}
                                            {stat.value}
                                        </p>
                                    ) : (
                                        <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                                    )}
                                </div>
                                <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                                    {typeof Icon === 'string' ? (
                                        <span className={`text-2xl ${stat.color}`}>👤</span>
                                    ) : (
                                        <Icon className={`w-6 h-6 ${stat.color}`} />
                                    )}
                                </div>
                            </div>
                            <div className="mt-4 flex items-center gap-1 text-xs text-[#F5726B] opacity-0 group-hover:opacity-100 transition-opacity">
                                View Details <ArrowRight className="w-3 h-3" />
                            </div>
                        </Link>
                    );
                })}
            </motion.div>

            {/* ── Quick Actions ── */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-4"
            >
                {quickActions.map((action, i) => {
                    const Icon = action.icon;
                    return (
                        <Link
                            key={i}
                            href={action.href}
                            className="bg-white dark:bg-[#1a1d24] rounded-2xl p-4 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all text-center hover:border-[#F5726B] group"
                        >
                            <div className={`w-10 h-10 rounded-xl ${action.bg} flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform`}>
                                <Icon className={`w-5 h-5 ${action.color}`} />
                            </div>
                            <p className="text-xs font-medium text-gray-900 dark:text-white">{action.label}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{action.description}</p>
                        </Link>
                    );
                })}
            </motion.div>

            {/* ── Premium Upgrade Banner ── */}
            {!stats.isPremium && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 rounded-2xl p-6 border border-orange-100 dark:border-orange-800/30 shadow-sm"
                >
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 flex items-center justify-center flex-shrink-0">
                                <Crown className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 dark:text-white">Upgrade to Premium</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Get unlimited recipe uploads and a premium badge.
                                </p>
                            </div>
                        </div>
                        <Link
                            href="/dashboard/user/upgrade"
                            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold text-sm hover:shadow-lg transition-all whitespace-nowrap"
                        >
                            Upgrade Now →
                        </Link>
                    </div>
                </motion.div>
            )}
        </div>
    );
}