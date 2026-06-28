'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Clock, User, Heart, Flag, ShoppingCart,
    Crown, ChefHat, Utensils, ArrowLeft, X,
    Loader2, Shield, CheckCircle,
} from 'lucide-react';
import { useSession, authClient } from '@/lib/auth-client';
import toast from 'react-hot-toast';

const BASE_URL = (process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:8000').replace(/\/$/, '');
const SYNCED_KEY = 'recipehub_user_synced';

// ─── USER SYNC ────────────────────────────────────────────────
async function syncUser(email, name, image) {
    try {
        const res = await fetch(`${BASE_URL}/api/auth/sync`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, name, image: image || 'https://placehold.co/100' }),
        });
        if (res.ok) {
            localStorage.setItem(SYNCED_KEY, 'true');
            return true;
        }
        return false;
    } catch {
        return false;
    }
}

// ─── AUTH HELPER ──────────────────────────────────────────────
async function getSessionEmail() {
    const session = await authClient.getSession();
    return session?.data?.user?.email || null;
}

// ─── PURCHASE MODAL ──────────────────────────────────────────
function PurchaseModal({ recipe, onClose }) {
    const [isLoading, setIsLoading] = useState(false);

    const handlePurchase = async () => {
        setIsLoading(true);
        try {
            const userEmail = await getSessionEmail();
            if (!userEmail) {
                toast.error('Please sign in to purchase');
                return;
            }
            const res = await fetch('/api/payments/checkout-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'user-email': userEmail,
                },
                body: JSON.stringify({
                    type: 'recipe',
                    recipeId: recipe._id,
                    amount: recipe.price || 4.99,
                }),
            });
            const data = await res.json();
            if (data.url) {
                window.location.href = data.url;
            } else {
                toast.error(data.error || 'Payment initiation failed');
            }
        } catch {
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
                    <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors">
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
                                ৳{(recipe.price || 4.99).toFixed(2)}
                            </span>
                        </div>
                        <div className="flex justify-between font-bold text-gray-900 dark:text-gray-100 pt-2 border-t border-gray-200 dark:border-gray-700">
                            <span>Total</span>
                            <span className="text-orange-600 dark:text-orange-400">
                                ৳{(recipe.price || 4.99).toFixed(2)}
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
                            <>Purchase Now — ৳{(recipe.price || 4.99).toFixed(2)}</>
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

// ─── REPORT MODAL ─────────────────────────────────────────────
function ReportModal({ recipeId, onClose }) {
    const [reason, setReason] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const reasons = ['Spam', 'Offensive Content', 'Copyright Issue', 'Other'];

    const handleReport = async () => {
        if (!reason) {
            toast.error('Please select a reason');
            return;
        }
        setIsLoading(true);
        try {
            const email = await getSessionEmail();
            if (!email) {
                toast.error('Please sign in to report');
                return;
            }
            const res = await fetch(`${BASE_URL}/api/reports`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'user-email': email,
                },
                body: JSON.stringify({ recipeId, reason }),
            });
            if (res.ok) {
                toast.success('Report submitted successfully');
                onClose();
            } else {
                const data = await res.json();
                toast.error(data.message || 'Failed to submit report');
            }
        } catch {
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
                        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Report Recipe</h3>
                        <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Why are you reporting this recipe?</p>
                    <div className="space-y-2">
                        {reasons.map((r) => (
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

// ─── MAIN CLIENT COMPONENT ────────────────────────────────────
export default function RecipeDetailsClient({ recipe }) {
    const { data: session, status } = useSession();
    const user = session?.user;
    const userEmail = user?.email;

    const searchParams = useSearchParams();
    const purchasedFlag = searchParams.get('purchased');

    const [likesCount, setLikesCount] = useState(recipe.likesCount || 0);
    const [isLiked, setIsLiked] = useState(recipe.likedBy?.includes(userEmail) || false);
    const [isFavorited, setIsFavorited] = useState(false);
    const [isPurchased, setIsPurchased] = useState(false);
    const [showPurchaseModal, setShowPurchaseModal] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    const [isLoadingAction, setIsLoadingAction] = useState(false);
    const [isPurchasedLoading, setIsPurchasedLoading] = useState(true);
    const [isFavoritedLoading, setIsFavoritedLoading] = useState(true);
    const [hasRefreshed, setHasRefreshed] = useState(false);

    // ── Sync user ──────────────────────────────────────────────
    useEffect(() => {
        if (status === 'authenticated' && userEmail) {
            const synced = localStorage.getItem(SYNCED_KEY);
            if (!synced) {
                syncUser(userEmail, user?.name, user?.image);
            }
        }
    }, [status, userEmail, user?.name, user?.image]);

    // ── Fetch purchase status ──────────────────────────────────
    const fetchPurchaseStatus = async (force = false) => {
        if (!userEmail || status !== 'authenticated') {
            setIsPurchasedLoading(false);
            return;
        }
        setIsPurchasedLoading(true);
        try {
            const url = `${BASE_URL}/api/purchases${force ? `?_t=${Date.now()}` : ''}`;
            const res = await fetch(url, {
                headers: { 'user-email': userEmail },
                cache: 'no-store',
            });
            if (res.ok) {
                const purData = await res.json();
                const purchased = purData.some((p) => p.recipeId === recipe._id);
                setIsPurchased(purchased);
                if (purchased && purchasedFlag === 'true') {
                    const newUrl = window.location.pathname;
                    window.history.replaceState({}, '', newUrl);
                }
            }
        } catch (err) {
            console.error('Error fetching purchases:', err);
        } finally {
            setIsPurchasedLoading(false);
        }
    };

    const fetchFavorites = async () => {
        if (!userEmail || status !== 'authenticated') {
            setIsFavoritedLoading(false);
            return;
        }
        try {
            let favRes = await fetch(`${BASE_URL}/api/favorites`, {
                headers: { 'user-email': userEmail },
            });
            if (favRes.status === 401) {
                localStorage.removeItem(SYNCED_KEY);
                await syncUser(userEmail, user?.name, user?.image);
                favRes = await fetch(`${BASE_URL}/api/favorites`, {
                    headers: { 'user-email': userEmail },
                });
            }
            if (favRes.ok) {
                const favData = await favRes.json();
                if (Array.isArray(favData)) {
                    setIsFavorited(favData.some((f) => f.recipeId === recipe._id));
                }
            }
        } catch (err) {
            console.error('Error fetching favorites:', err);
        } finally {
            setIsFavoritedLoading(false);
        }
    };

    // ── Initial fetch ──────────────────────────────────────────
    useEffect(() => {
        if (status === 'authenticated' && userEmail) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            fetchPurchaseStatus(false);
            fetchFavorites();
            if (recipe.likedBy?.includes(userEmail)) {
                setIsLiked(true);
            }
        } else {
            setIsPurchasedLoading(false);
            setIsFavoritedLoading(false);
        }
    }, [status, userEmail, recipe._id, recipe.likedBy]);

    // ── If `purchased` flag is present, force a fresh fetch ──
    useEffect(() => {
        if (purchasedFlag === 'true' && userEmail && !hasRefreshed) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setHasRefreshed(true);
            fetchPurchaseStatus(true);
        }
    }, [purchasedFlag, userEmail, hasRefreshed]);

    // ─── Handlers ──────────────────────────────────────────────

    const handleLike = async () => {
        if (!userEmail) {
            toast.error('Please sign in to like');
            return;
        }
        setIsLoadingAction(true);
        try {
            let res = await fetch(`${BASE_URL}/api/recipes/${recipe._id}/like`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'user-email': userEmail,
                },
            });
            if (res.status === 401) {
                localStorage.removeItem(SYNCED_KEY);
                await syncUser(userEmail, user?.name, user?.image);
                res = await fetch(`${BASE_URL}/api/recipes/${recipe._id}/like`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'user-email': userEmail,
                    },
                });
            }
            const data = await res.json();
            if (res.ok) {
                setLikesCount(data.likesCount);
                setIsLiked(data.liked);
                toast.success(data.liked ? 'Liked!' : 'Unliked');
            } else {
                toast.error(data.message || 'Failed to like');
            }
        } catch {
            toast.error('Something went wrong');
        } finally {
            setIsLoadingAction(false);
        }
    };

    const handleFavorite = async () => {
        if (!userEmail) {
            toast.error('Please sign in to favorite');
            return;
        }
        setIsLoadingAction(true);
        try {
            const url = `${BASE_URL}/api/favorites${isFavorited ? `/${recipe._id}` : ''}`;
            const method = isFavorited ? 'DELETE' : 'POST';
            let res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'user-email': userEmail,
                },
                body: isFavorited ? undefined : JSON.stringify({ recipeId: recipe._id }),
            });
            if (res.status === 401) {
                localStorage.removeItem(SYNCED_KEY);
                await syncUser(userEmail, user?.name, user?.image);
                res = await fetch(url, {
                    method,
                    headers: {
                        'Content-Type': 'application/json',
                        'user-email': userEmail,
                    },
                    body: isFavorited ? undefined : JSON.stringify({ recipeId: recipe._id }),
                });
            }
            const data = await res.json();
            if (data.success) {
                setIsFavorited(!isFavorited);
                toast.success(isFavorited ? 'Removed from favorites' : 'Added to favorites');
            } else {
                toast.error(data.message || 'Failed to update favorites');
            }
        } catch {
            toast.error('Something went wrong');
        } finally {
            setIsLoadingAction(false);
        }
    };

    const handleReport = () => {
        if (!userEmail) {
            toast.error('Please sign in to report');
            return;
        }
        setShowReportModal(true);
    };

    const handlePurchase = () => {
        if (!userEmail) {
            toast.error('Please sign in to purchase');
            return;
        }
        if (isPurchased) {
            toast.success('You already purchased this recipe');
            return;
        }
        setShowPurchaseModal(true);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0f1117] pt-24 pb-16">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <Link
                    href="/recipes"
                    className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors mb-6"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to recipes
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left column */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="relative h-80 md:h-96 rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800">
                            <Image
                                src={recipe.recipeImage || '/recipe-placeholder.jpg'}
                                alt={recipe.recipeName}
                                fill
                                className="object-cover"
                                priority
                            />
                            {recipe.isFeatured && (
                                <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-yellow-500 text-white text-xs font-bold shadow-lg">
                                    Featured
                                </div>
                            )}
                            {recipe.isPremium && (
                                <div className="absolute top-4 right-4 flex items-center gap-1 px-3 py-1 rounded-full bg-purple-600 text-white text-xs font-bold shadow-lg">
                                    <Crown className="w-3 h-3" /> Premium
                                </div>
                            )}
                            {isPurchased && (
                                <div className="absolute bottom-4 right-4 px-3 py-1 rounded-full bg-green-500 text-white text-xs font-bold shadow-lg flex items-center gap-1">
                                    <CheckCircle className="w-3 h-3" /> Purchased
                                </div>
                            )}
                        </div>

                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                                {recipe.recipeName}
                            </h1>
                            <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                                <span className="flex items-center gap-1">
                                    <User className="w-4 h-4" /> {recipe.authorName || 'Anonymous'}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" /> {recipe.preparationTime || 30} min
                                </span>
                                <span className="flex items-center gap-1">
                                    <ChefHat className="w-4 h-4" /> {recipe.difficultyLevel || 'Medium'}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Utensils className="w-4 h-4" />
                                    {recipe.cuisineType || 'Various'} · {recipe.category || 'General'}
                                </span>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-[#1a1d24] rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Ingredients</h2>
                            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {recipe.ingredients?.map((item, i) => (
                                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                                        <span className="text-orange-500 mt-0.5">•</span>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="bg-white dark:bg-[#1a1d24] rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Instructions</h2>
                            <ol className="space-y-4">
                                {recipe.instructions?.map((step, i) => (
                                    <li key={i} className="flex gap-3 text-sm text-gray-700 dark:text-gray-300">
                                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-bold flex items-center justify-center">
                                            {i + 1}
                                        </span>
                                        <span>{step}</span>
                                    </li>
                                ))}
                            </ol>
                        </div>
                    </div>

                    {/* Right sidebar */}
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-[#1a1d24] rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm sticky top-24">
                            <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                                <div className="flex items-center gap-2">
                                    <Heart className="w-5 h-5 text-red-500" />
                                    <span className="font-semibold text-gray-900 dark:text-gray-100">{likesCount}</span>
                                    <span className="text-sm text-gray-500 dark:text-gray-400">likes</span>
                                </div>
                                <button
                                    onClick={handleLike}
                                    disabled={isLoadingAction}
                                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${isLiked
                                        ? 'bg-red-500 text-white hover:bg-red-600'
                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                        }`}
                                >
                                    {isLoadingAction ? <Loader2 className="w-4 h-4 animate-spin" /> : isLiked ? 'Liked' : 'Like'}
                                </button>
                            </div>

                            <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                                <span className="font-semibold text-gray-900 dark:text-gray-100">Favorite</span>
                                {isFavoritedLoading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <button
                                        onClick={handleFavorite}
                                        disabled={isLoadingAction}
                                        className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${isFavorited
                                            ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                                            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                            }`}
                                    >
                                        {isLoadingAction ? <Loader2 className="w-4 h-4 animate-spin" /> : isFavorited ? 'Favorited' : 'Add to Favorites'}
                                    </button>
                                )}
                            </div>

                            <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                                <span className="font-semibold text-gray-900 dark:text-gray-100">Report</span>
                                <button
                                    onClick={handleReport}
                                    className="px-4 py-2 rounded-xl text-sm font-semibold bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/40 transition-all"
                                >
                                    <Flag className="w-4 h-4 inline mr-1" /> Report
                                </button>
                            </div>

                            {recipe.isPremium && (
                                <div className="py-2">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="font-semibold text-gray-900 dark:text-gray-100">Price</span>
                                        <span className="text-xl font-bold text-orange-500">
                                            ৳{(recipe.price || 4.99).toFixed(2)}
                                        </span>
                                    </div>
                                    {isPurchasedLoading ? (
                                        <div className="flex items-center justify-center py-2">
                                            <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                                        </div>
                                    ) : isPurchased ? (
                                        <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                                            <CheckCircle className="w-5 h-5" />
                                            <span className="font-semibold">Purchased</span>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={handlePurchase}
                                            className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold text-sm shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all flex items-center justify-center gap-2"
                                        >
                                            <ShoppingCart className="w-4 h-4" /> Purchase Now
                                        </button>
                                    )}
                                </div>
                            )}

                            {!recipe.isPremium && (
                                <div className="py-2 text-sm text-gray-500 dark:text-gray-400">
                                    This recipe is free to view.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {showPurchaseModal && <PurchaseModal recipe={recipe} onClose={() => setShowPurchaseModal(false)} />}
                {showReportModal && <ReportModal recipeId={recipe._id} onClose={() => setShowReportModal(false)} />}
            </AnimatePresence>
        </div>
    );
}