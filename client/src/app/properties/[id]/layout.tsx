import type { Metadata } from 'next';
import { SEO, COMPANY } from '@/lib/companyConfig';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface PropertyData {
    _id: string;
    title: string;
    slug: string;
    description: string;
    type: string;
    price: { perNight: number };
    location: { address: string; city: string; country: string };
    bedrooms: number;
    bathrooms: number;
    maxGuests: number;
    images: { url: string; alt?: string }[];
    rating: number;
    reviewCount: number;
    amenities: string[];
}

async function getProperty(id: string): Promise<PropertyData | null> {
    try {
        const res = await fetch(`${API_URL}/properties/${id}`, {
            next: { revalidate: 60 },
        });
        if (!res.ok) return null;
        const json = await res.json();
        return json.data;
    } catch {
        return null;
    }
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ id: string }>;
}): Promise<Metadata> {
    const { id } = await params;
    const property = await getProperty(id);

    if (!property) {
        return {
            title: `Property Not Found | ${COMPANY.brandName}`,
            description: 'This property could not be found.',
        };
    }

    const title = `${property.title} in ${property.location.city} | ${COMPANY.brandName}`;
    const description = `${property.description.substring(0, 155)}… - ${property.bedrooms} bed, ${property.bathrooms} bath, up to ${property.maxGuests} guests. From AED ${property.price.perNight}/night. Book on ${COMPANY.brandName}.`;
    const imageUrl = property.images[0]?.url || '';
    const url = `${SEO.url}/properties/${id}`;

    return {
        title,
        description,
        keywords: `vacation home ${property.location.city}, short term rental ${property.location.city}, ${property.type} ${property.location.city}, ${COMPANY.brandName}, property management`,
        alternates: {
            canonical: url,
        },
        openGraph: {
            type: 'website',
            title,
            description,
            url,
            siteName: COMPANY.brandName,
            images: imageUrl
                ? [
                      {
                          url: imageUrl,
                          width: 1200,
                          height: 630,
                          alt: property.title,
                      },
                  ]
                : [],
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: imageUrl ? [imageUrl] : [],
        },
    };
}

export default function PropertyLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
