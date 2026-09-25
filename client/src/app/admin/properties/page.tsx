'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, Loader2, Building, Eye, AlertTriangle } from 'lucide-react';
import Button from '@/components/ui/Button';
import api from '@/lib/api';
import { formatAED } from '@/lib/format';
import type { Property } from '@/types';

export default function AdminPropertiesPage() {
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleteTarget, setDeleteTarget] = useState<Property | null>(null);
    const [deleting, setDeleting] = useState(false);

    const fetchProperties = async () => {
        setLoading(true);
        try {
            const { data: res } = await api.get('/properties?limit=50');
            setProperties(res.data || []);
        } catch {
            setProperties([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProperties();
    }, []);

    const confirmDelete = async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            await api.delete(`/properties/${deleteTarget._id}`);
            setProperties((prev) => prev.filter((p) => p._id !== deleteTarget._id));
        } catch (err) {
            console.error('Delete failed:', err);
        } finally {
            setDeleting(false);
            setDeleteTarget(null);
        }
    };

    return (
        <div>
            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {deleteTarget && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    >
                        {/* Backdrop */}
                        <div
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={() => !deleting && setDeleteTarget(null)}
                        />

                        {/* Modal */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            transition={{ duration: 0.15 }}
                            className="relative bg-slate-900 border border-slate-700/50 rounded-2xl p-6 w-full max-w-md shadow-2xl"
                        >
                            <div className="flex flex-col items-center text-center">
                                <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
                                    <AlertTriangle className="w-6 h-6 text-red-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-white mb-1">
                                    Delete Property
                                </h3>
                                <p className="text-sm text-slate-400 mb-1">
                                    Are you sure you want to delete
                                </p>
                                <p className="text-sm font-medium text-white mb-4">
                                    &ldquo;{deleteTarget.title}&rdquo;?
                                </p>
                                <p className="text-xs text-slate-500 mb-6">
                                    This action cannot be undone. All images and data will be
                                    permanently removed.
                                </p>
                                <div className="flex gap-3 w-full">
                                    <button
                                        onClick={() => setDeleteTarget(null)}
                                        disabled={deleting}
                                        className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-300
                                            bg-slate-800 border border-slate-700 hover:bg-slate-700 transition-colors
                                            disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={confirmDelete}
                                        disabled={deleting}
                                        className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-white
                                            bg-red-600 hover:bg-red-500 transition-colors flex items-center justify-center gap-2
                                            disabled:opacity-50"
                                    >
                                        {deleting ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />{' '}
                                                Deleting...
                                            </>
                                        ) : (
                                            <>
                                                <Trash2 className="w-4 h-4" /> Delete
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-white">Properties</h1>
                    <p className="text-sm text-slate-400 mt-1">
                        Manage your vacation rental listings
                    </p>
                </div>
                <Link href="/admin/properties/new">
                    <Button>
                        <Plus className="w-4 h-4" /> Add Property
                    </Button>
                </Link>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
                </div>
            ) : properties.length > 0 ? (
                <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl overflow-hidden">
                    {/* Table Header */}
                    <div
                        className="hidden sm:grid grid-cols-12 gap-4 px-6 py-3 border-b border-slate-800/50
            text-xs font-medium text-slate-500 uppercase tracking-wider"
                    >
                        <div className="col-span-5">Property</div>
                        <div className="col-span-2">Type</div>
                        <div className="col-span-2">Price</div>
                        <div className="col-span-1">Status</div>
                        <div className="col-span-2 text-right">Actions</div>
                    </div>

                    {/* Rows */}
                    <div className="divide-y divide-slate-800/50">
                        {properties.map((property, index) => (
                            <motion.div
                                key={property._id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: index * 0.03 }}
                                className="grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-4 px-6 py-4
                  hover:bg-white/[0.02] transition-colors items-center"
                            >
                                {/* Property Info */}
                                <div className="sm:col-span-5 flex items-center gap-3">
                                    <div
                                        className="w-12 h-12 rounded-lg bg-cover bg-center flex-shrink-0"
                                        style={{
                                            backgroundImage: `url(${property.images?.[0]?.url || ''})`,
                                            backgroundColor: '#1e293b',
                                        }}
                                    />
                                    <div className="min-w-0">
                                        <p className="text-sm text-white font-medium truncate">
                                            {property.title}
                                        </p>
                                        <p className="text-xs text-slate-400 truncate">
                                            {property.location.city}, {property.location.country}
                                        </p>
                                    </div>
                                </div>

                                {/* Type */}
                                <div className="sm:col-span-2">
                                    <span
                                        className="px-2 py-0.5 text-xs font-medium bg-slate-800 text-slate-300
                    rounded-md capitalize"
                                    >
                                        {property.type}
                                    </span>
                                </div>

                                {/* Price */}
                                <div className="sm:col-span-2 text-sm text-white font-medium">
                                    {formatAED(property.price.perNight)}/night
                                </div>

                                {/* Status */}
                                <div className="sm:col-span-1">
                                    <span
                                        className={`inline-flex w-2 h-2 rounded-full ${
                                            property.status === 'active'
                                                ? 'bg-green-400'
                                                : property.status === 'inactive'
                                                  ? 'bg-red-400'
                                                  : 'bg-yellow-400'
                                        }`}
                                    />
                                </div>

                                {/* Actions */}
                                <div className="sm:col-span-2 flex items-center justify-end gap-2">
                                    <Link href={`/properties/${property._id}`}>
                                        <button
                                            className="p-2 rounded-lg text-slate-400 hover:text-white
                      hover:bg-white/5 transition-all"
                                            title="View"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </button>
                                    </Link>
                                    <Link href={`/admin/properties/${property._id}/edit`}>
                                        <button
                                            className="p-2 rounded-lg text-slate-400 hover:text-amber-400
                      hover:bg-amber-500/10 transition-all"
                                            title="Edit"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                    </Link>
                                    <button
                                        onClick={() => setDeleteTarget(property)}
                                        className="p-2 rounded-lg text-slate-400 hover:text-red-400
                      hover:bg-red-500/10 transition-all"
                                        title="Delete"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="text-center py-20">
                    <Building className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                    <p className="text-xl text-slate-400 mb-2">No properties yet</p>
                    <p className="text-sm text-slate-500 mb-6">
                        Add your first vacation rental property
                    </p>
                    <Link href="/admin/properties/new">
                        <Button>
                            <Plus className="w-4 h-4" /> Add Property
                        </Button>
                    </Link>
                </div>
            )}
        </div>
    );
}
