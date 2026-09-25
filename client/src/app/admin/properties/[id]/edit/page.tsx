'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ChevronLeft, Loader2 } from 'lucide-react';
import PropertyForm from '@/components/forms/PropertyForm';
import AvailabilityCalendar from '@/components/admin/AvailabilityCalendar';
import api from '@/lib/api';
import type { PropertyInput } from '@/lib/validations';

interface ImageFile {
    file?: File;
    url: string;
    alt: string;
    preview?: string;
}

export default function EditPropertyPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [initialData, setInitialData] = useState<
        (Partial<PropertyInput> & { images?: ImageFile[] }) | null
    >(null);

    useEffect(() => {
        const fetchProperty = async () => {
            try {
                const { data: res } = await api.get(`/properties/${id}`);
                const p = res.data;

                setInitialData({
                    title: p.title || '',
                    description: p.description || '',
                    type: p.type || 'apartment',
                    pricePerNight: p.price?.perNight || 0,
                    cleaningFee: p.price?.cleaningFee || 0,
                    serviceFee: p.price?.serviceFee || 0,
                    address: p.location?.address || '',
                    city: p.location?.city || '',
                    state: p.location?.state || '',
                    country: p.location?.country || '',
                    zipCode: p.location?.zipCode || '',
                    bedrooms: p.capacity?.bedrooms || 1,
                    bathrooms: p.capacity?.bathrooms || 1,
                    maxGuests: p.capacity?.maxGuests || 2,
                    amenities: p.amenities || [],
                    featured: p.featured || false,
                    status: p.status || 'active',
                    images: (p.images || []).map((img: { url: string; alt?: string }) => ({
                        url: img.url,
                        alt: img.alt || '',
                    })),
                    externalLinks: Array.isArray(p.externalLinks)
                        ? p.externalLinks
                        : p.externalLinks && typeof p.externalLinks === 'object'
                          ? Object.entries(p.externalLinks)
                                .filter(([, url]) => url)
                                .map(([key, url]) => ({
                                    platformName:
                                        key === 'bookingCom'
                                            ? 'Booking.com'
                                            : key.charAt(0).toUpperCase() + key.slice(1),
                                    url: url as string,
                                }))
                          : [],
                });
            } catch (err) {
                console.error('Failed to fetch property:', err);
                router.push('/admin/properties');
            } finally {
                setFetching(false);
            }
        };
        fetchProperty();
    }, [id, router]);

    const handleSubmit = async (data: PropertyInput, images: ImageFile[]) => {
        setLoading(true);
        try {
            // Step 1: Upload new images (ones with File objects)
            let uploadedImages: { url: string; alt: string }[] = [];

            const filesToUpload = images.filter((img) => img.file);
            const existingImages = images
                .filter((img) => !img.file && img.url)
                .map((img) => ({ url: img.url, alt: img.alt }));

            if (filesToUpload.length > 0) {
                const formData = new FormData();
                filesToUpload.forEach((img) => {
                    if (img.file) formData.append('images', img.file);
                });

                const uploadRes = await api.post('/upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                uploadedImages = uploadRes.data.data || [];
            }

            const allImages = [...existingImages, ...uploadedImages];

            // Step 2: Update property
            const payload = {
                title: data.title,
                description: data.description,
                type: data.type,
                price: {
                    perNight: data.pricePerNight,
                    cleaningFee: data.cleaningFee || 0,
                    serviceFee: data.serviceFee || 0,
                },
                location: {
                    address: data.address,
                    city: data.city,
                    state: data.state || '',
                    country: data.country,
                    zipCode: data.zipCode || '',
                },
                capacity: {
                    bedrooms: data.bedrooms,
                    bathrooms: data.bathrooms,
                    maxGuests: data.maxGuests,
                },
                amenities: data.amenities || [],
                images: allImages,
                featured: data.featured || false,
                status: data.status || 'active',
                externalLinks: data.externalLinks || [],
            };

            await api.put(`/properties/${id}`, payload);
            router.push('/admin/properties');
        } catch (err) {
            console.error('Update property failed:', err);
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
            </div>
        );
    }

    if (!initialData) {
        return (
            <div className="text-center py-20">
                <p className="text-xl text-slate-400 mb-2">Property not found</p>
                <button
                    onClick={() => router.push('/admin/properties')}
                    className="text-amber-400 hover:text-amber-300 text-sm"
                >
                    ← Back to properties
                </button>
            </div>
        );
    }

    return (
        <div>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-1 text-sm text-slate-400 hover:text-white mb-4 transition-colors"
                >
                    <ChevronLeft className="w-4 h-4" /> Back
                </button>
                <h1 className="text-2xl font-bold text-white">Edit Property</h1>
                <p className="text-sm text-slate-400 mt-1">
                    Update vacation rental listing details
                </p>
            </motion.div>

            <PropertyForm
                mode="edit"
                initialData={initialData}
                onSubmit={handleSubmit}
                isLoading={loading}
            />

            {/* Availability Calendar */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-8 bg-slate-900/50 border border-slate-800/50 rounded-2xl p-6"
            >
                <AvailabilityCalendar propertyId={id} />
            </motion.div>
        </div>
    );
}
