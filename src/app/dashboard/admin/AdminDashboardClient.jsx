"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import toast from "react-hot-toast";
import {
    Loader2,
    Users,
    UtensilsCrossed,
    Crown,
    AlertTriangle,
    ArrowRight,
    UserPlus,
    FileText,
    Settings,
    Eye,
    Clock,
    CheckCircle,
    XCircle,
    BarChart3,
    TrendingUp,
} from "lucide-react";
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
    Legend,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
} from "recharts";

const BASE_URL = (process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:8000').replace(/\/$/, '');

const CHART_COLORS = {
    appetizer: '#f97316',
    'main course': '#8b5cf6',
    dessert: '#ec4899',
    soup: '#06b6d4',
    salad: '#22c55e',
    beverage: '#3b82f6',
    other: '#6b7280',
};

const STATUS_COLORS = {
    approved: '#22c55e',
    pending: '#eab308',
    rejected: '#ef4444',
};

export default function AdminDashboardClient({ user: initialUser }) {
    const { data: session } = useSession();
    const adminUser = session?.user || initialUser;

    const [stats, setStats] = useState({
        totalUsers: 0,
        totalRecipes: 0,
        totalPremium: 0,
        totalReports: 0,
    });
    const [recentRecipes, setRecentRecipes] = useState([]);
    const [recentReports, setRecentReports] = useState([]);
    const [recipesByCategory, setRecipesByCategory] = useState([]);
    const [statusData, setStatusData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // ── Fetch dashboard data ──
    const fetchDashboardData = async () => {
        setIsLoading(true);
        try {
            const headers = { 'user-email': adminUser.email };

            // Fetch stats
            const statsRes = await fetch(`${BASE_URL}/api/admin/stats`, { headers });
            if (statsRes.ok) {
                const data = await statsRes.json();
                setStats(data);
            }

            // Fetch recent recipes
            const recipesRes = await fetch(`${BASE_URL}/api/admin/recipes?page=1&perPage=5`, { headers });
            if (recipesRes.ok) {
                const data = await recipesRes.json();
                setRecentRecipes(data.recipes || []);
            }

            // Fetch recent reports
            const reportsRes = await fetch(`${BASE_URL}/api/reports?perPage=5`, { headers });
            if (reportsRes.ok) {
                const data = await reportsRes.json();
                setRecentReports(data.reports || []);
            }

            // Fetch all recipes for charts (limited for performance)
            const allRecipesRes = await fetch(`${BASE_URL}/api/admin/recipes?perPage=100`, { headers });
            if (allRecipesRes.ok) {
                const data = await allRecipesRes.json();
                const recipes = data.recipes || [];

                // Category distribution
                const categoryMap = {};
                recipes.forEach(r => {
                    const cat = r.category || 'Other';
                    categoryMap[cat] = (categoryMap[cat] || 0) + 1;
                });
                const categoryData = Object.entries(categoryMap)
                    .map(([name, value]) => ({
                        name,
                        value,
                        color: CHART_COLORS[name.toLowerCase()] || CHART_COLORS.other,
                    }))
                    .sort((a, b) => b.value - a.value);

                setRecipesByCategory(categoryData);

                // Status distribution
                const statusMap = {};
                recipes.forEach(r => {
                    const status = r.status || 'pending';
                    statusMap[status] = (statusMap[status] || 0) + 1;
                });
                const statusChartData = Object.entries(statusMap)
                    .map(([name, value]) => ({
                        name: name.charAt(0).toUpperCase() + name.slice(1),
                        value,
                        color: STATUS_COLORS[name] || '#6b7280',
                    }));
                setStatusData(statusChartData);
            }
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
            toast.error('Failed to load dashboard');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchDashboardData();
    }, []);

    // ── Format date ──
    const formatDate = (date) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    // ── Time ago ──
    const timeAgo = (date) => {
        if (!date) return 'N/A';
        // eslint-disable-next-line react-hooks/purity
        const diff = Date.now() - new Date(date).getTime();
        const mins = Math.floor(diff / 60000);
        const hours = Math.floor(mins / 60);
        const days = Math.floor(hours / 24);
        if (days > 0) return `${days}d ago`;
        if (hours > 0) return `${hours}h ago`;
        if (mins > 0) return `${mins}m ago`;
        return 'Just now';
    };

    const statusBadge = (status) => {
        const configs = {
            approved: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
            pending: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
            rejected: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
        };
        return configs[status] || configs.pending;
    };

    const statCards = [
        {
            label: 'Total Users',
            value: stats.totalUsers,
            icon: Users,
            color: 'text-blue-500',
            bg: 'bg-blue-50 dark:bg-blue-900/20',
            border: 'border-blue-100 dark:border-blue-800',
            href: '/dashboard/admin/users',
        },
        {
            label: 'Total Recipes',
            value: stats.totalRecipes,
            icon: UtensilsCrossed,
            color: 'text-orange-500',
            bg: 'bg-orange-50 dark:bg-orange-900/20',
            border: 'border-orange-100 dark:border-orange-800',
            href: '/dashboard/admin/recipes',
        },
        {
            label: 'Premium Members',
            value: stats.totalPremium,
            icon: Crown,
            color: 'text-yellow-500',
            bg: 'bg-yellow-50 dark:bg-yellow-900/20',
            border: 'border-yellow-100 dark:border-yellow-800',
            href: '/dashboard/admin/users?role=premium',
        },
        {
            label: 'Pending Reports',
            value: stats.totalReports,
            icon: AlertTriangle,
            color: 'text-red-500',
            bg: 'bg-red-50 dark:bg-red-900/20',
            border: 'border-red-100 dark:border-red-800',
            href: '/dashboard/admin/reports',
        },
    ];

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full py-32">
                <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 pt-8 max-w-7xl mx-auto space-y-6">

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
                        <p className="text-white/70 text-sm font-medium mb-1">Admin Dashboard</p>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            Welcome back, {adminUser?.name?.split(' ')[0] || 'Admin'}!
                        </h1>
                        <p className="text-white/60 text-sm mt-1">Here&apos;s your platform overview</p>
                    </div>
                    <Link
                        href="/dashboard/admin/recipes"
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl text-white text-sm font-semibold transition-all border border-white/20 whitespace-nowrap"
                    >
                        <FileText className="w-4 h-4" /> Manage Recipes
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
                {statCards.map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                        <Link key={i} href={stat.href}>
                            <div className={`bg-white dark:bg-[#1a1d24] rounded-2xl p-5 border ${stat.border} shadow-sm hover:shadow-md transition-all cursor-pointer hover:scale-[1.02]`}>
                                <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
                                    <Icon className={`w-5 h-5 ${stat.color}`} />
                                </div>
                                <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">{stat.label}</p>
                                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                            </div>
                        </Link>
                    );
                })}
            </motion.div>

            {/* ── Charts ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Category Distribution */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white dark:bg-[#1a1d24] rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm"
                >
                    <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                        Recipes by Category
                    </h2>
                    {recipesByCategory.length > 0 ? (
                        <ResponsiveContainer width="100%" height={220}>
                            <PieChart>
                                <Pie
                                    data={recipesByCategory}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={55}
                                    outerRadius={85}
                                    paddingAngle={2}
                                    dataKey="value"
                                >
                                    {recipesByCategory.map((entry, i) => (
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
                                        <span style={{ fontSize: '11px', color: '#9ca3af' }}>{value}</span>
                                    )}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-[220px] text-gray-400 text-sm">
                            No recipe data available
                        </div>
                    )}
                </motion.div>

                {/* Status Distribution */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="bg-white dark:bg-[#1a1d24] rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm"
                >
                    <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                        Recipe Status
                    </h2>
                    {statusData.length > 0 ? (
                        <div className="space-y-4 mt-2">
                            {statusData.map((item, i) => (
                                <div key={i}>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
                                            {item.name === 'Approved' && <CheckCircle className="w-3.5 h-3.5 text-green-500" />}
                                            {item.name === 'Pending' && <Clock className="w-3.5 h-3.5 text-yellow-500" />}
                                            {item.name === 'Rejected' && <XCircle className="w-3.5 h-3.5 text-red-500" />}
                                            {item.name}
                                        </span>
                                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{item.value}</span>
                                    </div>
                                    <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(item.value / statusData.reduce((sum, d) => sum + d.value, 0)) * 100}%` }}
                                            transition={{ delay: 0.3 + i * 0.1, duration: 0.8, ease: 'easeOut' }}
                                            className="h-full rounded-full"
                                            style={{ backgroundColor: item.color }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-[180px] text-gray-400 text-sm">
                            No recipe data available
                        </div>
                    )}
                </motion.div>
            </div>

            {/* ── Recent Activity ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Recent Recipes */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white dark:bg-[#1a1d24] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden"
                >
                    <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <UtensilsCrossed className="w-4 h-4 text-orange-500" />
                            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Recent Recipes</h2>
                        </div>
                        <Link
                            href="/dashboard/admin/recipes"
                            className="text-xs text-orange-500 hover:underline flex items-center gap-1"
                        >
                            View all <ArrowRight className="w-3 h-3" />
                        </Link>
                    </div>
                    <div className="divide-y divide-gray-100 dark:divide-gray-800">
                        {recentRecipes.length === 0 ? (
                            <div className="px-5 py-8 text-center text-gray-400 dark:text-gray-500 text-sm">
                                No recipes added yet.
                            </div>
                        ) : (
                            recentRecipes.map((recipe) => (
                                <div key={recipe._id} className="px-5 py-3 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-zinc-900/30 transition-colors">
                                    <img
                                        src={recipe.recipeImage || '/recipe-placeholder.jpg'}
                                        alt={recipe.recipeName}
                                        className="w-10 h-10 rounded-lg object-cover border border-gray-100 dark:border-gray-800 flex-shrink-0"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-gray-900 dark:text-white truncate text-sm">
                                            {recipe.recipeName}
                                        </p>
                                        <div className="flex items-center gap-2 text-xs text-gray-400">
                                            <span>By {recipe.authorName || 'Anonymous'}</span>
                                            <span>•</span>
                                            <span>{timeAgo(recipe.createdAt)}</span>
                                        </div>
                                    </div>
                                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusBadge(recipe.status)}`}>
                                        {recipe.status || 'pending'}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </motion.div>

                {/* Recent Reports */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    className="bg-white dark:bg-[#1a1d24] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden"
                >
                    <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-red-500" />
                            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Recent Reports</h2>
                        </div>
                        <Link
                            href="/dashboard/admin/reports"
                            className="text-xs text-orange-500 hover:underline flex items-center gap-1"
                        >
                            View all <ArrowRight className="w-3 h-3" />
                        </Link>
                    </div>
                    <div className="divide-y divide-gray-100 dark:divide-gray-800">
                        {recentReports.length === 0 ? (
                            <div className="px-5 py-8 text-center text-gray-400 dark:text-gray-500 text-sm">
                                No reports found. 🎉
                            </div>
                        ) : (
                            recentReports.map((report) => (
                                <div key={report._id} className="px-5 py-3 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-zinc-900/30 transition-colors">
                                    <div className="w-10 h-10 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center flex-shrink-0">
                                        <AlertTriangle className="w-4 h-4 text-red-500" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className="font-medium text-gray-900 dark:text-white truncate text-sm">
                                                {report.recipe?.recipeName || 'Unknown Recipe'}
                                            </p>
                                            <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">
                                                {report.reason}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-gray-400">
                                            <span>Reported by {report.reporterEmail}</span>
                                            <span>•</span>
                                            <span>{timeAgo(report.createdAt)}</span>
                                        </div>
                                    </div>
                                    {report.status === 'pending' ? (
                                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400">
                                            Pending
                                        </span>
                                    ) : (
                                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                                            {report.status}
                                        </span>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </motion.div>
            </div>

            {/* ── Quick Actions ── */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-4"
            >
                <Link
                    href="/dashboard/admin/recipes"
                    className="bg-white dark:bg-[#1a1d24] rounded-2xl p-4 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all text-center hover:border-orange-500 group"
                >
                    <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                        <UtensilsCrossed className="w-5 h-5 text-orange-500" />
                    </div>
                    <p className="text-xs font-medium text-gray-900 dark:text-white">Manage Recipes</p>
                    <p className="text-xs text-gray-400 mt-0.5">{stats.totalRecipes} total</p>
                </Link>

                <Link
                    href="/dashboard/admin/users"
                    className="bg-white dark:bg-[#1a1d24] rounded-2xl p-4 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all text-center hover:border-orange-500 group"
                >
                    <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                        <Users className="w-5 h-5 text-blue-500" />
                    </div>
                    <p className="text-xs font-medium text-gray-900 dark:text-white">Manage Users</p>
                    <p className="text-xs text-gray-400 mt-0.5">{stats.totalUsers} total</p>
                </Link>

                <Link
                    href="/dashboard/admin/reports"
                    className="bg-white dark:bg-[#1a1d24] rounded-2xl p-4 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all text-center hover:border-orange-500 group"
                >
                    <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                    </div>
                    <p className="text-xs font-medium text-gray-900 dark:text-white">Review Reports</p>
                    {stats.totalReports > 0 && (
                        <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                            {stats.totalReports} pending
                        </span>
                    )}
                </Link>

                <Link
                    href="/dashboard/admin"
                    className="bg-white dark:bg-[#1a1d24] rounded-2xl p-4 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all text-center hover:border-orange-500 group"
                >
                    <div className="w-10 h-10 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                        <Crown className="w-5 h-5 text-yellow-500" />
                    </div>
                    <p className="text-xs font-medium text-gray-900 dark:text-white">Premium Members</p>
                    <p className="text-xs text-gray-400 mt-0.5">{stats.totalPremium} total</p>
                </Link>
            </motion.div>
        </div>
    );
}