'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Building,
    CalendarCheck,
    Users,
    DollarSign,
    TrendingUp,
    ArrowUp,
    ArrowDown,
    Loader2,
    MessageSquare,
} from 'lucide-react';
import api from '@/lib/api';
import { formatAED } from '@/lib/format';

interface StatCardProps {
    title: string;
    value: string | number;
    change?: string;
    trend?: 'up' | 'down';
    icon: React.ElementType;
    color: string;
    index: number;
}

function StatCard({ title, value, change, trend, icon: Icon, color, index }: StatCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-5
        hover:border-slate-700/50 transition-all duration-300"
        >
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm text-slate-400">{title}</p>
                    <p className="text-2xl font-bold text-white mt-1">{value}</p>
                    {change && (
                        <div
                            className={`flex items-center gap-1 mt-2 text-xs font-medium
              ${trend === 'up' ? 'text-green-400' : 'text-red-400'}`}
                        >
                            {trend === 'up' ? (
                                <ArrowUp className="w-3 h-3" />
                            ) : (
                                <ArrowDown className="w-3 h-3" />
                            )}
                            {change}
                        </div>
                    )}
                </div>
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
                    <Icon className="w-5 h-5" />
                </div>
            </div>
        </motion.div>
    );
}

interface DashboardStats {
    totalProperties: number;
    totalBookings: number;
    totalRevenue: number;
    totalEnquiries: number;
    recentBookings: Array<{
        _id: string;
        checkIn: string;
        totalPrice: number;
        status: string;
        user?: { name: string; email: string };
        property?: { title: string };
    }>;
}

export default function AdminDashboardPage() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Fetch from multiple endpoints
                const [propRes, bookRes, enqRes] = await Promise.all([
                    api.get('/properties?limit=1'),
                    api.get('/bookings/admin/all?limit=5&sort=-createdAt'),
                    api.get('/enquiries?limit=1'),
                ]);

                const totalProperties = propRes.data.pagination?.total || 0;
                const bookings = bookRes.data.data || [];
                const totalBookings = bookRes.data.pagination?.total || 0;
                const totalEnquiries = enqRes.data.pagination?.total || 0;
                const totalRevenue = bookings.reduce(
                    (sum: number, b: { totalPrice: number }) => sum + (b.totalPrice || 0),
                    0
                );

                setStats({
                    totalProperties,
                    totalBookings,
                    totalRevenue,
                    totalEnquiries,
                    recentBookings: bookings.slice(0, 5),
                });
            } catch {
                setStats({
                    totalProperties: 0,
                    totalBookings: 0,
                    totalRevenue: 0,
                    totalEnquiries: 0,
                    recentBookings: [],
                });
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
            </div>
        );
    }

    const statCards = [
        {
            title: 'Total Properties',
            value: stats?.totalProperties || 0,
            icon: Building,
            color: 'bg-blue-500/10 text-blue-400',
        },
        {
            title: 'Total Bookings',
            value: stats?.totalBookings || 0,
            icon: CalendarCheck,
            color: 'bg-green-500/10 text-green-400',
        },
        {
            title: 'Total Revenue',
            value: formatAED(stats?.totalRevenue || 0),
            icon: DollarSign,
            color: 'bg-amber-500/10 text-amber-400',
        },
        {
            title: 'Enquiries',
            value: stats?.totalEnquiries || 0,
            icon: MessageSquare,
            color: 'bg-purple-500/10 text-purple-400',
        },
    ];

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-white">Dashboard</h1>
                <p className="text-sm text-slate-400 mt-1">
                    Overview of your vacation rental business
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {statCards.map((card, index) => (
                    <StatCard key={card.title} {...card} index={index} />
                ))}
            </div>

            {/* Recent Bookings */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-slate-900/50 border border-slate-800/50 rounded-2xl overflow-hidden"
            >
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/50">
                    <h3 className="text-white font-semibold">Recent Bookings</h3>
                    <TrendingUp className="w-4 h-4 text-amber-500" />
                </div>

                {stats?.recentBookings.length ? (
                    <div className="divide-y divide-slate-800/50">
                        {stats.recentBookings.map((booking) => {
                            const statusColor: Record<string, string> = {
                                pending: 'text-yellow-400 bg-yellow-500/10',
                                confirmed: 'text-green-400 bg-green-500/10',
                                cancelled: 'text-red-400 bg-red-500/10',
                                completed: 'text-blue-400 bg-blue-500/10',
                            };
                            return (
                                <div
                                    key={booking._id}
                                    className="flex items-center justify-between px-6 py-3.5 hover:bg-white/[0.02] transition-colors"
                                >
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-white font-medium truncate">
                                            {booking.property?.title || 'Untitled Property'}
                                        </p>
                                        <p className="text-xs text-slate-400">
                                            {booking.user?.name || 'Guest'} •{' '}
                                            {new Date(booking.checkIn).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3 ml-4">
                                        <span
                                            className={`text-xs font-medium px-2 py-0.5 rounded-md capitalize
                      ${statusColor[booking.status] || 'text-slate-400'}`}
                                        >
                                            {booking.status}
                                        </span>
                                        <span className="text-sm font-semibold text-white">
                                            {formatAED(booking.totalPrice)}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="px-6 py-10 text-center text-sm text-slate-500">
                        No bookings yet
                    </div>
                )}
            </motion.div>
        </div>
    );
}
