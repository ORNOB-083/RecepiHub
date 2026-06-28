"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import toast from "react-hot-toast";
import {
    Crown,
    CheckCircle,
    Loader2,
    ArrowLeft,
    Sparkles,
    Star,
    Infinity,
    Shield,
} from "lucide-react";

const BASE_URL = (process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:8000').replace(/\/$/, '');

export default function UpgradeClient({ user: initialUser }) {
    const { data: session } = useSession();
    const user = session?.user || initialUser;
    const router = useRouter();

    const [isLoading, setIsLoading] = useState(false);

    // If user is already premium, show a message
    if (user?.isPremium) {
        return (
            <div className="p-6 pt-8 max-w-3xl mx-auto space-y-6">
                <Link
                    href="/dashboard/user"
                    className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                </Link>

                <div className="bg-white dark:bg-[#1a1d24] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-8 text-center">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-yellow-500/25">
                        <Crown className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        You&apos;re Already a Premium Member! 🎉
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        Enjoy unlimited recipe uploads and your premium badge.
                    </p>
                    <Link
                        href="/dashboard/user"
                        className="inline-block mt-6 px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold text-sm hover:shadow-lg transition-all"
                    >
                        Go to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    const handleUpgrade = async () => {
        setIsLoading(true);
        try {
            // Get user email from session to pass to checkout
            const res = await fetch('/api/payments/checkout-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // No need for user-email; the API route uses auth() to get session
                },
                body: JSON.stringify({
                    type: 'premium',
                }),
            });

            const data = await res.json();
            if (data.url) {
                window.location.href = data.url;
            } else {
                toast.error(data.error || 'Payment initiation failed');
            }
        } catch (err) {
            console.error('Upgrade error:', err);
            toast.error('Something went wrong');
        } finally {
            setIsLoading(false);
        }
    };

    const benefits = [
        'Unlimited recipe uploads',
        'Premium badge on your profile',
        'Priority support',
        'Access to exclusive features',
        'No ads',
        'Show your support for the community',
    ];

    return (
        <div className="p-4 sm:p-6 pt-8 max-w-6xl mx-auto space-y-6">
            {/* ── Back Button ── */}
            <Link
                href="/dashboard/user"
                className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            >
                <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </Link>

            {/* ── Header ── */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <div className="text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-xs font-semibold mb-4">
                        <Sparkles className="w-3.5 h-3.5" /> Upgrade Now
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Go Premium
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-xl mx-auto">
                        Unlock unlimited recipe uploads and get a premium badge to stand out in the community.
                    </p>
                </div>
            </motion.div>

            {/* ── Pricing Card ── */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="max-w-lg mx-auto"
            >
                <div className="bg-white dark:bg-[#1a1d24] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xl overflow-hidden">
                    {/* Premium Header */}
                    <div className="relative bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 p-6 text-white text-center">
                        <div
                            className="absolute inset-0 opacity-10"
                            style={{
                                backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`,
                                backgroundSize: '24px 24px',
                            }}
                        />
                        <div className="relative">
                            <div className="flex items-center justify-center gap-2 mb-2">
                                <Crown className="w-6 h-6 text-yellow-300" />
                                <span className="text-sm font-semibold uppercase tracking-wider">Premium</span>
                            </div>
                            <div className="text-4xl font-bold">৳999</div>
                            <p className="text-white/70 text-sm mt-1">One-time payment · Lifetime access</p>
                        </div>
                    </div>

                    {/* Benefits */}
                    <div className="p-6 space-y-4">
                        <div className="space-y-3">
                            {benefits.map((benefit, i) => (
                                <div key={i} className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                                    {benefit}
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={handleUpgrade}
                            disabled={isLoading}
                            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-sm shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <Crown className="w-5 h-5" />
                                    Upgrade Now — ৳999
                                </>
                            )}
                        </button>

                        <p className="text-center text-xs text-gray-400 dark:text-gray-500">
                            Secure payment via Stripe. No recurring charges.
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* ── FAQ / Why Premium ── */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="max-w-2xl mx-auto"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-[#1a1d24] rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center">
                                <Infinity className="w-4 h-4 text-orange-500" />
                            </div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">Unlimited Recipes</h3>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Free users can only add 2 recipes. As a premium member, you can add as many as you like.
                        </p>
                    </div>
                    <div className="bg-white dark:bg-[#1a1d24] rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 flex items-center justify-center">
                                <Star className="w-4 h-4 text-yellow-500" />
                            </div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">Premium Badge</h3>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Stand out with a premium badge on your profile and recipes. Show your support for the community.
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}