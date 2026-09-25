'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircle, Calendar, Home, Loader2 } from 'lucide-react';
import api from '@/lib/api';

function SuccessContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const sessionId = searchParams.get('session_id');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const verifyBooking = async () => {
            if (sessionId) {
                try {
                    await api.post('/bookings/verify-checkout', { sessionId });
                    console.log('Booking verified successfully');
                } catch (err) {
                    console.error('Failed to verify booking:', err);
                }
            }
            // Brief loading state for the animation effect
            setTimeout(() => setLoading(false), 1000);
        };
        verifyBooking();
    }, [sessionId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-950">
                <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                className="max-w-md w-full text-center space-y-6"
            >
                {/* Success Icon */}
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 300, damping: 15 }}
                    className="mx-auto w-24 h-24 rounded-full bg-green-500/10 border-2 border-green-500/30 flex items-center justify-center"
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.4, type: 'spring', stiffness: 400 }}
                    >
                        <CheckCircle className="w-12 h-12 text-green-400" />
                    </motion.div>
                </motion.div>

                {/* Title */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="space-y-2"
                >
                    <h1 className="text-3xl font-bold text-white">Booking Confirmed! 🎉</h1>
                    <p className="text-slate-400">
                        Your payment was successful and your reservation has been confirmed.
                    </p>
                </motion.div>

                {/* Confetti dots animation */}
                <div className="relative h-8">
                    {[...Array(12)].map((_, i) => (
                        <motion.div
                            key={i}
                            initial={{
                                opacity: 0,
                                scale: 0,
                                x: 0,
                                y: 0,
                            }}
                            animate={{
                                opacity: [0, 1, 0],
                                scale: [0, 1, 0.5],
                                x: (Math.random() - 0.5) * 200,
                                y: (Math.random() - 0.5) * 100,
                            }}
                            transition={{
                                delay: 0.3 + i * 0.05,
                                duration: 1.5,
                                ease: 'easeOut',
                            }}
                            className="absolute left-1/2 top-1/2 w-2 h-2 rounded-full"
                            style={{
                                backgroundColor: [
                                    '#f59e0b',
                                    '#10b981',
                                    '#3b82f6',
                                    '#ef4444',
                                    '#8b5cf6',
                                ][i % 5],
                            }}
                        />
                    ))}
                </div>

                {/* Info card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-5 space-y-3"
                >
                    <p className="text-sm text-slate-300">
                        A confirmation email will be sent shortly with all the details of your stay.
                    </p>
                    {sessionId && (
                        <p className="text-xs text-slate-500">
                            Reference: {sessionId.substring(0, 20)}...
                        </p>
                    )}
                </motion.div>

                {/* Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 }}
                    className="flex flex-col sm:flex-row gap-3"
                >
                    <Link
                        href="/bookings"
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl
                            bg-amber-500 text-black font-semibold hover:bg-amber-400 transition-colors"
                    >
                        <Calendar className="w-4 h-4" />
                        My Bookings
                    </Link>
                    <Link
                        href="/properties"
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl
                            border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors"
                    >
                        <Home className="w-4 h-4" />
                        Browse More
                    </Link>
                </motion.div>
            </motion.div>
        </div>
    );
}

export default function BookingSuccessPage() {
    return (
        <Suspense
            fallback={
                <div className="flex items-center justify-center min-h-screen bg-slate-950">
                    <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
                </div>
            }
        >
            <SuccessContent />
        </Suspense>
    );
}
