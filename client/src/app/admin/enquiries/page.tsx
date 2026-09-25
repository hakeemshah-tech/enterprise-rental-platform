'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    Loader2,
    MessageSquare,
    Mail,
    Clock,
    Home,
    Search,
    ExternalLink,
    ChevronLeft,
    ChevronRight,
    Phone,
    X,
} from 'lucide-react';
import api from '@/lib/api';
import type { Enquiry, Property, PaginationInfo } from '@/types';

const STATUSES = [
    { value: '', label: 'All Statuses' },
    { value: 'new', label: 'New' },
    { value: 'read', label: 'Read' },
    { value: 'responded', label: 'Responded' },
    { value: 'closed', label: 'Closed' },
];

const STATUS_COLORS: Record<string, string> = {
    new: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    read: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
    responded: 'text-green-400 bg-green-500/10 border-green-500/20',
    closed: 'text-slate-400 bg-slate-500/10 border-slate-500/20',
};

const ITEMS_PER_PAGE = 15;

export default function AdminEnquiriesPage() {
    const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState<PaginationInfo | null>(null);

    // Filter state
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [propertyFilter, setPropertyFilter] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    // Properties list for filter dropdown
    const [properties, setProperties] = useState<{ _id: string; title: string }[]>([]);

    // Debounced search
    const [debouncedSearch, setDebouncedSearch] = useState('');

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 400);
        return () => clearTimeout(timer);
    }, [search]);

    // Fetch properties for filter dropdown
    useEffect(() => {
        const fetchProperties = async () => {
            try {
                const { data: res } = await api.get('/properties?limit=100&sort=title');
                setProperties(
                    (res.data || []).map((p: Property) => ({ _id: p._id, title: p.title }))
                );
            } catch {
                setProperties([]);
            }
        };
        fetchProperties();
    }, []);

    // Fetch enquiries
    const fetchEnquiries = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.set('page', String(currentPage));
            params.set('limit', String(ITEMS_PER_PAGE));
            if (statusFilter) params.set('status', statusFilter);
            if (propertyFilter) params.set('property', propertyFilter);
            if (debouncedSearch) params.set('search', debouncedSearch);
            if (startDate) params.set('startDate', startDate);
            if (endDate) params.set('endDate', endDate);

            const { data: res } = await api.get(`/enquiries?${params.toString()}`);
            setEnquiries(res.data || []);
            setPagination(res.pagination || null);
        } catch {
            setEnquiries([]);
            setPagination(null);
        } finally {
            setLoading(false);
        }
    }, [currentPage, statusFilter, propertyFilter, debouncedSearch, startDate, endDate]);

    useEffect(() => {
        fetchEnquiries();
    }, [fetchEnquiries]);

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [statusFilter, propertyFilter, debouncedSearch, startDate, endDate]);

    const updateStatus = async (id: string, status: string) => {
        try {
            await api.put(`/enquiries/${id}`, { status });
            setEnquiries((prev) =>
                prev.map((e) => (e._id === id ? { ...e, status: status as Enquiry['status'] } : e))
            );
        } catch (err) {
            console.error('Update status failed:', err);
        }
    };

    const clearFilters = () => {
        setSearch('');
        setStatusFilter('');
        setPropertyFilter('');
        setStartDate('');
        setEndDate('');
        setCurrentPage(1);
    };

    const hasActiveFilters = search || statusFilter || propertyFilter || startDate || endDate;

    return (
        <div>
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-white">Enquiries</h1>
                <p className="text-sm text-slate-400 mt-1">
                    View and manage customer enquiries
                    {pagination && (
                        <span className="ml-2 text-slate-500">({pagination.total} total)</span>
                    )}
                </p>
            </div>

            {/* Search & Filters */}
            <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-4 mb-6 space-y-4">
                {/* Search bar */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by name, email, subject, or message..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full rounded-xl border border-slate-700 bg-slate-800/50 pl-10 pr-4 py-2.5
                            text-sm text-white placeholder-slate-500 transition-all duration-300
                            focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500
                            hover:border-slate-600"
                    />
                </div>

                {/* Filter row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {/* Status filter */}
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-sm
                            text-white appearance-none cursor-pointer transition-all duration-300
                            focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500
                            hover:border-slate-600"
                    >
                        {STATUSES.map((s) => (
                            <option key={s.value} value={s.value} className="bg-slate-800">
                                {s.label}
                            </option>
                        ))}
                    </select>

                    {/* Property filter */}
                    <select
                        value={propertyFilter}
                        onChange={(e) => setPropertyFilter(e.target.value)}
                        className="rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-sm
                            text-white appearance-none cursor-pointer transition-all duration-300
                            focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500
                            hover:border-slate-600"
                    >
                        <option value="" className="bg-slate-800">
                            All Properties
                        </option>
                        {properties.map((p) => (
                            <option key={p._id} value={p._id} className="bg-slate-800">
                                {p.title}
                            </option>
                        ))}
                    </select>

                    {/* Date range */}
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        placeholder="From date"
                        className="rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-sm
                            text-white transition-all duration-300
                            focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500
                            hover:border-slate-600 [color-scheme:dark]"
                    />
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        placeholder="To date"
                        className="rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-sm
                            text-white transition-all duration-300
                            focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500
                            hover:border-slate-600 [color-scheme:dark]"
                    />
                </div>

                {/* Clear filters */}
                {hasActiveFilters && (
                    <button
                        onClick={clearFilters}
                        className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-amber-400 transition-colors"
                    >
                        <X className="w-3.5 h-3.5" />
                        Clear all filters
                    </button>
                )}
            </div>

            {/* Loading */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
                </div>
            ) : enquiries.length > 0 ? (
                <>
                    {/* Enquiry Cards */}
                    <div className="space-y-4">
                        {enquiries.map((enquiry, i) => {
                            const linkedProperty =
                                enquiry.property &&
                                typeof enquiry.property === 'object' &&
                                'title' in enquiry.property
                                    ? enquiry.property
                                    : null;

                            return (
                                <motion.div
                                    key={enquiry._id}
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.04 }}
                                    className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-5
                                        hover:border-slate-700/50 transition-all"
                                >
                                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            {/* Name + Status */}
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="text-white font-medium">
                                                    {enquiry.name}
                                                </h3>
                                                <select
                                                    value={enquiry.status}
                                                    onChange={(e) =>
                                                        updateStatus(enquiry._id, e.target.value)
                                                    }
                                                    className={`text-[11px] font-medium px-2 py-0.5 rounded-md border
                                                        bg-transparent cursor-pointer
                                                        ${STATUS_COLORS[enquiry.status] || 'text-slate-400 border-slate-700'}
                                                    `}
                                                >
                                                    <option value="new">New</option>
                                                    <option value="read">Read</option>
                                                    <option value="responded">Responded</option>
                                                    <option value="closed">Closed</option>
                                                </select>
                                            </div>

                                            {/* Contact info */}
                                            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mb-3">
                                                <span className="flex items-center gap-1">
                                                    <Mail className="w-3 h-3" /> {enquiry.email}
                                                </span>
                                                {enquiry.phone && (
                                                    <span className="flex items-center gap-1">
                                                        <Phone className="w-3 h-3" />{' '}
                                                        {enquiry.phone}
                                                    </span>
                                                )}
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {new Date(
                                                        enquiry.createdAt
                                                    ).toLocaleDateString()}
                                                </span>
                                            </div>

                                            {/* Linked property with link to detail page */}
                                            {linkedProperty && (
                                                <Link
                                                    href={`/properties/${linkedProperty._id}`}
                                                    target="_blank"
                                                    className="inline-flex items-center gap-1.5 mb-2 px-2.5 py-1 rounded-lg
                                                        bg-amber-500/10 border border-amber-500/20
                                                        hover:bg-amber-500/20 transition-colors group"
                                                >
                                                    <Home className="w-3.5 h-3.5 text-amber-400" />
                                                    <span className="text-xs font-medium text-amber-400">
                                                        {linkedProperty.title}
                                                    </span>
                                                    <ExternalLink className="w-3 h-3 text-amber-400/50 group-hover:text-amber-400 transition-colors" />
                                                </Link>
                                            )}

                                            {/* Subject */}
                                            {enquiry.subject && (
                                                <p className="text-sm text-amber-400 font-medium mb-1">
                                                    {enquiry.subject}
                                                </p>
                                            )}

                                            {/* Message */}
                                            <p className="text-sm text-slate-300 leading-relaxed">
                                                {enquiry.message}
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* Pagination */}
                    {pagination && pagination.pages > 1 && (
                        <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-800/50">
                            <p className="text-xs text-slate-500">
                                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
                                {Math.min(currentPage * ITEMS_PER_PAGE, pagination.total)} of{' '}
                                {pagination.total}
                            </p>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                    disabled={currentPage <= 1}
                                    className="p-2 rounded-lg border border-slate-700 bg-slate-800/50 text-slate-400
                                        hover:text-white hover:border-slate-600 transition-all
                                        disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>

                                {Array.from({ length: pagination.pages }, (_, i) => i + 1)
                                    .filter((p) => {
                                        // Show first, last, current, and neighbors
                                        return (
                                            p === 1 ||
                                            p === pagination.pages ||
                                            Math.abs(p - currentPage) <= 1
                                        );
                                    })
                                    .reduce<(number | string)[]>((acc, p, idx, arr) => {
                                        if (idx > 0 && p - (arr[idx - 1] as number) > 1) {
                                            acc.push('...');
                                        }
                                        acc.push(p);
                                        return acc;
                                    }, [])
                                    .map((item, idx) =>
                                        typeof item === 'string' ? (
                                            <span
                                                key={`dots-${idx}`}
                                                className="text-slate-500 text-sm px-1"
                                            >
                                                ...
                                            </span>
                                        ) : (
                                            <button
                                                key={item}
                                                onClick={() => setCurrentPage(item)}
                                                className={`w-8 h-8 rounded-lg text-sm font-medium transition-all
                                                    ${
                                                        item === currentPage
                                                            ? 'bg-amber-500 text-black'
                                                            : 'border border-slate-700 bg-slate-800/50 text-slate-400 hover:text-white hover:border-slate-600'
                                                    }
                                                `}
                                            >
                                                {item}
                                            </button>
                                        )
                                    )}

                                <button
                                    onClick={() =>
                                        setCurrentPage((p) => Math.min(pagination.pages, p + 1))
                                    }
                                    disabled={currentPage >= pagination.pages}
                                    className="p-2 rounded-lg border border-slate-700 bg-slate-800/50 text-slate-400
                                        hover:text-white hover:border-slate-600 transition-all
                                        disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <div className="text-center py-20">
                    <MessageSquare className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                    <p className="text-xl text-slate-400">
                        {hasActiveFilters ? 'No enquiries match your filters' : 'No enquiries yet'}
                    </p>
                    {hasActiveFilters && (
                        <button
                            onClick={clearFilters}
                            className="mt-3 text-sm text-amber-400 hover:text-amber-300 transition-colors"
                        >
                            Clear filters
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
