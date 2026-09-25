'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import PropertyForm from '@/components/forms/PropertyForm';
import api from '@/lib/api';
import type { PropertyInput } from '@/lib/validations';

interface ImageFile {
    file?: File;
    url: string;
    alt: string;
    preview?: string;
}

export default function NewPropertyPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (data: PropertyInput, images: ImageFile[]) => {
        setLoading(true);
        try {
            // Step 1: Upload images if any have File objects
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

            // Step 2: Create property with image URLs
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

            await api.post('/properties', payload);
            router.push('/admin/properties');
        } catch (err) {
            console.error('Create property failed:', err);
        } finally {
            setLoading(false);
        }
    };

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
                <h1 className="text-2xl font-bold text-white">Add New Property</h1>
                <p className="text-sm text-slate-400 mt-1">Create a new vacation rental listing</p>
            </motion.div>

            <PropertyForm mode="create" onSubmit={handleSubmit} isLoading={loading} />
        </div>
    );
}
