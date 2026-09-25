/**
 * Enterprise Rental Platform: Single Source of Truth (SSOT)
 *
 * All company-wide data lives here. Change a value once and it
 * propagates to every footer, navbar, contact page, and SEO tag.
 *
 * ⚠️  SANITIZED FOR PUBLIC RELEASE
 *     Every identifying value below is a placeholder. At runtime these
 *     are only *fallbacks*; the live values are served by the
 *     Property API (`GET /api/settings`) and consumed through the
 *     `useSettings()` hook, so a deployment overrides them without a
 *     rebuild. Swap the placeholders here to re-brand the static shell.
 *
 * ⚠️  This object is frozen; any accidental mutation will throw
 *     in strict mode or silently fail.
 */

// ─── Company Info ────────────────────────────────────

export const COMPANY = Object.freeze({
    legalName: 'Enterprise Rental Platform L.L.C',
    parentEntity: 'Apex Property Group LLC',
    brandName: 'Enterprise Rental Platform',
    tagline: 'Vacation Homes Rental',
    established: 2020,
    expertiseYears: '20+',
    philosophy:
        'Your comfort is our priority, ensuring a seamless and pleasant experience at every step.',

    // ── Contact ───────────────────────────────────────
    contact: Object.freeze({
        phone: '+971 4 390 1234',
        phoneHref: 'tel:+97143901234',
        email: 'contact@apexproperty.ae',
        emailHref: 'mailto:contact@apexproperty.ae',
        workingHours: 'Mon – Fri: 9:00 AM – 6:00 PM',
    }),

    // ── Headquarters ──────────────────────────────────
    headquarters: Object.freeze({
        building: 'Apex Tower',
        area: 'Financial District',
        floor: 'Level 34',
        office: 'Office 3405',
        city: 'Dubai',
        country: 'United Arab Emirates',
        full: 'Apex Tower, Financial District, Level 34, Office 3405, Dubai, United Arab Emirates',
        mapCoords: Object.freeze({ lat: 25.212, lng: 55.279 }),
        googleMapsUrl: 'https://maps.google.com/?q=Dubai+International+Financial+Centre',
        embedUrl:
            'https://maps.google.com/maps?q=Dubai+International+Financial+Centre&t=&z=15&ie=UTF8&iwloc=&output=embed',
    }),

    // ── Services ──────────────────────────────────────
    coreServices: Object.freeze([
        'Residential Sales',
        'Commercial Leasing',
        'Property Management',
        'Vacation Home Rentals',
        'Investment Advisory',
    ] as const),

    // ── Key Projects ──────────────────────────────────
    keyProjects: Object.freeze(['The Marina Residences', 'Skyline Towers'] as const),

    // ── Partners ──────────────────────────────────────
    partners: Object.freeze([
        'Alpha Holdings',
        'Beta Partners',
        'Gamma Real Estate',
        'Delta Ventures',
    ] as const),

    // ── Social Links (placeholders) ───────────────────
    social: Object.freeze({
        instagram: '#',
        facebook: '#',
        twitter: '#',
    }),
});

// ─── SEO Defaults ────────────────────────────────────

/**
 * Canonical origin. Drives `metadataBase`, `sitemap.xml` and `robots.txt`,
 * so it must be an absolute URL. Set NEXT_PUBLIC_SITE_URL per environment.
 */
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const SEO = Object.freeze({
    siteName: `${COMPANY.brandName} | Vacation Homes Rental`,
    description: `Discover premium vacation homes and short-term rentals. ${COMPANY.legalName}, your trusted partner for property management, residential leasing, and luxury vacation rentals.`,
    keywords:
        'vacation rentals, property management, holiday homes, short term rental, luxury vacation homes, serviced apartments',
    url: SITE_URL,
});

// ─── Schema.org JSON-LD ──────────────────────────────

export function generateOrganizationSchema() {
    return {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: COMPANY.legalName,
        alternateName: COMPANY.parentEntity,
        url: SEO.url,
        telephone: COMPANY.contact.phone,
        email: COMPANY.contact.email,
        foundingDate: String(COMPANY.established),
        description: SEO.description,
        address: {
            '@type': 'PostalAddress',
            streetAddress: `${COMPANY.headquarters.building}, ${COMPANY.headquarters.area}, ${COMPANY.headquarters.floor}, ${COMPANY.headquarters.office}`,
            addressLocality: COMPANY.headquarters.city,
            addressCountry: COMPANY.headquarters.country,
        },
        geo: {
            '@type': 'GeoCoordinates',
            latitude: COMPANY.headquarters.mapCoords.lat,
            longitude: COMPANY.headquarters.mapCoords.lng,
        },
        sameAs: Object.values(COMPANY.social).filter((u) => u !== '#'),
    };
}
