"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useSession } from "@/lib/auth-client";
import toast from "react-hot-toast";
import {
    Loader2,
    Search,
    ChevronLeft,
    ChevronRight,
    RefreshCw,
    Filter,
    CheckCircle,
    XCircle,
    Trash2,
    Eye,
    AlertCircle,
} from "lucide-react";

const BASE_URL = (process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:8000').replace(/\/$/, '');

export default function ReportsClient({ user: initialUser }) {
    const { data: session } = useSession();
    const adminUser = session?.user || initialUser;

    const [reports, setReports] = useState([]);
    const [total, setTotal] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [perPage] = useState(10);
    const [statusFilter, setStatusFilter] = useState('all');
    const [actionLoading, setActionLoading] = useState(null); // report id
    const [confirmModal, setConfirmModal] = useState(null); // { reportId, action }

    // ── Fetch reports ──
    const fetchReports = async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams({
                page,
                perPage,
            });
            if (statusFilter !== 'all') params.set('status', statusFilter);

            const res = await fetch(`${BASE_URL}/api/reports?${params.toString()}`, {
                headers: { 'user-email': adminUser.email },
            });

            if (res.ok) {
                const data = await res.json();
                setReports(data.reports || []);
                setTotal(data.total || 0);
            } else {
                const text = await res.text();
                toast.error(`Server error ${res.status}: ${text}`);
            }
        } catch (err) {
            console.error(err);
            toast.error('Failed to fetch reports');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchReports();
    }, [page, statusFilter]);

    // ── Dismiss report ──
    const handleDismiss = async (reportId) => {
        setActionLoading(reportId);
        try {
            const res = await fetch(`${BASE_URL}/api/reports/${reportId}/dismiss`, {
                method: 'PATCH',
                headers: { 'user-email': adminUser.email },
            });

            if (res.ok) {
                toast.success('Report dismissed');
                fetchReports();
            } else {
                const data = await res.json();
                toast.error(data.message || 'Dismiss failed');
            }
        } catch (err) {
            console.error(err);
            toast.error('Something went wrong');
        } finally {
            setActionLoading(null);
        }
    };

    // ── Remove recipe (and resolve report) ──
    const handleRemoveRecipe = async (reportId) => {
        setActionLoading(reportId);
        try {
            const res = await fetch(`${BASE_URL}/api/reports/${reportId}/remove-recipe`, {
                method: 'DELETE',
                headers: { 'user-email': adminUser.email },
            });

            if (res.ok) {
                toast.success('Recipe removed and report resolved');
                fetchReports();
            } else {
                const data = await res.json();
                toast.error(data.message || 'Remove failed');
            }
        } catch (err) {
            console.error(err);
            toast.error('Something went wrong');
        } finally {
            setActionLoading(null);
        }
    };

    const totalPages = Math.ceil(total / perPage);

    // ── Status badge helper ──
    const getStatusBadge = (status) => {
        const configs = {
            pending: {
                bg: 'bg-yellow-50 dark:bg-yellow-900/30',
                border: 'border-yellow-200 dark:border-yellow-700',
                text: 'text-yellow-700 dark:text-yellow-400',
                icon: <AlertCircle className="w-3.5 h-3.5" />,
            },
            dismissed: {
                bg: 'bg-gray-50 dark:bg-gray-800/30',
                border: 'border-gray-200 dark:border-gray-700',
                text: 'text-gray-700 dark:text-gray-400',
                icon: <XCircle className="w-3.5 h-3.5" />,
            },
            resolved: {
                bg: 'bg-green-50 dark:bg-green-900/30',
                border: 'border-green-200 dark:border-green-700',
                text: 'text-green-700 dark:text-green-400',
                icon: <CheckCircle className="w-3.5 h-3.5" />,
            },
        };
        const config = configs[status] || configs.pending;
        return (
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${config.bg} ${config.border} ${config.text}`}>
                {config.icon}
                {status || 'pending'}
            </span>
        );
    };

    return (
        <div className="p-4 sm:p-6 pt-8 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reported Items</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                        Review and moderate reported recipes.
                    </p>
                </motion.div>
                <button
                    onClick={fetchReports}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-700 transition-all"
                >
                    <RefreshCw className="w-4 h-4" /> Refresh
                </button>
            </div>

            {/* ── Filters ── */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center bg-white dark:bg-[#1a1d24] p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800/50 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#F5726B]/40 transition-all w-full sm:w-auto"
                    >
                        <option value="all">All Reports</option>
                        <option value="pending">Pending</option>
                        <option value="dismissed">Dismissed</option>
                        <option value="resolved">Resolved</option>
                    </select>
                </div>
            </div>

            {/* ── Table ── */}
            {isLoading ? (
                <div className="flex items-center justify-center py-16">
                    <Loader2 className="w-8 h-8 text-[#F5726B] animate-spin" />
                </div>
            ) : reports.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-[#1a1d24] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                    <p className="text-gray-500 dark:text-gray-400">No reports found.</p>
                </div>
            ) : (
                <>
                    <div className="overflow-x-auto bg-white dark:bg-[#1a1d24] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 dark:bg-zinc-900/50 border-b border-gray-100 dark:border-gray-800">
                                <tr>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-400">Recipe</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-400">Reported By</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-400">Reason</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-400">Status</th>
                                    <th className="px-4 py-3 text-center font-semibold text-gray-600 dark:text-gray-400">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reports.map((report) => (
                                    <tr key={report._id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-zinc-900/30 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={report.recipe?.recipeImage || '/recipe-placeholder.jpg'}
                                                    alt={report.recipe?.recipeName}
                                                    className="w-10 h-10 rounded-lg object-cover border border-gray-100 dark:border-gray-800"
                                                />
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-white line-clamp-1">
                                                        {report.recipe?.recipeName || 'Unknown'}
                                                    </p>
                                                    <p className="text-xs text-gray-400">
                                                        by {report.recipe?.authorName || 'Unknown'}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                                            {report.reporterEmail}
                                        </td>
                                        <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                                            <span className="inline-block max-w-[150px] truncate" title={report.reason}>
                                                {report.reason}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            {getStatusBadge(report.status)}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-center gap-1 flex-wrap">
                                                {report.status === 'pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleDismiss(report._id)}
                                                            disabled={actionLoading === report._id}
                                                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            {actionLoading === report._id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Dismiss'}
                                                        </button>
                                                        <button
                                                            onClick={() => handleRemoveRecipe(report._id)}
                                                            disabled={actionLoading === report._id}
                                                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-800/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            {actionLoading === report._id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Remove'}
                                                        </button>
                                                    </>
                                                )}
                                                {report.recipe && (
                                                    <a
                                                        href={`/recipes/${report.recipe._id}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                                        title="View Recipe"
                                                    >
                                                        <Eye className="w-4 h-4 text-gray-500" />
                                                    </a>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2 mt-8 flex-wrap">
                            <button
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="px-4 py-2 rounded-xl bg-white dark:bg-[#1a1d24] border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-400 hover:border-[#F5726B] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            {[...Array(totalPages)].map((_, i) => (
                                <button
                                    key={i + 1}
                                    onClick={() => setPage(i + 1)}
                                    className={`w-10 h-10 rounded-xl text-sm font-semibold transition-all ${page === i + 1
                                            ? 'bg-[#F5726B] text-white shadow-md'
                                            : 'bg-white dark:bg-[#1a1d24] border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-[#F5726B]'
                                        }`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                            <button
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="px-4 py-2 rounded-xl bg-white dark:bg-[#1a1d24] border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-400 hover:border-[#F5726B] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}