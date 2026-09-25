'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, X, Loader2 } from 'lucide-react';
import PropertyCard from '@/components/cards/PropertyCard';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import Input from '@/components/ui/Input';
import api from '@/lib/api';
import type { Property, PaginationInfo } from '@/types';

const PROPERTY_TYPES = [
    { value: '', label: 'All Types' },
    { value: 'villa', label: 'Villa' },
    { value: 'apartment', label: 'Apartment' },
    { value: 'cottage', label: 'Cottage' },
    { value: 'cabin', label: 'Cabin' },
    { value: 'penthouse', label: 'Penthouse' },
    { value: 'beach-house', label: 'Beach House' },
];

const SORT_OPTIONS = [
    { value: '-createdAt', label: 'Newest First' },
    { value: 'createdAt', label: 'Oldest First' },
    { value: 'price.perNight', label: 'Price: Low → High' },
    { value: '-price.perNight', label: 'Price: High → Low' },
];

function PropertiesContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const [properties, setProperties] = useState<Property[]>([]);
    const [pagination, setPagination] = useState<PaginationInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [showFilters, setShowFilters] = useState(false);

    // Filter state
    const [search, setSearch] = useState(searchParams.get('search') || '');
    const [type, setType] = useState(searchParams.get('type') || '');
    const [sort, setSort] = useState(searchParams.get('sort') || '-createdAt');
    const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
    const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
    const [bedrooms, setBedrooms] = useState(searchParams.get('bedrooms') || '');
    const [page, setPage] = useState(Number(searchParams.get('page')) || 1);

    const fetchProperties = useCallback(async () => {
        setLoading(true);
        try {
            const params: Record<string, string> = {
                page: String(page),
                limit: '12',
                sort,
            };
            if (search) params.search = search;
            if (type) params.type = type;
            if (minPrice) params.minPrice = minPrice;
            if (maxPrice) params.maxPrice = maxPrice;
            if (bedrooms) params.bedrooms = bedrooms;

            const { data: res } = await api.get('/properties', { params });
            setProperties(res.data || []);
            setPagination(res.pagination || null);
        } catch {
            setProperties([]);
        } finally {
            setLoading(false);
        }
    }, [page, sort, search, type, minPrice, maxPrice, bedrooms]);

    useEffect(() => {
        fetchProperties();
    }, [fetchProperties]);

    const applyFilters = () => {
        setPage(1);
        fetchProperties();
        setShowFilters(false);
    };

    const resetFilters = () => {
        setSearch('');
        setType('');
        setSort('-createdAt');
        setMinPrice('');
        setMaxPrice('');
        setBedrooms('');
        setPage(1);
        router.push('/properties');
    };

    return (
        <div className="min-h-screen bg-slate-950 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-3xl lg:text-4xl font-bold text-white">
                        Explore Properties
                    </h1>
                    <p className="text-slate-400 mt-2">
                        Find your perfect vacation home from our curated collection
                    </p>
                </motion.div>

                {/* Search & Filter Bar */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex flex-col sm:flex-row gap-3 mb-6"
                >
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by name, city, or country..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                            className="w-full bg-slate-900/50 border border-slate-800 rounded-xl
                pl-11 pr-4 py-3 text-sm text-white placeholder-slate-500
                focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500
                transition-all"
                        />
                    </div>
                    <div className="flex gap-3">
                        <Select
                            options={SORT_OPTIONS}
                            value={sort}
                            onChange={(e) => {
                                setSort(e.target.value);
                                setPage(1);
                            }}
                            className="!py-3"
                        />
                        <Button
                            variant="secondary"
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center gap-2"
                        >
                            <SlidersHorizontal className="w-4 h-4" /> Filters
                        </Button>
                    </div>
                </motion.div>

                {/* Expanded Filters */}
                {showFilters && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 mb-6"
                    >
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <Select
                                label="Property Type"
                                options={PROPERTY_TYPES}
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                            />
                            <Input
                                label="Min Price (AED)"
                                type="number"
                                placeholder="0"
                                value={minPrice}
                                onChange={(e) => setMinPrice(e.target.value)}
                            />
                            <Input
                                label="Max Price (AED)"
                                type="number"
                                placeholder="Any"
                                value={maxPrice}
                                onChange={(e) => setMaxPrice(e.target.value)}
                            />
                            <Input
                                label="Min Bedrooms"
                                type="number"
                                placeholder="Any"
                                value={bedrooms}
                                onChange={(e) => setBedrooms(e.target.value)}
                            />
                        </div>
                        <div className="flex justify-end gap-3 mt-4">
                            <Button variant="ghost" onClick={resetFilters}>
                                <X className="w-4 h-4" /> Reset
                            </Button>
                            <Button onClick={applyFilters}>Apply Filters</Button>
                        </div>
                    </motion.div>
                )}

                {/* Results */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
                    </div>
                ) : properties.length > 0 ? (
                    <>
                        <p className="text-sm text-slate-400 mb-6">
                            Showing {properties.length} of {pagination?.total || 0} properties
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {properties.map((property, index) => (
                                <PropertyCard
                                    key={property._id}
                                    property={property}
                                    index={index}
                                />
                            ))}
                        </div>

                        {/* Pagination */}
                        {pagination && pagination.pages > 1 && (
                            <div className="flex items-center justify-center gap-2 mt-10">
                                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(
                                    (p) => (
                                        <button
                                            key={p}
                                            onClick={() => setPage(p)}
                                            className={`w-10 h-10 rounded-xl text-sm font-medium transition-all
                        ${
                            p === page
                                ? 'bg-amber-500 text-black'
                                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:border-slate-600'
                        }`}
                                        >
                                            {p}
                                        </button>
                                    )
                                )}
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-20">
                        <p className="text-xl text-slate-400 mb-2">No properties found</p>
                        <p className="text-sm text-slate-500 mb-6">
                            Try adjusting your filters or search terms
                        </p>
                        <Button variant="outline" onClick={resetFilters}>
                            Reset Filters
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function PropertiesPage() {
    return (
        <Suspense
            fallback={
                <div className="flex items-center justify-center min-h-screen bg-slate-950">
                    <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
                </div>
            }
        >
            <PropertiesContent />
        </Suspense>
    );
}
