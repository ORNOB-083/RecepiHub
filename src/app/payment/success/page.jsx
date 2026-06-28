import { stripe } from '@/lib/stripe';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, ArrowRight, Crown, BookOpen } from 'lucide-react';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';

export default async function PaymentSuccessPage({ searchParams }) {
    const { session_id } = await searchParams;
    if (!session_id) redirect('/dashboard');

    // 1. Get authenticated user
    const authSession = await auth.api.getSession({ headers: await headers() });
    if (!authSession?.user) redirect('/login');

    // 2. Retrieve Stripe session
    let stripeSession;
    let metadata = {};
    let amount = 0;
    let type = 'recipe';
    let recipeId = null;
    let purchaseSaved = false;
    let confirmError = null;

    try {
        stripeSession = await stripe.checkout.sessions.retrieve(session_id);
        metadata = stripeSession.metadata || {};
        type = metadata.type || 'recipe';
        amount = Number(metadata.amount) || (stripeSession.amount_total / 100);
        recipeId = metadata.recipeId;
    } catch (err) {
        console.error('Failed to retrieve Stripe session:', err);
        // Still show the page but with limited info
    }

    // 3. Confirm purchase with backend (save to database)
    if (stripeSession && stripeSession.payment_status === 'paid') {
        const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:8000';
        try {
            const confirmRes = await fetch(`${SERVER_URL}/api/payments/confirm-purchase`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'user-email': authSession.user.email,
                },
                body: JSON.stringify({ sessionId: session_id }),
            });
            if (confirmRes.ok) {
                purchaseSaved = true;
                console.log('✅ Purchase confirmed');
            } else {
                confirmError = await confirmRes.text();
                console.error('❌ Confirm failed:', confirmError);
            }
        } catch (err) {
            console.error('❌ Error confirming:', err);
            confirmError = err.message;
        }
    }

    const isPremium = type === 'premium';

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0f1117] flex items-center justify-center px-4">
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-72 h-72 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="relative z-10 w-full max-w-md bg-white dark:bg-[#1a1d24] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-2xl p-8 text-center">
                <div className="w-20 h-20 rounded-full bg-emerald-50 dark:bg-emerald-900/20 border-4 border-emerald-100 dark:border-emerald-800 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/10">
                    <CheckCircle className="w-10 h-10 text-emerald-500" />
                </div>

                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    Payment Successful! 🎉
                </h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
                    {isPremium
                        ? 'You are now a Premium member! Enjoy unlimited recipe sharing.'
                        : 'Your recipe purchase is complete. You can now access the full recipe.'}
                </p>

                <div className="bg-gray-50 dark:bg-gray-800/60 rounded-xl p-4 mb-6 text-left space-y-2 border border-gray-100 dark:border-gray-700">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">Transaction ID</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100 text-xs truncate max-w-[160px]">
                            {stripeSession?.id || session_id}
                        </span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">Amount Paid</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                            ৳{amount.toFixed(2)}
                        </span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">Type</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100 capitalize">
                            {isPremium ? 'Premium Membership' : 'Recipe Purchase'}
                        </span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">Email</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100 text-xs truncate max-w-[160px]">
                            {authSession.user.email}
                        </span>
                    </div>
                </div>

                {/* ── Confirmation status ── */}
                {purchaseSaved ? (
                    <p className="text-xs text-green-600 dark:text-green-400 mb-4">
                        ✅ Purchase recorded successfully
                    </p>
                ) : confirmError ? (
                    <p className="text-xs text-yellow-600 dark:text-yellow-400 mb-4">
                        ⚠️ Purchase recorded, but confirmation may take a moment.
                        <br />
                        <span className="text-[10px] text-gray-400">Please refresh the recipe page if it doesn&apos;t show.</span>
                    </p>
                ) : (
                    <p className="text-xs text-gray-400 mb-4">
                        ⏳ Confirming your purchase...
                    </p>
                )}

                <div className="space-y-3">
                    {isPremium ? (
                        <Link
                            href="/dashboard/user"
                            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold text-sm shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all"
                        >
                            <Crown className="w-4 h-4" />
                            Go to Dashboard
                        </Link>
                    ) : (
                        <Link
                            // eslint-disable-next-line react-hooks/purity
                            href={`/recipes/${recipeId}?purchased=${purchaseSaved ? 'true' : 'false'}&_t=${Date.now()}`}
                            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold text-sm shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all"
                        >
                            <BookOpen className="w-4 h-4" />
                            View Recipe
                        </Link>
                    )}
                    <Link
                        href="/recipes"
                        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                    >
                        Browse More Recipes
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </div>
    );
}