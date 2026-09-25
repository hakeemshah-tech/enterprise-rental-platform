'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ICONS = LucideIcons as unknown as Record<string, React.ComponentType<any>>;

// Curated list of icons useful for real-estate / business / services
const ICON_LIST: string[] = [
    // Business & Finance
    'Building',
    'Building2',
    'Landmark',
    'Briefcase',
    'BadgeDollarSign',
    'Banknote',
    'CreditCard',
    'PiggyBank',
    'Wallet',
    'Receipt',
    'TrendingUp',
    'TrendingDown',
    'BarChart3',
    'LineChart',
    'PieChart',
    'Target',
    'Award',
    'Trophy',
    'Medal',
    'Crown',
    // Real Estate & Home
    'Home',
    'House',
    'Hotel',
    'Castle',
    'Warehouse',
    'DoorOpen',
    'DoorClosed',
    'Bed',
    'Bath',
    'Sofa',
    'Lamp',
    'ArmChair',
    'Tv',
    'Refrigerator',
    'CookingPot',
    'Key',
    'KeyRound',
    'Lock',
    'Unlock',
    'ShieldCheck',
    // People & Communication
    'Users',
    'UserCheck',
    'UserPlus',
    'Contact',
    'Handshake',
    'Phone',
    'PhoneCall',
    'Mail',
    'MessageCircle',
    'MessageSquare',
    'Globe',
    'Globe2',
    'Languages',
    'Megaphone',
    'Bell',
    // Location & Travel
    'MapPin',
    'Map',
    'Navigation',
    'Compass',
    'Plane',
    'Car',
    'Bus',
    'Ship',
    'Train',
    'Milestone',
    // Nature & Amenities
    'Sun',
    'Moon',
    'Star',
    'Sparkles',
    'Zap',
    'Waves',
    'Mountain',
    'TreePine',
    'Flower2',
    'Leaf',
    'Wifi',
    'Snowflake',
    'Flame',
    'Wind',
    'Droplets',
    // Tools & Services
    'Wrench',
    'Settings',
    'Hammer',
    'PaintBucket',
    'Paintbrush',
    'Ruler',
    'Scissors',
    'Package',
    'Boxes',
    'ClipboardList',
    'FileText',
    'FolderOpen',
    'Calendar',
    'Clock',
    'Timer',
    // General
    'Heart',
    'ThumbsUp',
    'Smile',
    'Eye',
    'Camera',
    'Image',
    'Video',
    'Music',
    'Lightbulb',
    'Rocket',
    'Shield',
    'CheckCircle',
    'CircleDot',
    'Gem',
    'Diamond',
    'Flag',
    'Bookmark',
    'Tag',
    'Hash',
    'AtSign',
    'ArrowRight',
    'ChevronRight',
    'ExternalLink',
    'Link',
    'Share2',
    'Gift',
    'PartyPopper',
    'Headphones',
    'Mic',
    'Volume2',
    'SquareStack',
    'Layers',
    'Layout',
    'Grid3x3',
    'Puzzle',
    // Transport & Parking
    'ParkingCircle',
    'Bike',
    'Footprints',
    'PersonStanding',
    // Security
    'ShieldAlert',
    'ShieldCheck',
    'Fingerprint',
    'ScanLine',
    // More useful
    'CircleCheck',
    'BadgeCheck',
    'Verified',
    'Infinity',
    'Activity',
    // Social Media
    'Instagram',
    'Facebook',
    'Twitter',
    'Youtube',
    'Linkedin',
    'Github',
    'Twitch',
    'Rss',
    'MessageCircle',
    'Send',
];

// Deduplicate and sort
const UNIQUE_ICONS = [...new Set(ICON_LIST)].sort();

interface IconPickerProps {
    value: string;
    onChange: (iconName: string) => void;
    label?: string;
}

export default function IconPicker({ value, onChange, label }: IconPickerProps) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const ref = useRef<HTMLDivElement>(null);

    // Close on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const filtered = useMemo(() => {
        if (!search) return UNIQUE_ICONS;
        const q = search.toLowerCase();
        return UNIQUE_ICONS.filter((name) => name.toLowerCase().includes(q));
    }, [search]);

    const SelectedIcon = value ? ICONS[value] : null;

    return (
        <div className="space-y-1.5" ref={ref}>
            {label && <label className="block text-sm font-medium text-slate-300">{label}</label>}

            <button
                type="button"
                onClick={() => setOpen(!open)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl border bg-slate-800/50
          text-sm transition-all w-full
          ${
              open
                  ? 'border-amber-500 ring-2 ring-amber-500/50'
                  : 'border-slate-700 hover:border-slate-600'
          }`}
            >
                {SelectedIcon ? (
                    <>
                        <SelectedIcon className="w-4 h-4 text-amber-400" />
                        <span className="text-white">{value}</span>
                    </>
                ) : (
                    <span className="text-slate-500">Select icon…</span>
                )}
                {value && (
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onChange('');
                        }}
                        className="ml-auto text-slate-500 hover:text-slate-300"
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                )}
            </button>

            {open && (
                <div className="absolute z-50 mt-1 w-80 max-h-72 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden">
                    {/* Search */}
                    <div className="p-2 border-b border-slate-800 sticky top-0 bg-slate-900">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                            <input
                                autoFocus
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search icons..."
                                className="w-full pl-8 pr-3 py-1.5 bg-slate-800/50 border border-slate-700 rounded-lg
                  text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
                            />
                        </div>
                    </div>

                    {/* Icon Grid */}
                    <div className="p-2 overflow-y-auto max-h-52 grid grid-cols-8 gap-1">
                        {filtered.map((name) => {
                            const Icon = ICONS[name];
                            if (!Icon) return null;
                            return (
                                <button
                                    key={name}
                                    type="button"
                                    title={name}
                                    onClick={() => {
                                        onChange(name);
                                        setOpen(false);
                                        setSearch('');
                                    }}
                                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all
                    ${
                        value === name
                            ? 'bg-amber-500/20 border border-amber-500/40 text-amber-400'
                            : 'hover:bg-slate-800 text-slate-400 hover:text-white border border-transparent'
                    }`}
                                >
                                    <Icon className="w-4 h-4" />
                                </button>
                            );
                        })}
                        {filtered.length === 0 && (
                            <p className="col-span-8 text-center text-xs text-slate-500 py-4">
                                No icons found
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

/**
 * Render a Lucide icon by name. Safe fallback to null if icon doesn't exist.
 */
export function DynamicIcon({
    name,
    className = 'w-5 h-5',
    fallback,
}: {
    name?: string;
    className?: string;
    fallback?: React.ReactNode;
}) {
    if (!name) return <>{fallback || null}</>;
    const Icon = ICONS[name];
    if (!Icon) return <>{fallback || null}</>;
    return <Icon className={className} />;
}
