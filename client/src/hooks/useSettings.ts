'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';

export interface HeroSlide {
    _id?: string;
    imageUrl: string;
    heading: string;
    subheading: string;
}

export interface Partner {
    _id?: string;
    name: string;
    logoUrl: string;
    icon: string;
}

export interface CompanyStats {
    yearsExperience: string;
    propertiesManaged: string;
    satisfiedClients: string;
    guestRating: string;
}

export interface CompanyInfo {
    companyName: string;
    tagline: string;
    phone: string;
    email: string;
    address: string;
    workingHours: string;
}

export interface CoreService {
    name: string;
    icon: string;
}

export interface AboutContent {
    philosophy: string;
    coreServices: CoreService[];
    keyProjects: string[];
}

export interface SocialLink {
    _id?: string;
    platform: string;
    url: string;
    icon: string;
}

export interface BookingPlatform {
    _id?: string;
    name: string;
    globalUrl: string;
    icon: string;
    logoUrl: string;
    color: string;
    badge: string;
    cta: string;
}

export interface AuditEntry {
    _id?: string;
    adminId: string;
    adminName: string;
    section: string;
    action: string;
    timestamp: string;
}

export interface SiteSettings {
    hero: HeroSlide[];
    chairmansNote: string;
    companyStats: CompanyStats;
    partners: Partner[];
    companyInfo: CompanyInfo;
    aboutContent: AboutContent;
    socialLinks?: SocialLink[];
    bookingPlatforms?: BookingPlatform[];
    googleMapsEmbedUrl?: string;
    auditLog?: AuditEntry[];
}

export function useSettings() {
    const [settings, setSettings] = useState<SiteSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchSettings = useCallback(async () => {
        try {
            const { data: res } = await api.get('/settings');
            setSettings(res.data);
            setError('');
        } catch {
            setError('Failed to load settings');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    const updateSettings = async (section: Partial<SiteSettings>) => {
        const { data: res } = await api.patch('/settings', section);
        setSettings(res.data);
        return res;
    };

    return { settings, loading, error, refetch: fetchSettings, updateSettings };
}
