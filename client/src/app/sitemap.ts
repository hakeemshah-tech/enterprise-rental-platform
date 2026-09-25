import type { MetadataRoute } from 'next';
import { SEO } from '@/lib/companyConfig';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    // Static pages
    const staticPages: MetadataRoute.Sitemap = [
        { url: SEO.url, lastModified: new Date(), changeFrequency: 'weekly', priority: 1.0 },
        {
            url: `${SEO.url}/properties`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.9,
        },
        {
            url: `${SEO.url}/about`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.7,
        },
        {
            url: `${SEO.url}/contact`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.7,
        },
        {
            url: `${SEO.url}/login`,
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 0.3,
        },
        {
            url: `${SEO.url}/register`,
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 0.3,
        },
    ];

    // Dynamic property pages
    let propertyPages: MetadataRoute.Sitemap = [];
    try {
        const res = await fetch(`${API_URL}/properties?limit=1000&fields=_id,updatedAt`, {
            next: { revalidate: 3600 },
        });
        if (res.ok) {
            const json = await res.json();
            const properties: { _id: string; updatedAt?: string }[] = json.data || [];
            propertyPages = properties.map((p) => ({
                url: `${SEO.url}/properties/${p._id}`,
                lastModified: p.updatedAt ? new Date(p.updatedAt) : new Date(),
                changeFrequency: 'weekly' as const,
                priority: 0.8,
            }));
        }
    } catch {
        // If API is unreachable, return static pages only
    }

    return [...staticPages, ...propertyPages];
}
