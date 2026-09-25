'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { XCircle, ArrowLeft, RefreshCw, Loader2 } from 'lucide-react';

function CancelContent() {
    const searchParams = useSearchParams();
    const bookingId = searchParams.get('booking_id');

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                className="max-w-md w-full text-center space-y-6"
            >
                {/* Icon */}
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
                    className="mx-auto w-24 h-24 rounded-full bg-red-500/10 border-2 border-red-500/30 flex items-center justify-center"
                >
                    <XCircle className="w-12 h-12 text-red-400" />
                </motion.div>

                {/* Title */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="space-y-2"
                >
                    <h1 className="text-3xl font-bold text-white">Payment Cancelled</h1>
                    <p className="text-slate-400">
                        Your payment was not completed. No charges were made.
                    </p>
                </motion.div>

                {/* Info */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-5"
                >
                    <p className="text-sm text-slate-300">
                        Your reservation is still held for a short time. You can try again or choose
                        different dates.
                    </p>
                </motion.div>

                {/* Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="flex flex-col sm:flex-row gap-3"
                >
                    <Link
                        href="/properties"
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl
                            bg-amber-500 text-black font-semibold hover:bg-amber-400 transition-colors"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Try Again
                    </Link>
                    <Link
                        href="/"
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl
                            border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Go Home
                    </Link>
                </motion.div>
            </motion.div>
        </div>
    );
}

export default function BookingCancelPage() {
    return (
        <Suspense
            fallback={
                <div className="flex items-center justify-center min-h-screen bg-slate-950">
                    <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
                </div>
            }
        >
            <CancelContent />
        </Suspense>
    );
}
