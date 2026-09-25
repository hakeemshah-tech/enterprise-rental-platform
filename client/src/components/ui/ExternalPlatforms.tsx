'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, BadgeCheck } from 'lucide-react';
import { useSettings, type BookingPlatform } from '@/hooks/useSettings';
import { DynamicIcon } from '@/components/ui/IconPicker';

// ─── Hardcoded fallback ──────────────────────────────
// Rendered only until `GET /api/settings` resolves. Listing URLs are
// per-deployment data, so the checked-in defaults point at the platform
// home pages rather than at any specific property listing.
const FALLBACK_PLATFORMS: BookingPlatform[] = [
    {
        name: 'Airbnb',
        color: '#FF5A5F',
        badge: 'Superhost',
        cta: 'View on Airbnb',
        globalUrl: 'https://www.airbnb.com/',
        icon: '',
        logoUrl: '',
    },
    {
        name: 'Booking.com',
        color: '#003580',
        badge: 'Verified Listing',
        cta: 'View on Booking.com',
        globalUrl: 'https://www.booking.com/',
        icon: '',
        logoUrl: '',
    },
    {
        name: 'Agoda',
        color: '#5391F0',
        badge: 'Top Rated Host',
        cta: 'View on Agoda',
        globalUrl: 'https://www.agoda.com/',
        icon: '',
        logoUrl: '',
    },
];

// ─── Types ───────────────────────────────────────────
interface PropertyExternalLink {
    platformName: string;
    url: string;
}

interface Props {
    /** Per-property booking URLs (new array format) */
    links?: PropertyExternalLink[];
    /** Legacy per-property booking URLs (old object format) */
    legacyLinks?: { airbnb?: string; bookingCom?: string; agoda?: string };
    variant?: 'home' | 'property';
}

// ─── Animations ──────────────────────────────────────
const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.15, delayChildren: 0.1 } },
};

const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            duration: 0.5,
            ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
        },
    },
};

// ─── Helper: map legacy keys to platform names ───────
const LEGACY_KEY_MAP: Record<string, string> = {
    airbnb: 'Airbnb',
    bookingCom: 'Booking.com',
    agoda: 'Agoda',
};

// ─── Component ───────────────────────────────────────
export default function ExternalPlatforms({ links, legacyLinks, variant = 'home' }: Props) {
    const isHome = variant === 'home';
    const { settings, loading } = useSettings();

    // Wait for settings to load: avoid flashing fallback
    const platforms: BookingPlatform[] =
        settings?.bookingPlatforms && settings.bookingPlatforms.length > 0
            ? settings.bookingPlatforms
            : loading
              ? []
              : FALLBACK_PLATFORMS;

    // Don't render empty while loading
    if (loading && platforms.length === 0) return null;

    // Build per-property URL lookup by platform name
    const propertyUrlMap: Record<string, string> = {};
    if (links) {
        for (const l of links) {
            if (l.url) propertyUrlMap[l.platformName] = l.url;
        }
    }
    // Also support legacy { airbnb, bookingCom, agoda } format
    if (legacyLinks) {
        for (const [key, url] of Object.entries(legacyLinks)) {
            if (url && LEGACY_KEY_MAP[key]) {
                propertyUrlMap[LEGACY_KEY_MAP[key]] = url;
            }
        }
    }

    return (
        <section className={isHome ? 'py-20 px-4 sm:px-6 lg:px-8' : 'mt-10'}>
            <div className={isHome ? 'max-w-7xl mx-auto' : ''}>
                {/* Header */}
                <motion.div
                    className="text-center mb-10"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-50px' }}
                    transition={{ duration: 0.5 }}
                >
                    <h2
                        className={`font-bold text-white mb-2 ${isHome ? 'text-3xl sm:text-4xl' : 'text-xl sm:text-2xl'}`}
                    >
                        Book on Your Favorite Platform
                    </h2>
                    <p className="text-slate-400 text-sm sm:text-base max-w-lg mx-auto">
                        {isHome
                            ? "Find us on the world's most trusted travel platforms: same quality, your choice."
                            : 'Also available on these trusted platforms'}
                    </p>
                </motion.div>

                {/* Cards */}
                <motion.div
                    className={`grid gap-5 ${isHome ? `grid-cols-1 sm:grid-cols-${Math.min(platforms.length, 3)} max-w-4xl mx-auto` : `grid-cols-1 sm:grid-cols-${Math.min(platforms.length, 3)}`}`}
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-30px' }}
                >
                    {platforms.map((platform) => {
                        const url = propertyUrlMap[platform.name] || platform.globalUrl;
                        const bgColor = `${platform.color}14`;
                        const borderColor = `${platform.color}33`;
                        const ctaText = platform.cta || `View on ${platform.name}`;

                        return (
                            <motion.a
                                key={platform.name}
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                variants={cardVariants}
                                whileHover={{ y: -6, scale: 1.02, transition: { duration: 0.2 } }}
                                className="group relative rounded-2xl p-6 text-center backdrop-blur-xl transition-colors duration-300 cursor-pointer block"
                                style={{
                                    backgroundColor: 'rgba(255,255,255,0.03)',
                                    border: '1px solid rgba(255,255,255,0.06)',
                                    boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                                }}
                            >
                                {/* Badge */}
                                {platform.badge && (
                                    <div
                                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider mb-4"
                                        style={{
                                            backgroundColor: bgColor,
                                            color: platform.color,
                                            border: `1px solid ${borderColor}`,
                                        }}
                                    >
                                        <BadgeCheck className="w-3 h-3" />
                                        {platform.badge}
                                    </div>
                                )}

                                {/* Logo / Icon */}
                                <div
                                    className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center transition-transform duration-300 group-hover:scale-110 overflow-hidden"
                                    style={{
                                        backgroundColor: bgColor,
                                        color: platform.color,
                                        border: `1px solid ${borderColor}`,
                                    }}
                                >
                                    {platform.logoUrl ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={platform.logoUrl}
                                            alt={platform.name}
                                            className="w-9 h-9 object-contain"
                                        />
                                    ) : platform.icon ? (
                                        <DynamicIcon name={platform.icon} className="w-7 h-7" />
                                    ) : (
                                        <ExternalLink className="w-7 h-7" />
                                    )}
                                </div>

                                {/* Name */}
                                <h3 className="text-lg font-semibold text-white mb-4">
                                    {platform.name}
                                </h3>

                                {/* CTA Button */}
                                <div
                                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white transition-all duration-300 group-hover:gap-3"
                                    style={{ backgroundColor: platform.color }}
                                >
                                    {ctaText}
                                    <ExternalLink className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
                                </div>
                            </motion.a>
                        );
                    })}
                </motion.div>
            </div>
        </section>
    );
}
