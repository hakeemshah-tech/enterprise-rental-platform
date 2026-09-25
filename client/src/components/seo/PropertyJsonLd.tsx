'use client';

import React from 'react';
import { COMPANY, SEO } from '@/lib/companyConfig';
import type { Property } from '@/types';

interface PropertyJsonLdProps {
    property: Property;
}

/**
 * Injects LodgingBusiness + SingleFamilyResidence JSON-LD for a property.
 * This helps Google show Rich Results for vacation rental searches.
 */
const PropertyJsonLd: React.FC<PropertyJsonLdProps> = ({ property }) => {
    const url = `${SEO.url}/properties/${property._id}`;
    const imageUrl = property.images[0]?.url || '';

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': ['LodgingBusiness', 'SingleFamilyResidence'],
        name: property.title,
        description: property.description,
        url,
        image: imageUrl,
        address: {
            '@type': 'PostalAddress',
            streetAddress: property.location.address,
            addressLocality: property.location.city,
            addressRegion: property.location.state || '',
            addressCountry: property.location.country,
            postalCode: property.location.zipCode || '',
        },
        ...(property.location.coordinates
            ? {
                  geo: {
                      '@type': 'GeoCoordinates',
                      latitude: property.location.coordinates.lat,
                      longitude: property.location.coordinates.lng,
                  },
              }
            : {}),
        numberOfBedrooms: property.bedrooms,
        numberOfBathroomsTotal: property.bathrooms,
        occupancy: {
            '@type': 'QuantitativeValue',
            value: property.maxGuests,
        },
        priceRange: `AED ${property.price.perNight}/night`,
        amenityFeature: property.amenities.map((a) => ({
            '@type': 'LocationFeatureSpecification',
            name: a.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
            value: true,
        })),
        ...(property.rating > 0
            ? {
                  aggregateRating: {
                      '@type': 'AggregateRating',
                      ratingValue: property.rating,
                      reviewCount: property.reviewCount,
                      bestRating: 5,
                  },
              }
            : {}),
        provider: {
            '@type': 'Organization',
            name: COMPANY.legalName,
            telephone: COMPANY.contact.phone,
            url: SEO.url,
        },
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
    );
};

export default PropertyJsonLd;
