import Link from 'next/link';
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react';

export default function PaymentCancelPage() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0f1117] flex items-center justify-center px-4">
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-72 h-72 bg-red-500/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="relative z-10 w-full max-w-md bg-white dark:bg-[#1a1d24] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-2xl p-8 text-center">
                <div className="w-20 h-20 rounded-full bg-red-50 dark:bg-red-900/20 border-4 border-red-100 dark:border-red-800 flex items-center justify-center mx-auto mb-6">
                    <XCircle className="w-10 h-10 text-red-500" />
                </div>

                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    Payment Cancelled
                </h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">
                    Your payment was cancelled. No charges were made. You can try again anytime.
                </p>

                <div className="space-y-3">
                    <Link
                        href="/dashboard"
                        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold text-sm shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Go to Dashboard
                    </Link>
                    <Link
                        href="/recipes"
                        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Browse Recipes
                    </Link>
                </div>
            </div>
        </div>
    );
}