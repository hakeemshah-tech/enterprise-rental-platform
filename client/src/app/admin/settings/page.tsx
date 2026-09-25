'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

/**
 * Upload all pending File objects. Returns a Map of blobUrl → serverUrl.
 */
async function uploadPendingFiles(
    pendingFiles: Map<string, File>,
    apiPost: typeof api.post
): Promise<Map<string, string>> {
    const urlMap = new Map<string, string>();
    for (const [blobUrl, file] of pendingFiles.entries()) {
        const formData = new FormData();
        formData.append('images', file);
        try {
            const { data: res } = await apiPost('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            if (res.data?.[0]?.url) {
                urlMap.set(blobUrl, res.data[0].url);
            }
        } catch {
            // Upload failed: URL stays as blob
        }
    }
    return urlMap;
}
import {
    Image as ImageIcon,
    FileText,
    BarChart3,
    Users,
    Clock,
    Share2,
    ExternalLink,
    Plus,
    Trash2,
    Save,
    Loader2,
    CheckCircle,
    AlertCircle,
    X,
    Upload,
} from 'lucide-react';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';
import api from '@/lib/api';
import {
    useSettings,
    type SiteSettings,
    type HeroSlide,
    type Partner,
    type CoreService,
    type SocialLink,
    type BookingPlatform,
} from '@/hooks/useSettings';
import IconPicker from '@/components/ui/IconPicker';

// ─── Tab Types ───────────────────────────────────────
type Tab = 'banner' | 'profile' | 'stats' | 'partners' | 'social' | 'platforms' | 'audit';

const TABS: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: 'banner', label: 'Banner Manager', icon: ImageIcon },
    { key: 'profile', label: 'Company Profile', icon: FileText },
    { key: 'stats', label: 'Stats', icon: BarChart3 },
    { key: 'partners', label: 'Partners', icon: Users },
    { key: 'social', label: 'Social Links', icon: Share2 },
    { key: 'platforms', label: 'Platforms', icon: ExternalLink },
    { key: 'audit', label: 'Audit Log', icon: Clock },
];

