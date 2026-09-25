'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader2, CalendarCheck, Eye } from 'lucide-react';
import api from '@/lib/api';
import { formatAED } from '@/lib/format';
import type { Booking } from '@/types';

export default function AdminBookingsPage() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const { data: res } = await api.get('/bookings/admin/all?limit=50&sort=-createdAt');
                setBookings(res.data || []);
            } catch {
                setBookings([]);
            } finally {
                setLoading(false);
            }
        };
        fetchBookings();
    }, []);

    const updateStatus = async (id: string, status: string) => {
        try {
            await api.put(`/bookings/${id}/status`, { status });
            setBookings((prev) =>
                prev.map((b) => (b._id === id ? { ...b, status: status as Booking['status'] } : b))
            );
        } catch (err) {
            console.error('Update status failed:', err);
        }
    };

    const statusColor: Record<string, string> = {
        pending: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
        confirmed: 'text-green-400 bg-green-500/10 border-green-500/20',
        cancelled: 'text-red-400 bg-red-500/10 border-red-500/20',
        completed: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
            </div>
        );
    }

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-white">Bookings</h1>
                <p className="text-sm text-slate-400 mt-1">Manage all customer bookings</p>
            </div>

            {bookings.length > 0 ? (
                <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-800/50">
                                    <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase">
                                        Guest
                                    </th>
                                    <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase">
                                        Property
                                    </th>
                                    <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase">
                                        Dates
                                    </th>
                                    <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase">
                                        Total
                                    </th>
                                    <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase">
                                        Status
                                    </th>
                                    <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50">
                                {bookings.map((booking, i) => {
                                    const guest =
                                        typeof booking.user === 'object' ? booking.user : null;
                                    const property =
                                        typeof booking.property === 'object'
                                            ? booking.property
                                            : null;
                                    return (
                                        <motion.tr
                                            key={booking._id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: i * 0.03 }}
                                            className="hover:bg-white/[0.02] transition-colors"
                                        >
                                            <td className="px-6 py-3.5">
                                                <p className="text-sm text-white">
                                                    {guest?.name || 'Guest'}
                                                </p>
                                                <p className="text-xs text-slate-400">
                                                    {guest?.email || ''}
                                                </p>
                                            </td>
                                            <td className="px-6 py-3.5">
                                                <p className="text-sm text-slate-300 truncate max-w-[200px]">
                                                    {property?.title || 'N/A'}
                                                </p>
                                            </td>
                                            <td className="px-6 py-3.5 text-sm text-slate-400 whitespace-nowrap">
                                                {new Date(booking.checkIn).toLocaleDateString()} –{' '}
                                                {new Date(booking.checkOut).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-3.5 text-sm font-semibold text-white">
                                                {formatAED(booking.totalPrice)}
                                            </td>
                                            <td className="px-6 py-3.5">
                                                <select
                                                    value={booking.status}
                                                    onChange={(e) =>
                                                        updateStatus(booking._id, e.target.value)
                                                    }
                                                    className={`text-xs font-medium px-2 py-1 rounded-lg border
                            bg-transparent cursor-pointer
                            ${statusColor[booking.status] || 'text-slate-400 border-slate-700'}
                          `}
                                                >
                                                    <option value="pending">Pending</option>
                                                    <option value="confirmed">Confirmed</option>
                                                    <option value="completed">Completed</option>
                                                    <option value="cancelled">Cancelled</option>
                                                </select>
                                            </td>
                                            <td className="px-6 py-3.5">
                                                {property && (
                                                    <a
                                                        href={`/properties/${property._id}`}
                                                        target="_blank"
                                                        className="p-1.5 rounded-lg text-slate-400 hover:text-white
                              hover:bg-white/5 transition-all inline-flex"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </a>
                                                )}
                                            </td>
                                        </motion.tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="text-center py-20">
                    <CalendarCheck className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                    <p className="text-xl text-slate-400">No bookings yet</p>
                </div>
            )}
        </div>
    );
}
