'use client';

import React, { useState, useEffect, useCallback } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Lock, Unlock, Loader2, AlertCircle, CheckCircle, Wrench } from 'lucide-react';
import api from '@/lib/api';
import './availability-calendar.css';

interface DateRange {
    type: 'booking' | 'blocked';
    startDate: string;
    endDate: string;
    status?: string;
    reason?: string;
    _id?: string;
}

interface AvailabilityCalendarProps {
    propertyId: string;
}

export default function AvailabilityCalendar({ propertyId }: AvailabilityCalendarProps) {
    const [ranges, setRanges] = useState<DateRange[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

    // Block range selection
    const [blockStart, setBlockStart] = useState<Date | null>(null);
    const [blockEnd, setBlockEnd] = useState<Date | null>(null);
    const [blockReason, setBlockReason] = useState('maintenance');

    const fetchAvailability = useCallback(async () => {
        try {
            const { data: res } = await api.get(`/properties/${propertyId}/availability`);
            setRanges(res.data || []);
        } catch {
            setRanges([]);
        } finally {
            setLoading(false);
        }
    }, [propertyId]);

    useEffect(() => {
        fetchAvailability();
    }, [fetchAvailability]);

    // Build sets for calendar highlighting
    const bookedDates: Date[] = [];
    const blockedDates: Date[] = [];

    for (const r of ranges) {
        const start = new Date(r.startDate);
        const end = new Date(r.endDate);
        const current = new Date(start);
        while (current <= end) {
            const d = new Date(current);
            if (r.type === 'booking') bookedDates.push(d);
            else blockedDates.push(d);
            current.setDate(current.getDate() + 1);
        }
    }

    const handleBlock = async () => {
        if (!blockStart || !blockEnd) return;
        setActionLoading(true);
        try {
            await api.post(`/properties/${propertyId}/block-dates`, {
                startDate: blockStart.toISOString(),
                endDate: blockEnd.toISOString(),
                reason: blockReason,
            });
            setToast({ msg: 'Dates blocked successfully', type: 'success' });
            setBlockStart(null);
            setBlockEnd(null);
            await fetchAvailability();
        } catch (err: unknown) {
            const e = err as { response?: { data?: { message?: string } } };
            setToast({ msg: e.response?.data?.message || 'Failed to block dates', type: 'error' });
        } finally {
            setActionLoading(false);
        }
    };

    const handleUnblock = async (blockId: string) => {
        setActionLoading(true);
        try {
            await api.delete(`/properties/${propertyId}/unblock-dates`, {
                data: { blockId },
            });
            setToast({ msg: 'Dates unblocked successfully', type: 'success' });
            await fetchAvailability();
        } catch {
            setToast({ msg: 'Failed to unblock dates', type: 'error' });
        } finally {
            setActionLoading(false);
        }
    };

    // Custom day class for react-datepicker
    const getDayClassName = (date: Date): string => {
        const dateStr = date.toDateString();
        if (bookedDates.some((d) => d.toDateString() === dateStr)) {
            return 'rdp-booked';
        }
        if (blockedDates.some((d) => d.toDateString() === dateStr)) {
            return 'rdp-blocked';
        }
        return 'rdp-available';
    };

    const blockedRanges = ranges.filter((r) => r.type === 'blocked');
    const bookingRanges = ranges.filter((r) => r.type === 'booking');

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Toast */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium ${
                            toast.type === 'success'
                                ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                                : 'bg-red-500/10 border border-red-500/20 text-red-400'
                        }`}
                    >
                        {toast.type === 'success' ? (
                            <CheckCircle className="w-4 h-4" />
                        ) : (
                            <AlertCircle className="w-4 h-4" />
                        )}
                        {toast.msg}
                        <button
                            onClick={() => setToast(null)}
                            className="ml-auto text-xs opacity-60 hover:opacity-100"
                        >
                            ✕
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Calendar */}
                <div>
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-amber-400" />
                        Availability Calendar
                    </h3>

                    {/* Legend */}
                    <div className="flex flex-wrap gap-4 mb-4 text-xs">
                        <span className="flex items-center gap-1.5">
                            <span className="w-3 h-3 rounded-full bg-green-500/60" /> Available
                        </span>
                        <span className="flex items-center gap-1.5">
                            <span className="w-3 h-3 rounded-full bg-red-500/60" /> Booked
                        </span>
                        <span className="flex items-center gap-1.5">
                            <span className="w-3 h-3 rounded-full bg-slate-500/60" /> Blocked
                        </span>
                    </div>

                    <div className="availability-calendar-wrapper">
                        <DatePicker
                            inline
                            monthsShown={2}
                            minDate={new Date()}
                            dayClassName={getDayClassName}
                            onChange={() => {
                                /* read-only display calendar */
                            }}
                        />
                    </div>
                </div>

                {/* Controls */}
                <div className="space-y-6">
                    {/* Block Dates */}
                    <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-5 space-y-4">
                        <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                            <Lock className="w-4 h-4 text-amber-400" />
                            Block Date Range
                        </h4>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs text-slate-400 mb-1">
                                    Start Date
                                </label>
                                <DatePicker
                                    selected={blockStart}
                                    onChange={(d: Date | null) => setBlockStart(d)}
                                    minDate={new Date()}
                                    placeholderText="Start"
                                    dateFormat="MMM dd, yyyy"
                                    className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-2 text-sm text-white
                                        placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-slate-400 mb-1">
                                    End Date
                                </label>
                                <DatePicker
                                    selected={blockEnd}
                                    onChange={(d: Date | null) => setBlockEnd(d)}
                                    minDate={blockStart || new Date()}
                                    placeholderText="End"
                                    dateFormat="MMM dd, yyyy"
                                    className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-2 text-sm text-white
                                        placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs text-slate-400 mb-1">Reason</label>
                            <select
                                value={blockReason}
                                onChange={(e) => setBlockReason(e.target.value)}
                                className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-2 text-sm text-white
                                    focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                            >
                                <option value="maintenance">Maintenance</option>
                                <option value="renovation">Renovation</option>
                                <option value="private-use">Private Use</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <button
                            onClick={handleBlock}
                            disabled={!blockStart || !blockEnd || actionLoading}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/10
                                border border-amber-500/20 text-amber-400 text-sm font-medium
                                hover:bg-amber-500/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            {actionLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Lock className="w-4 h-4" />
                            )}
                            Mark as Blocked
                        </button>
                    </div>

                    {/* Blocked list */}
                    {blockedRanges.length > 0 && (
                        <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-5 space-y-3">
                            <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                                <Wrench className="w-4 h-4 text-slate-400" />
                                Blocked Periods ({blockedRanges.length})
                            </h4>
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                                {blockedRanges.map((r) => (
                                    <div
                                        key={r._id}
                                        className="flex items-center justify-between bg-slate-800/50 rounded-lg px-3 py-2"
                                    >
                                        <div className="text-sm">
                                            <span className="text-white">
                                                {new Date(r.startDate).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                })}
                                                {' → '}
                                                {new Date(r.endDate).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric',
                                                })}
                                            </span>
                                            <span className="text-slate-500 ml-2 text-xs capitalize">
                                                ({r.reason})
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => r._id && handleUnblock(r._id)}
                                            disabled={actionLoading}
                                            className="p-1.5 rounded-lg text-slate-400 hover:text-green-400 hover:bg-green-500/10 transition-all"
                                            title="Unblock"
                                        >
                                            <Unlock className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Bookings list */}
                    {bookingRanges.length > 0 && (
                        <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-5 space-y-3">
                            <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-red-400" />
                                Active Bookings ({bookingRanges.length})
                            </h4>
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                                {bookingRanges.map((r, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center bg-slate-800/50 rounded-lg px-3 py-2 text-sm"
                                    >
                                        <span className="text-white">
                                            {new Date(r.startDate).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                            })}
                                            {' → '}
                                            {new Date(r.endDate).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric',
                                            })}
                                        </span>
                                        <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-red-500/10 text-red-400 capitalize">
                                            {r.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