// ─── Notification Toast ──────────────────────────────
function Toast({
    message,
    type,
    onClose,
}: {
    message: string;
    type: 'success' | 'error';
    onClose: () => void;
}) {
    useEffect(() => {
        const timer = setTimeout(onClose, 4000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-20 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl border shadow-xl backdrop-blur-sm
        ${
            type === 'success'
                ? 'bg-green-500/10 border-green-500/30 text-green-400'
                : 'bg-red-500/10 border-red-500/30 text-red-400'
        }`}
        >
            {type === 'success' ? (
                <CheckCircle className="w-5 h-5" />
            ) : (
                <AlertCircle className="w-5 h-5" />
            )}
            <span className="text-sm font-medium">{message}</span>
            <button onClick={onClose} className="ml-2 hover:opacity-70">
                <X className="w-4 h-4" />
            </button>
        </motion.div>
    );
}

// ─── Banner Manager ──────────────────────────────────
function BannerEditor({
    hero,
    onChange,
    onSave,
    saving,
}: {
    hero: HeroSlide[];
    onChange: (h: HeroSlide[]) => void;
    onSave: (data?: { hero: HeroSlide[] }) => void;
    saving: boolean;
}) {
    // Pending files: blobUrl → File (uploaded only on save)
    const pendingFilesRef = useRef<Map<string, File>>(new Map());

    const addSlide = () => onChange([...hero, { imageUrl: '', heading: '', subheading: '' }]);
    const removeSlide = (i: number) => {
        const removed = hero[i];
        if (removed?.imageUrl?.startsWith('blob:')) {
            pendingFilesRef.current.delete(removed.imageUrl);
            URL.revokeObjectURL(removed.imageUrl);
        }
        onChange(hero.filter((_, idx) => idx !== i));
    };
    const updateSlide = (i: number, field: keyof HeroSlide, value: string) => {
        const updated = [...hero];
        updated[i] = { ...updated[i], [field]: value };
        onChange(updated);
    };

    const handleImagePick = (i: number, file: File) => {
        // Revoke old blob if replacing
        const oldUrl = hero[i]?.imageUrl;
        if (oldUrl?.startsWith('blob:')) {
            pendingFilesRef.current.delete(oldUrl);
            URL.revokeObjectURL(oldUrl);
        }
        const blobUrl = URL.createObjectURL(file);
        pendingFilesRef.current.set(blobUrl, file);
        updateSlide(i, 'imageUrl', blobUrl);
    };

    const handleSaveWithUpload = async () => {
        if (pendingFilesRef.current.size > 0) {
            const urlMap = await uploadPendingFiles(pendingFilesRef.current, api.post.bind(api));
            const updated = hero.map((slide) => {
                const serverUrl = urlMap.get(slide.imageUrl);
                return serverUrl ? { ...slide, imageUrl: serverUrl } : slide;
            });
            pendingFilesRef.current.clear();
            onChange(updated);
            // Pass resolved data directly to avoid stale state
            onSave({ hero: updated });
        } else {
            onSave();
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-white">Hero Banner Slides</h3>
                    <p className="text-sm text-slate-400">
                        Manage hero images and overlay text on the Home page.
                    </p>
                </div>
                <button
                    onClick={addSlide}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20
            text-amber-400 text-sm font-medium hover:bg-amber-500/20 transition-colors"
                >
                    <Plus className="w-4 h-4" /> Add Slide
                </button>
            </div>

            {hero.map((slide, i) => (
                <div
                    key={i}
                    className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-5 space-y-4"
                >
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-400 uppercase">
                            Slide {i + 1}
                        </span>
                        {hero.length > 1 && (
                            <button
                                onClick={() => removeSlide(i)}
                                className="text-red-400 hover:text-red-300 transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    {/* Image Upload Area */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">
                            Banner Image
                        </label>
                        {slide.imageUrl ? (
                            <div className="relative group rounded-xl overflow-hidden bg-slate-800 aspect-[16/7]">
                                <img
                                    src={slide.imageUrl}
                                    alt={slide.heading || 'Banner'}
                                    className="w-full h-full object-cover"
                                />
                                <div
                                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity
                                    flex items-center justify-center gap-3"
                                >
                                    <label
                                        className="px-3 py-1.5 rounded-lg bg-white/20 text-white text-sm font-medium
                                        cursor-pointer hover:bg-white/30 transition-colors backdrop-blur-sm"
                                    >
                                        Replace
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) handleImagePick(i, file);
                                            }}
                                        />
                                    </label>
                                    <button
                                        onClick={() => updateSlide(i, 'imageUrl', '')}
                                        className="px-3 py-1.5 rounded-lg bg-red-500/30 text-red-300 text-sm font-medium
                                            hover:bg-red-500/40 transition-colors backdrop-blur-sm"
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <label
                                className="relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed
                                aspect-[16/7] cursor-pointer transition-all duration-200
                                border-slate-700 bg-slate-800/30 hover:border-amber-500/30 hover:bg-slate-800/50"
                            >
                                <Upload className="w-8 h-8 text-slate-500" />
                                <span className="text-sm text-slate-400">
                                    Click to select banner image
                                </span>
                                <span className="text-xs text-slate-500">
                                    JPEG, PNG, WebP - Max 5 MB
                                </span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) handleImagePick(i, file);
                                    }}
                                />
                            </label>
                        )}
                    </div>

                    <Input
                        label="Heading"
                        placeholder="Discover Your Perfect Getaway"
                        value={slide.heading}
                        onChange={(e) => updateSlide(i, 'heading', e.target.value)}
                    />
                    <Input
                        label="Subheading"
                        placeholder="Premium vacation homes across the UAE"
                        value={slide.subheading}
                        onChange={(e) => updateSlide(i, 'subheading', e.target.value)}
                    />
                </div>
            ))}

            <div className="flex justify-end">
                <Button onClick={handleSaveWithUpload} loading={saving}>
                    <Save className="w-4 h-4" /> Save Banner
                </Button>
            </div>
        </div>
    );
}

// ─── Company Profile Editor ──────────────────────────
function ProfileEditor({
    companyInfo,
    chairmansNote,
    aboutContent,
    googleMapsEmbedUrl,
    onInfoChange,
    onNoteChange,
    onAboutChange,
    onSave,
    saving,
}: {
    companyInfo: SiteSettings['companyInfo'];
    chairmansNote: string;
    aboutContent: SiteSettings['aboutContent'];
    googleMapsEmbedUrl: string;
    onInfoChange: (c: SiteSettings['companyInfo']) => void;
    onNoteChange: (s: string) => void;
    onAboutChange: (a: SiteSettings['aboutContent']) => void;
    onSave: (mapsUrl: string) => void;
    saving: boolean;
}) {
    const [mapsUrl, setMapsUrl] = React.useState(googleMapsEmbedUrl);

    React.useEffect(() => {
        setMapsUrl(googleMapsEmbedUrl);
    }, [googleMapsEmbedUrl]);

    const handleSaveProfile = () => {
        onSave(mapsUrl);
    };
    return (
        <div className="space-y-8">
            {/* Contact Info */}
            <div>
                <h3 className="text-lg font-semibold text-white mb-1">Contact Information</h3>
                <p className="text-sm text-slate-400 mb-4">
                    This updates the Footer, Contact page, and all click-to-call buttons.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                        label="Company Name"
                        placeholder="Enterprise Rental Platform"
                        value={companyInfo.companyName || ''}
                        onChange={(e) =>
                            onInfoChange({ ...companyInfo, companyName: e.target.value })
                        }
                    />
                    <Input
                        label="Subheading / Tagline"
                        placeholder="Vacation Homes Rental"
                        value={companyInfo.tagline || ''}
                        onChange={(e) => onInfoChange({ ...companyInfo, tagline: e.target.value })}
                    />
                    <Input
                        label="Phone"
                        value={companyInfo.phone}
                        onChange={(e) => onInfoChange({ ...companyInfo, phone: e.target.value })}
                    />
                    <Input
                        label="Email"
                        type="email"
                        value={companyInfo.email}
                        onChange={(e) => onInfoChange({ ...companyInfo, email: e.target.value })}
                    />
                </div>
                <div className="mt-4 space-y-4">
                    <Textarea
                        label="Office Address"
                        rows={2}
                        value={companyInfo.address}
                        onChange={(e) => onInfoChange({ ...companyInfo, address: e.target.value })}
                    />
                    <Input
                        label="Working Hours"
                        value={companyInfo.workingHours}
                        onChange={(e) =>
                            onInfoChange({ ...companyInfo, workingHours: e.target.value })
                        }
                    />
                    <div>
                        <Input
                            label="Google Maps Embed URL"
                            placeholder="https://www.google.com/maps/embed?pb=..."
                            value={mapsUrl}
                            onChange={(e) => setMapsUrl(e.target.value)}
                        />
                        <p className="text-xs text-slate-500 mt-1">
                            Go to Google Maps → Share → Embed a map → Copy the src URL from the
                            iframe code.
                        </p>
                    </div>
                </div>
            </div>

            {/* Chairman's Note */}
            <div>
                <h3 className="text-lg font-semibold text-white mb-1">Chairman&apos;s Note</h3>
                <p className="text-sm text-slate-400 mb-4">Displayed on the About Us page.</p>
                <Textarea
                    rows={6}
                    value={chairmansNote}
                    onChange={(e) => onNoteChange(e.target.value)}
                />
            </div>

            {/* Philosophy */}
            <div>
                <h3 className="text-lg font-semibold text-white mb-1">Brand Philosophy</h3>
                <p className="text-sm text-slate-400 mb-4">Tagline used across the website.</p>
                <Input
                    value={aboutContent.philosophy}
                    onChange={(e) => onAboutChange({ ...aboutContent, philosophy: e.target.value })}
                />
            </div>

            {/* Core Services */}
            <div>
                <h3 className="text-lg font-semibold text-white mb-1">Core Services</h3>
                <p className="text-sm text-slate-400 mb-4">
                    Displayed on the About page services section. Pick an icon for each.
                </p>
                {aboutContent.coreServices.map((s, i) => (
                    <div
                        key={i}
                        className="flex items-start gap-2 mb-3 bg-slate-800/20 border border-slate-700/30 rounded-xl p-3"
                    >
                        <div className="w-36 flex-shrink-0 relative">
                            <IconPicker
                                label="Icon"
                                value={s.icon || ''}
                                onChange={(icon) => {
                                    const updated = [...aboutContent.coreServices];
                                    updated[i] = { ...updated[i], icon };
                                    onAboutChange({ ...aboutContent, coreServices: updated });
                                }}
                            />
                        </div>
                        <div className="flex-1">
                            <Input
                                label="Service Name"
                                value={s.name}
                                onChange={(e) => {
                                    const updated = [...aboutContent.coreServices];
                                    updated[i] = { ...updated[i], name: e.target.value };
                                    onAboutChange({ ...aboutContent, coreServices: updated });
                                }}
                            />
                        </div>
                        {aboutContent.coreServices.length > 1 && (
                            <button
                                onClick={() =>
                                    onAboutChange({
                                        ...aboutContent,
                                        coreServices: aboutContent.coreServices.filter(
                                            (_, j) => j !== i
                                        ),
                                    })
                                }
                                className="text-red-400 hover:text-red-300 p-2 mt-6"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                ))}
                <button
                    onClick={() =>
                        onAboutChange({
                            ...aboutContent,
                            coreServices: [...aboutContent.coreServices, { name: '', icon: '' }],
                        })
                    }
                    className="text-sm text-amber-400 hover:text-amber-300 mt-1"
                >
                    + Add Service
                </button>
            </div>

            <div className="flex justify-end">
                <Button onClick={handleSaveProfile} loading={saving}>
                    <Save className="w-4 h-4" /> Save Profile
                </Button>
            </div>
        </div>
    );
}

// ─── Stats Editor ────────────────────────────────────
function StatsEditor({
    stats,
    onChange,
    onSave,
    saving,
}: {
    stats: SiteSettings['companyStats'];
    onChange: (s: SiteSettings['companyStats']) => void;
    onSave: () => void;
    saving: boolean;
}) {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-white mb-1">Company Statistics</h3>
                <p className="text-sm text-slate-400 mb-4">
                    Shown on the About Us page in the Chairman section.
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                    label="Years of Experience"
                    value={stats.yearsExperience}
                    onChange={(e) => onChange({ ...stats, yearsExperience: e.target.value })}
                />
                <Input
                    label="Properties Managed"
                    value={stats.propertiesManaged}
                    onChange={(e) => onChange({ ...stats, propertiesManaged: e.target.value })}
                />
                <Input
                    label="Satisfied Clients"
                    value={stats.satisfiedClients}
                    onChange={(e) => onChange({ ...stats, satisfiedClients: e.target.value })}
                />
                <Input
                    label="Guest Rating"
                    value={stats.guestRating}
                    onChange={(e) => onChange({ ...stats, guestRating: e.target.value })}
                />
            </div>

            <div className="flex justify-end">
                <Button onClick={onSave} loading={saving}>
                    <Save className="w-4 h-4" /> Save Stats
                </Button>
            </div>
        </div>
    );
}

// ─── Partner Grid ────────────────────────────────────
function PartnerEditor({
    partners,
    onChange,
    onSave,
    saving,
}: {
    partners: Partner[];
    onChange: (p: Partner[]) => void;
    onSave: (data?: { partners: Partner[] }) => void;
    saving: boolean;
}) {
    // Pending files: blobUrl → File (uploaded only on save)
    const pendingFilesRef = useRef<Map<string, File>>(new Map());

    const addPartner = () => onChange([...partners, { name: '', logoUrl: '', icon: '' }]);
    const removePartner = (i: number) => {
        const removed = partners[i];
        if (removed?.logoUrl?.startsWith('blob:')) {
            pendingFilesRef.current.delete(removed.logoUrl);
            URL.revokeObjectURL(removed.logoUrl);
        }
        onChange(partners.filter((_, idx) => idx !== i));
    };
    const updatePartner = (i: number, field: keyof Partner, value: string) => {
        const updated = [...partners];
        updated[i] = { ...updated[i], [field]: value };
        onChange(updated);
    };

    const handleLogoPick = (i: number, file: File) => {
        const oldUrl = partners[i]?.logoUrl;
        if (oldUrl?.startsWith('blob:')) {
            pendingFilesRef.current.delete(oldUrl);
            URL.revokeObjectURL(oldUrl);
        }
        const blobUrl = URL.createObjectURL(file);
        pendingFilesRef.current.set(blobUrl, file);
        updatePartner(i, 'logoUrl', blobUrl);
    };

    const handleSaveWithUpload = async () => {
        if (pendingFilesRef.current.size > 0) {
            const urlMap = await uploadPendingFiles(pendingFilesRef.current, api.post.bind(api));
            const updated = partners.map((p) => {
                const serverUrl = urlMap.get(p.logoUrl);
                return serverUrl ? { ...p, logoUrl: serverUrl } : p;
            });
            pendingFilesRef.current.clear();
            onChange(updated);
            onSave({ partners: updated });
        } else {
            onSave();
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-white">Partner Directory</h3>
                    <p className="text-sm text-slate-400">
                        Manage partner names, icons, and logos for the About page.
                    </p>
                </div>
                <button
                    onClick={addPartner}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20
            text-amber-400 text-sm font-medium hover:bg-amber-500/20 transition-colors"
                >
                    <Plus className="w-4 h-4" /> Add Partner
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {partners.map((p, i) => (
                    <div
                        key={i}
                        className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4 space-y-3"
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-slate-400 uppercase">
                                Partner {i + 1}
                            </span>
                            <button
                                onClick={() => removePartner(i)}
                                className="text-red-400 hover:text-red-300"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                        <Input
                            label="Name"
                            value={p.name}
                            onChange={(e) => updatePartner(i, 'name', e.target.value)}
                        />

                        {/* Icon Picker */}
                        <div className="relative">
                            <IconPicker
                                label="Icon"
                                value={p.icon || ''}
                                onChange={(icon) => updatePartner(i, 'icon', icon)}
                            />
                        </div>

                        {/* Logo Upload */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1.5">
                                Logo (optional)
                            </label>
                            {p.logoUrl ? (
                                <div className="relative group rounded-xl overflow-hidden bg-slate-800 h-20 flex items-center justify-center">
                                    <img
                                        src={p.logoUrl}
                                        alt={p.name}
                                        className="max-h-16 max-w-full object-contain"
                                    />
                                    <div
                                        className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity
                                        flex items-center justify-center gap-2"
                                    >
                                        <label
                                            className="px-2 py-1 rounded-lg bg-white/20 text-white text-xs font-medium
                                            cursor-pointer hover:bg-white/30 transition-colors backdrop-blur-sm"
                                        >
                                            Replace
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={(e) => {
                                                    const f = e.target.files?.[0];
                                                    if (f) handleLogoPick(i, f);
                                                }}
                                            />
                                        </label>
                                        <button
                                            onClick={() => updatePartner(i, 'logoUrl', '')}
                                            className="px-2 py-1 rounded-lg bg-red-500/30 text-red-300 text-xs font-medium
                                            hover:bg-red-500/40 transition-colors backdrop-blur-sm"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <label
                                    className="relative flex flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed
                                    h-20 cursor-pointer transition-all duration-200
                                    border-slate-700 bg-slate-800/30 hover:border-amber-500/30 hover:bg-slate-800/50"
                                >
                                    <Upload className="w-5 h-5 text-slate-500" />
                                    <span className="text-xs text-slate-400">Upload logo</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        onChange={(e) => {
                                            const f = e.target.files?.[0];
                                            if (f) handleLogoPick(i, f);
                                        }}
                                    />
                                </label>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex justify-end">
                <Button onClick={handleSaveWithUpload} loading={saving}>
                    <Save className="w-4 h-4" /> Save Partners
                </Button>
            </div>
        </div>
    );
}

// ─── Audit Log ───────────────────────────────────────
function AuditLog({ entries }: { entries: SiteSettings['auditLog'] }) {
    if (!entries || entries.length === 0) {
        return (
            <div className="text-center py-12 text-slate-400">
                <Clock className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No changes recorded yet.</p>
            </div>
        );
    }

    return (
        <div>
            <h3 className="text-lg font-semibold text-white mb-4">Change History</h3>
            <div className="space-y-2">
                {[...entries].reverse().map((e, i) => (
                    <div
                        key={i}
                        className="flex items-start gap-3 p-3 bg-slate-800/30 border border-slate-700/50 rounded-xl"
                    >
                        <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Clock className="w-4 h-4 text-amber-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm text-white">
                                <span className="font-medium">{e.adminName}</span>{' '}
                                <span className="text-slate-400">{e.action}</span>{' '}
                                <span className="text-amber-400 font-medium">{e.section}</span>
                            </p>
                            <p className="text-xs text-slate-500 mt-0.5">
                                {new Date(e.timestamp).toLocaleString()}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── Social Links Editor ─────────────────────────────
function SocialLinksEditor({
    links,
    onChange,
    onSave,
    saving,
}: {
    links: SocialLink[];
    onChange: (l: SocialLink[]) => void;
    onSave: () => void;
    saving: boolean;
}) {
    const addLink = () => onChange([...links, { platform: '', url: '', icon: '' }]);
    const removeLink = (i: number) => onChange(links.filter((_, idx) => idx !== i));
    const updateLink = (i: number, field: keyof SocialLink, value: string) => {
        const updated = [...links];
        updated[i] = { ...updated[i], [field]: value };
        onChange(updated);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-white">Social Media Links</h3>
                    <p className="text-sm text-slate-400">
                        Manage social media icons and links shown in the Footer and across the site.
                    </p>
                </div>
                <button
                    onClick={addLink}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20
            text-amber-400 text-sm font-medium hover:bg-amber-500/20 transition-colors"
                >
                    <Plus className="w-4 h-4" /> Add Link
                </button>
            </div>

            {links.length === 0 && (
                <div className="text-center py-12 text-slate-400">
                    <Share2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">
                        No social links added yet. Click &quot;Add Link&quot; to get started.
                    </p>
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {links.map((link, i) => (
                    <div
                        key={i}
                        className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4 space-y-3"
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-slate-400 uppercase">
                                Link {i + 1}
                            </span>
                            <button
                                onClick={() => removeLink(i)}
                                className="text-red-400 hover:text-red-300"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                        <Input
                            label="Platform Name"
                            placeholder="e.g. Instagram, YouTube, TikTok"
                            value={link.platform}
                            onChange={(e) => updateLink(i, 'platform', e.target.value)}
                        />
                        <Input
                            label="URL"
                            placeholder="https://instagram.com/yourprofile"
                            value={link.url}
                            onChange={(e) => updateLink(i, 'url', e.target.value)}
                        />
                        <div className="relative">
                            <IconPicker
                                label="Icon"
                                value={link.icon || ''}
                                onChange={(icon) => updateLink(i, 'icon', icon)}
                            />
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex justify-end">
                <Button onClick={onSave} loading={saving}>
                    <Save className="w-4 h-4" /> Save Social Links
                </Button>
            </div>
        </div>
    );
}

// ─── Booking Platform Editor ─────────────────────────
function BookingPlatformEditor({
    platforms,
    onChange,
    onSave,
    saving,
}: {
    platforms: BookingPlatform[];
    onChange: (p: BookingPlatform[]) => void;
    onSave: (data: BookingPlatform[]) => void;
    saving: boolean;
}) {
    // Track pending logo File objects by platform index
    const [pendingLogos, setPendingLogos] = useState<
        Record<number, { file: File; preview: string }>
    >({});

    const addPlatform = () =>
        onChange([
            ...platforms,
            {
                name: '',
                globalUrl: '',
                icon: '',
                logoUrl: '',
                color: '#6366f1',
                badge: '',
                cta: '',
            },
        ]);
    const removePlatform = (i: number) => {
        // Clean up blob previews
        if (pendingLogos[i]?.preview) URL.revokeObjectURL(pendingLogos[i].preview);
        const newPending = { ...pendingLogos };
        delete newPending[i];
        // Re-index pending logos
        const reindexed: Record<number, { file: File; preview: string }> = {};
        for (const [key, val] of Object.entries(newPending)) {
            const k = Number(key);
            reindexed[k > i ? k - 1 : k] = val;
        }
        setPendingLogos(reindexed);
        onChange(platforms.filter((_, idx) => idx !== i));
    };
    const updatePlatform = (i: number, field: keyof BookingPlatform, value: string) => {
        const updated = [...platforms];
        updated[i] = { ...updated[i], [field]: value };
        onChange(updated);
    };

    const handleLogoSelect = (i: number, file: File) => {
        const preview = URL.createObjectURL(file);
        setPendingLogos((prev) => ({ ...prev, [i]: { file, preview } }));
        // Clear any existing server URL since we have a pending local file
        updatePlatform(i, 'logoUrl', '');
    };

    const removeLogo = (i: number) => {
        if (pendingLogos[i]?.preview) URL.revokeObjectURL(pendingLogos[i].preview);
        const newPending = { ...pendingLogos };
        delete newPending[i];
        setPendingLogos(newPending);
        updatePlatform(i, 'logoUrl', '');
    };

    const handleSaveWithUpload = async () => {
        // Upload any pending logo files first
        const updatedPlatforms = [...platforms];
        for (const [idxStr, { file }] of Object.entries(pendingLogos)) {
            const idx = Number(idxStr);
            if (idx >= updatedPlatforms.length) continue;
            const formData = new FormData();
            formData.append('images', file);
            try {
                const { data: res } = await api.post('/upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                if (res.data?.[0]?.url) {
                    updatedPlatforms[idx] = { ...updatedPlatforms[idx], logoUrl: res.data[0].url };
                }
            } catch {
                // Keep empty logoUrl on failure
            }
        }
        // Update local state with real URLs and save directly
        onChange(updatedPlatforms);
        setPendingLogos({});
        // Pass updated data directly to avoid stale closure
        onSave(updatedPlatforms);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-white">Booking Platforms</h3>
                    <p className="text-sm text-slate-400">
                        Manage booking platform cards shown on the home page and footer (e.g.
                        Airbnb, Booking.com, Agoda).
                    </p>
                </div>
                <button
                    onClick={addPlatform}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20
            text-amber-400 text-sm font-medium hover:bg-amber-500/20 transition-colors"
                >
                    <Plus className="w-4 h-4" /> Add Platform
                </button>
            </div>

            {platforms.length === 0 && (
                <div className="text-center py-12 text-slate-400">
                    <ExternalLink className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">
                        No platforms added yet. Click &quot;Add Platform&quot; to get started.
                    </p>
                </div>
            )}

            <div className="space-y-4">
                {platforms.map((platform, i) => {
                    const logoPreview = pendingLogos[i]?.preview || platform.logoUrl;
                    return (
                        <div
                            key={i}
                            className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-5 space-y-4"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    {platform.color && (
                                        <span
                                            className="w-3 h-3 rounded-full flex-shrink-0"
                                            style={{ backgroundColor: platform.color }}
                                        />
                                    )}
                                    <span className="text-sm font-medium text-white">
                                        {platform.name || `Platform ${i + 1}`}
                                    </span>
                                </div>
                                <button
                                    onClick={() => removePlatform(i)}
                                    className="text-red-400 hover:text-red-300"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Input
                                    label="Platform Name"
                                    placeholder="e.g. Airbnb, Booking.com"
                                    value={platform.name}
                                    onChange={(e) => updatePlatform(i, 'name', e.target.value)}
                                />
                                <Input
                                    label="Global URL"
                                    placeholder="https://..."
                                    value={platform.globalUrl}
                                    onChange={(e) => updatePlatform(i, 'globalUrl', e.target.value)}
                                />
                                <Input
                                    label="Badge Text"
                                    placeholder="e.g. Superhost"
                                    value={platform.badge}
                                    onChange={(e) => updatePlatform(i, 'badge', e.target.value)}
                                />
                                <Input
                                    label="CTA Text"
                                    placeholder="e.g. View on Airbnb"
                                    value={platform.cta}
                                    onChange={(e) => updatePlatform(i, 'cta', e.target.value)}
                                />
                                <Input
                                    label="Brand Color (hex)"
                                    placeholder="#FF5A5F"
                                    value={platform.color}
                                    onChange={(e) => updatePlatform(i, 'color', e.target.value)}
                                />
                                {/* Logo upload: deferred to save */}
                                <div className="space-y-1.5">
                                    <label className="block text-sm font-medium text-slate-300">
                                        Platform Logo
                                    </label>
                                    {logoPreview ? (
                                        <div className="flex items-center gap-3">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={logoPreview}
                                                alt={platform.name}
                                                className="w-10 h-10 rounded-lg object-contain bg-slate-800 border border-slate-700 p-1"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeLogo(i)}
                                                className="text-xs text-red-400 hover:text-red-300"
                                            >
                                                Remove logo
                                            </button>
                                        </div>
                                    ) : (
                                        <label className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-slate-600 bg-slate-800/30 cursor-pointer hover:border-amber-500/40 transition-colors text-sm text-slate-400">
                                            <Upload className="w-4 h-4 text-slate-500" />
                                            <span>Upload logo image</span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) handleLogoSelect(i, file);
                                                }}
                                            />
                                        </label>
                                    )}
                                </div>
                            </div>
                            <div className="relative">
                                <IconPicker
                                    label="Icon (used if no logo uploaded)"
                                    value={platform.icon || ''}
                                    onChange={(icon) => updatePlatform(i, 'icon', icon)}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="flex justify-end">
                <Button onClick={handleSaveWithUpload} loading={saving}>
                    <Save className="w-4 h-4" /> Save Platforms
                </Button>
            </div>
        </div>
    );
}
// ─── Main Settings Page ──────────────────────────────
export default function AdminSettingsPage() {
    const { settings, loading, updateSettings } = useSettings();
    const [activeTab, setActiveTab] = useState<Tab>('banner');
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    // Local editable state
    const [hero, setHero] = useState<HeroSlide[]>([]);
    const [chairmansNote, setChairmansNote] = useState('');
    const [companyStats, setCompanyStats] = useState<SiteSettings['companyStats']>({
        yearsExperience: '',
        propertiesManaged: '',
        satisfiedClients: '',
        guestRating: '',
    });
    const [partners, setPartners] = useState<Partner[]>([]);
    const [companyInfo, setCompanyInfo] = useState<SiteSettings['companyInfo']>({
        companyName: '',
        tagline: '',
        phone: '',
        email: '',
        address: '',
        workingHours: '',
    });
    const [googleMapsEmbedUrl, setGoogleMapsEmbedUrl] = useState('');
    const [aboutContent, setAboutContent] = useState<SiteSettings['aboutContent']>({
        philosophy: '',
        coreServices: [],
        keyProjects: [],
    });
    const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
    const [bookingPlatforms, setBookingPlatforms] = useState<BookingPlatform[]>([]);

    // Sync local state when settings load
    useEffect(() => {
        if (settings) {
            setHero(settings.hero || []);
            setChairmansNote(settings.chairmansNote || '');
            setCompanyStats(
                settings.companyStats || {
                    yearsExperience: '',
                    propertiesManaged: '',
                    satisfiedClients: '',
                    guestRating: '',
                }
            );
            setPartners(settings.partners || []);
            setCompanyInfo(
                settings.companyInfo || {
                    companyName: '',
                    tagline: '',
                    phone: '',
                    email: '',
                    address: '',
                    workingHours: '',
                }
            );
            setGoogleMapsEmbedUrl(settings.googleMapsEmbedUrl || '');
            setAboutContent(
                settings.aboutContent || { philosophy: '', coreServices: [], keyProjects: [] }
            );
            setSocialLinks(settings.socialLinks || []);
            setBookingPlatforms(settings.bookingPlatforms || []);
        }
    }, [settings]);

    const handleSave = async (section: Partial<SiteSettings>) => {
        setSaving(true);
        try {
            await updateSettings(section);
            setToast({ message: 'Settings saved successfully!', type: 'success' });
        } catch (err: unknown) {
            const e = err as { response?: { data?: { message?: string } } };
            setToast({
                message: e.response?.data?.message || 'Failed to save. Please try again.',
                type: 'error',
            });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {toast && <Toast {...toast} onClose={() => setToast(null)} />}

            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-white">Website Content</h1>
                <p className="text-sm text-slate-400 mt-1">
                    Manage your website&apos;s hero banners, company profile, statistics, and
                    partner listings.
                </p>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-slate-900/50 border border-slate-800/50 rounded-xl p-1 overflow-x-auto">
                {TABS.map(({ key, label, icon: Icon }) => (
                    <button
                        key={key}
                        onClick={() => setActiveTab(key)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200
              ${
                  activeTab === key
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
                    >
                        <Icon className="w-4 h-4" /> {label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-6"
            >
                {activeTab === 'banner' && (
                    <BannerEditor
                        hero={hero}
                        onChange={setHero}
                        onSave={(override) => handleSave(override ?? { hero })}
                        saving={saving}
                    />
                )}
                {activeTab === 'profile' && (
                    <ProfileEditor
                        companyInfo={companyInfo}
                        chairmansNote={chairmansNote}
                        aboutContent={aboutContent}
                        googleMapsEmbedUrl={googleMapsEmbedUrl}
                        onInfoChange={setCompanyInfo}
                        onNoteChange={setChairmansNote}
                        onAboutChange={setAboutContent}
                        onSave={(mapsUrl) =>
                            handleSave({
                                companyInfo,
                                chairmansNote,
                                aboutContent,
                                googleMapsEmbedUrl: mapsUrl,
                            })
                        }
                        saving={saving}
                    />
                )}
                {activeTab === 'stats' && (
                    <StatsEditor
                        stats={companyStats}
                        onChange={setCompanyStats}
                        onSave={() => handleSave({ companyStats })}
                        saving={saving}
                    />
                )}
                {activeTab === 'partners' && (
                    <PartnerEditor
                        partners={partners}
                        onChange={setPartners}
                        onSave={(override?: { partners: Partner[] }) =>
                            handleSave(override ?? { partners })
                        }
                        saving={saving}
                    />
                )}
                {activeTab === 'social' && (
                    <SocialLinksEditor
                        links={socialLinks}
                        onChange={setSocialLinks}
                        onSave={() => handleSave({ socialLinks })}
                        saving={saving}
                    />
                )}
                {activeTab === 'platforms' && (
                    <BookingPlatformEditor
                        platforms={bookingPlatforms}
                        onChange={setBookingPlatforms}
                        onSave={(data) => handleSave({ bookingPlatforms: data })}
                        saving={saving}
                    />
                )}
                {activeTab === 'audit' && <AuditLog entries={settings?.auditLog} />}
            </motion.div>
        </div>
    );
}
