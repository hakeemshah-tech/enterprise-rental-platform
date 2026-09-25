'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    MapPin,
    ChevronRight,
    Shield,
    Star,
    Clock,
    Sparkles,
    ArrowRight,
} from 'lucide-react';
import PropertyCard from '@/components/cards/PropertyCard';
import Button from '@/components/ui/Button';
import api from '@/lib/api';
import type { Property } from '@/types';
import { COMPANY } from '@/lib/companyConfig';
import { useSettings } from '@/hooks/useSettings';
import ExternalPlatforms from '@/components/ui/ExternalPlatforms';

// ─── Hero Section ──────────────────────────────────
const HeroSection: React.FC = () => {
    const [search, setSearch] = useState('');
    const { settings } = useSettings();
    const [slideIdx, setSlideIdx] = useState(0);

    const slides = settings?.hero?.length
        ? settings.hero
        : [
              {
                  heading: 'Discover Your Perfect Getaway',
                  subheading: COMPANY.philosophy + ' Premium vacation homes across the UAE.',
                  imageUrl: '',
              },
          ];

    // Auto-rotate slides
    useEffect(() => {
        if (slides.length <= 1) return;
        const timer = setInterval(() => setSlideIdx((i) => (i + 1) % slides.length), 6000);
        return () => clearInterval(timer);
    }, [slides.length]);

    const currentSlide = slides[slideIdx] || slides[0];

    return (
        <section className="relative min-h-[90vh] flex items-center overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={slideIdx}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.8 }}
                        className="absolute inset-0 bg-cover bg-center"
                        style={{
                            backgroundImage: currentSlide.imageUrl
                                ? `url(${currentSlide.imageUrl})`
                                : 'url(https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1920&q=80)',
                            backgroundColor: '#0f172a',
                        }}
                    />
                </AnimatePresence>
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-slate-950/40" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
            </div>

            {/* Floating orbs */}
            <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl" />

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="max-w-2xl">
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <span
                            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium
              bg-amber-500/10 border border-amber-500/20 text-amber-400 mb-6"
                        >
                            <Sparkles className="w-3.5 h-3.5" />{' '}
                            {settings?.companyInfo?.companyName || COMPANY.brandName} -{' '}
                            {COMPANY.headquarters.city}, {COMPANY.headquarters.country}
                        </span>
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={slideIdx}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -15 }}
                                transition={{ duration: 0.5 }}
                            >
                                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
                                    {currentSlide.heading}
                                </h1>
                                {currentSlide.subheading && (
                                    <p className="mt-5 text-lg text-slate-300 leading-relaxed max-w-lg">
                                        {currentSlide.subheading}
                                    </p>
                                )}
                            </motion.div>
                        </AnimatePresence>

                        {/* Slide dots */}
                        {slides.length > 1 && (
                            <div className="flex gap-1.5 mt-6">
                                {slides.map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setSlideIdx(i)}
                                        className={`w-2 h-2 rounded-full transition-all ${i === slideIdx ? 'bg-amber-500 w-6' : 'bg-white/30 hover:bg-white/50'}`}
                                    />
                                ))}
                            </div>
                        )}
                    </motion.div>

                    {/* Search Bar */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="mt-8"
                    >
                        <div
                            className="flex flex-col sm:flex-row gap-3 bg-slate-900/60 backdrop-blur-xl
              border border-slate-700/50 rounded-2xl p-3 max-w-xl"
                        >
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search by city, country, or property name..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl
                    pl-11 pr-4 py-3 text-sm text-white placeholder-slate-500
                    focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500
                    transition-all"
                                />
                            </div>
                            <Link
                                href={
                                    search
                                        ? `/properties?search=${encodeURIComponent(search)}`
                                        : '/properties'
                                }
                            >
                                <Button size="lg" className="w-full sm:w-auto">
                                    <Search className="w-4 h-4" /> Explore
                                </Button>
                            </Link>
                        </div>
                    </motion.div>

                    {/* Stats */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                        className="mt-10 flex items-center gap-8"
                    >
                        {[
                            { label: 'Properties', value: '500+' },
                            { label: 'Happy Guests', value: '10k+' },
                            { label: 'Destinations', value: '50+' },
                        ].map((stat) => (
                            <div key={stat.label}>
                                <p className="text-2xl font-bold text-white">{stat.value}</p>
                                <p className="text-xs text-slate-400">{stat.label}</p>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

// ─── Features Section ──────────────────────────────
const FeaturesSection: React.FC = () => {
    const features = [
        {
            icon: Shield,
            title: 'Verified Properties',
            desc: 'Every listing is verified and inspected for quality and safety.',
        },
        {
            icon: Star,
            title: 'Premium Experience',
            desc: 'Curated luxury homes with world-class amenities.',
        },
        {
            icon: Clock,
            title: 'Instant Booking',
            desc: 'Book your dream stay in minutes with secure checkout.',
        },
    ];

    return (
        <section className="py-20 bg-slate-950">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {features.map((f, i) => (
                        <motion.div
                            key={f.title}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: i * 0.15 }}
                            className="bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-2xl p-6
                hover:border-amber-500/30 hover:bg-slate-900/70 transition-all duration-500 group"
                        >
                            <div
                                className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20
                border border-amber-500/20 flex items-center justify-center mb-4
                group-hover:from-amber-500/30 group-hover:to-orange-500/30 transition-all"
                            >
                                <f.icon className="w-6 h-6 text-amber-400" />
                            </div>
                            <h3 className="text-white font-semibold text-lg">{f.title}</h3>
                            <p className="text-sm text-slate-400 mt-2 leading-relaxed">{f.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

// ─── Featured Properties Section ───────────────────
const FeaturedSection: React.FC = () => {
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFeatured = async () => {
            try {
                const { data: res } = await api.get('/properties/featured');
                setProperties(res.data || []);
            } catch {
                // Use placeholder data for demo
                setProperties([]);
            } finally {
                setLoading(false);
            }
        };
        fetchFeatured();
    }, []);

    return (
        <section className="py-20 bg-slate-950/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-end justify-between mb-10">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                    >
                        <span className="text-amber-400 text-sm font-medium uppercase tracking-wider">
                            Handpicked for you
                        </span>
                        <h2 className="text-3xl lg:text-4xl font-bold text-white mt-2">
                            Featured Properties
                        </h2>
                    </motion.div>
                    <Link
                        href="/properties"
                        className="hidden sm:flex items-center gap-1 text-sm font-medium text-amber-400
              hover:text-amber-300 transition-colors"
                    >
                        View All <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map((i) => (
                            <div
                                key={i}
                                className="bg-slate-900/50 border border-slate-800/50 rounded-2xl overflow-hidden"
                            >
                                <div className="aspect-[4/3] bg-slate-800 animate-pulse" />
                                <div className="p-4 space-y-3">
                                    <div className="h-5 bg-slate-800 rounded animate-pulse w-3/4" />
                                    <div className="h-4 bg-slate-800 rounded animate-pulse w-1/2" />
                                    <div className="h-4 bg-slate-800 rounded animate-pulse w-full" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : properties.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {properties.map((property, index) => (
                            <PropertyCard key={property._id} property={property} index={index} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <p className="text-slate-400">
                            No featured properties yet. Check back soon!
                        </p>
                        <Link href="/properties">
                            <Button variant="outline" className="mt-4">
                                Browse All Properties <ChevronRight className="w-4 h-4" />
                            </Button>
                        </Link>
                    </div>
                )}

                <div className="sm:hidden text-center mt-8">
                    <Link href="/properties">
                        <Button variant="outline">
                            View All Properties <ArrowRight className="w-4 h-4" />
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    );
};

// ─── CTA Section ───────────────────────────────────
const CTASection: React.FC = () => (
    <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="relative overflow-hidden rounded-3xl bg-gradient-to-r
          from-amber-500/10 via-orange-500/10 to-amber-500/10
          border border-amber-500/20 p-12 lg:p-16 text-center"
            >
                <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl" />
                <div className="relative">
                    <h2 className="text-3xl lg:text-4xl font-bold text-white">
                        Ready to Find Your Dream Stay?
                    </h2>
                    <p className="mt-4 text-lg text-slate-300 max-w-xl mx-auto">
                        Browse our collection of luxury vacation homes and start planning your next
                        unforgettable experience.
                    </p>
                    <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/properties">
                            <Button size="lg">
                                Browse Properties <ArrowRight className="w-4 h-4" />
                            </Button>
                        </Link>
                        <Link href="/register">
                            <Button variant="outline" size="lg">
                                Create Account
                            </Button>
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    </section>
);

// ─── Home Page ─────────────────────────────────────
export default function HomePage() {
    return (
        <>
            <HeroSection />
            <FeaturesSection />
            <FeaturedSection />
            <CTASection />
            <ExternalPlatforms variant="home" />
        </>
    );
}
