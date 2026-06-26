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
    Shield,
    User,
    CheckCircle,
    XCircle,
    RefreshCw,
    Filter,
    Crown,
    Ban,
    Unlock,
} from "lucide-react";

const BASE_URL = (process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:8000').replace(/\/$/, '');

export default function UsersClient({ user: initialUser }) {
    const { data: session } = useSession();
    const adminUser = session?.user || initialUser;

    const [users, setUsers] = useState([]);
    const [total, setTotal] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [perPage] = useState(10);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [actionLoading, setActionLoading] = useState(null); // user id

    // ── Fetch users ──
    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams({
                page,
                perPage,
            });
            if (search) params.set('search', search);
            if (roleFilter !== 'all') params.set('role', roleFilter);

            const res = await fetch(`${BASE_URL}/api/admin/users?${params.toString()}`, {
                headers: { 'user-email': adminUser.email },
            });

            if (res.ok) {
                const data = await res.json();
                setUsers(data.users || []);
                setTotal(data.total || 0);
            } else {
                const text = await res.text();
                toast.error(`Server error ${res.status}: ${text}`);
            }
        } catch (err) {
            console.error(err);
            toast.error('Failed to fetch users');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchUsers();
    }, [page, search, roleFilter]);

    // ── Block/Unblock ──
    const handleBlockToggle = async (userId, currentBlocked) => {
        setActionLoading(userId);
        try {
            const res = await fetch(`${BASE_URL}/api/admin/users/${userId}/block`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'user-email': adminUser.email,
                },
                body: JSON.stringify({ isBlocked: !currentBlocked }),
            });

            if (res.ok) {
                toast.success(currentBlocked ? 'User unblocked' : 'User blocked');
                fetchUsers();
            } else {
                const data = await res.json();
                toast.error(data.message || 'Action failed');
            }
        } catch (err) {
            console.error(err);
            toast.error('Something went wrong');
        } finally {
            setActionLoading(null);
        }
    };

    const totalPages = Math.ceil(total / perPage);

    return (
        <div className="p-4 sm:p-6 pt-8 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Users</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                        View, search, and moderate user accounts.
                    </p>
                </motion.div>
                <button
                    onClick={fetchUsers}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-700 transition-all"
                >
                    <RefreshCw className="w-4 h-4" /> Refresh
                </button>
            </div>

            {/* ── Filters ── */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center bg-white dark:bg-[#1a1d24] p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800/50 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#F5726B]/40 focus:border-[#F5726B] transition-all"
                    />
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800/50 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#F5726B]/40 transition-all w-full sm:w-auto"
                    >
                        <option value="all">All Roles</option>
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>
            </div>

            {/* ── Table ── */}
            {isLoading ? (
                <div className="flex items-center justify-center py-16">
                    <Loader2 className="w-8 h-8 text-[#F5726B] animate-spin" />
                </div>
            ) : users.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-[#1a1d24] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                    <p className="text-gray-500 dark:text-gray-400">No users found.</p>
                </div>
            ) : (
                <>
                    <div className="overflow-x-auto bg-white dark:bg-[#1a1d24] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 dark:bg-zinc-900/50 border-b border-gray-100 dark:border-gray-800">
                                <tr>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-400">User</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-400">Role</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-400">Premium</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-400">Status</th>
                                    <th className="px-4 py-3 text-center font-semibold text-gray-600 dark:text-gray-400">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr key={user._id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-zinc-900/30 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={user.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'U')}&background=F5726B&color=fff&size=40`}
                                                    alt={user.name}
                                                    className="w-10 h-10 rounded-full object-cover border border-gray-100 dark:border-gray-800"
                                                />
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-white">{user.name || 'Unknown'}</p>
                                                    <p className="text-xs text-gray-400">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${user.role === 'admin'
                                                    ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
                                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                                                }`}>
                                                {user.role === 'admin' ? <Shield className="w-3 h-3" /> : <User className="w-3 h-3" />}
                                                {user.role || 'user'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            {user.isPremium ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400">
                                                    <Crown className="w-3 h-3" /> Premium
                                                </span>
                                            ) : (
                                                <span className="text-xs text-gray-400">Free</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            {user.isBlocked ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
                                                    <XCircle className="w-3 h-3" /> Blocked
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                                                    <CheckCircle className="w-3 h-3" /> Active
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <button
                                                onClick={() => handleBlockToggle(user._id, user.isBlocked)}
                                                disabled={actionLoading === user._id}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${user.isBlocked
                                                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-800/40'
                                                        : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-800/40'
                                                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                                            >
                                                {actionLoading === user._id ? (
                                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                ) : user.isBlocked ? (
                                                    <><Unlock className="w-3 h-3 inline mr-1" /> Unblock</>
                                                ) : (
                                                    <><Ban className="w-3 h-3 inline mr-1" /> Block</>
                                                )}
                                            </button>
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