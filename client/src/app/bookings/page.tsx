'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CalendarCheck, MapPin, Clock, CreditCard, Loader2, Calendar } from 'lucide-react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import api from '@/lib/api';
import { formatAED } from '@/lib/format';
import type { Booking } from '@/types';

function BookingCard({ booking, index }: { booking: Booking; index: number }) {
    const statusColors: Record<string, string> = {
        pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
        confirmed: 'bg-green-500/10 text-green-400 border-green-500/20',
        cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
        completed: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    };

    const paymentColors: Record<string, string> = {
        pending: 'text-yellow-400',
        paid: 'text-green-400',
        refunded: 'text-blue-400',
    };

    const checkIn = new Date(booking.checkIn).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
    const checkOut = new Date(booking.checkOut).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });

    const property = typeof booking.property === 'object' ? booking.property : null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-2xl overflow-hidden
        hover:border-slate-700/50 transition-all duration-300"
        >
            <div className="flex flex-col sm:flex-row">
                {/* Image */}
                {property && (
                    <Link
                        href={`/properties/${property._id}`}
                        className="sm:w-48 aspect-[16/10] sm:aspect-auto flex-shrink-0"
                    >
                        <div
                            className="w-full h-full min-h-[120px] bg-cover bg-center"
                            style={{
                                backgroundImage: `url(${property.images?.[0]?.url || ''})`,
                                backgroundColor: '#1e293b',
                            }}
                        />
                    </Link>
                )}

                {/* Details */}
                <div className="flex-1 p-4 sm:p-5 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            {property && (
                                <Link
                                    href={`/properties/${property._id}`}
                                    className="text-white font-semibold hover:text-amber-400 transition-colors line-clamp-1"
                                >
                                    {property.title}
                                </Link>
                            )}
                            {property && (
                                <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
                                    <MapPin className="w-3 h-3 text-amber-500" />
                                    {property.location?.city}, {property.location?.country}
                                </div>
                            )}
                        </div>
                        <span
                            className={`text-xs font-medium px-2.5 py-1 rounded-lg border ${
                                statusColors[booking.status] || statusColors.pending
                            }`}
                        >
                            {booking.status}
                        </span>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                        <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            {checkIn} → {checkOut}
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            {booking.nights} nights
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800/50">
                        <div className="flex items-center gap-1.5 text-sm">
                            <CreditCard className="w-3.5 h-3.5 text-slate-500" />
                            <span
                                className={paymentColors[booking.paymentStatus] || 'text-slate-400'}
                            >
                                {booking.paymentStatus}
                            </span>
                        </div>
                        <span className="text-lg font-bold text-white">
                            {formatAED(booking.totalPrice)}
                        </span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

function BookingsContent() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const { data: res } = await api.get('/bookings');
                setBookings(res.data || []);
            } catch {
                setBookings([]);
            } finally {
                setLoading(false);
            }
        };
        fetchBookings();
    }, []);

    return (
        <div className="min-h-screen bg-slate-950 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex items-center gap-3">
                        <CalendarCheck className="w-7 h-7 text-amber-500" />
                        <h1 className="text-3xl font-bold text-white">My Bookings</h1>
                    </div>
                    <p className="text-slate-400 mt-2 ml-10">
                        Manage and track your vacation bookings
                    </p>
                </motion.div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
                    </div>
                ) : bookings.length > 0 ? (
                    <div className="space-y-4">
                        {bookings.map((booking, index) => (
                            <BookingCard key={booking._id} booking={booking} index={index} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <CalendarCheck className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                        <p className="text-xl text-slate-400 mb-2">No bookings yet</p>
                        <p className="text-sm text-slate-500 mb-6">
                            Start exploring properties and book your dream stay!
                        </p>
                        <Link href="/properties">
                            <button
                                className="px-6 py-2.5 text-sm font-semibold text-white rounded-xl
                bg-gradient-to-r from-amber-500 to-orange-600 shadow-lg shadow-amber-500/25
                hover:shadow-amber-500/40 transition-all"
                            >
                                Browse Properties
                            </button>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function BookingsPage() {
    return (
        <ProtectedRoute>
            <BookingsContent />
        </ProtectedRoute>
    );
}
