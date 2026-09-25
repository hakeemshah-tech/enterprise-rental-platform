'use client';

import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import {
    Home,
    MapPin,
    DollarSign,
    Users,
    Bed,
    Bath,
    Wifi,
    Car,
    Waves,
    Flame,
    Tv,
    Dumbbell,
    Wind,
    Snowflake,
    Trees,
    Utensils,
    PawPrint,
    Shield,
    Zap,
    Umbrella,
    ExternalLink,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import ImageUpload from '@/components/ui/ImageUpload';
import { propertySchema, type PropertyInput } from '@/lib/validations';
import { useSettings } from '@/hooks/useSettings';
import type { Control } from 'react-hook-form';

// ─── Constants ─────────────────────────────────────

const PROPERTY_TYPES = [
    { value: 'villa', label: 'Villa' },
    { value: 'apartment', label: 'Apartment' },
    { value: 'cottage', label: 'Cottage' },
    { value: 'cabin', label: 'Cabin' },
    { value: 'penthouse', label: 'Penthouse' },
    { value: 'beach-house', label: 'Beach House' },
];

const STATUS_OPTIONS = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'maintenance', label: 'Maintenance' },
];

const AMENITIES = [
    { key: 'wifi', label: 'WiFi', icon: Wifi },
    { key: 'pool', label: 'Pool', icon: Waves },
    { key: 'parking', label: 'Parking', icon: Car },
    { key: 'kitchen', label: 'Kitchen', icon: Utensils },
    { key: 'air-conditioning', label: 'A/C', icon: Snowflake },
    { key: 'heating', label: 'Heating', icon: Flame },
    { key: 'tv', label: 'TV', icon: Tv },
    { key: 'gym', label: 'Gym', icon: Dumbbell },
    { key: 'hot-tub', label: 'Hot Tub', icon: Waves },
    { key: 'fireplace', label: 'Fireplace', icon: Flame },
    { key: 'balcony', label: 'Balcony', icon: Wind },
    { key: 'garden', label: 'Garden', icon: Trees },
    { key: 'bbq', label: 'BBQ', icon: Utensils },
    { key: 'pet-friendly', label: 'Pet Friendly', icon: PawPrint },
    { key: 'beach-access', label: 'Beach Access', icon: Umbrella },
    { key: 'security', label: 'Security', icon: Shield },
    { key: 'ev-charger', label: 'EV Charger', icon: Zap },
];

const FALLBACK_PLATFORM_NAMES = ['Airbnb', 'Booking.com', 'Agoda'];

// ─── External Links Section ────────────────────────
function ExternalLinksSection({ control }: { control: Control<PropertyInput> }) {
    const { settings } = useSettings();
    const platformNames =
        settings?.bookingPlatforms && settings.bookingPlatforms.length > 0
            ? settings.bookingPlatforms.map((p) => p.name)
            : FALLBACK_PLATFORM_NAMES;

    return (
        <section className="bg-slate-800/30 rounded-2xl border border-slate-700/30 p-6">
            <div className="flex items-center gap-2 mb-4">
                <ExternalLink className="w-5 h-5 text-amber-400" />
                <h2 className="text-lg font-semibold text-white">External Booking Links</h2>
            </div>
            <p className="text-sm text-slate-400 mb-4">
                Select which platforms this property is listed on and paste the listing URL.
            </p>
            <Controller
                name="externalLinks"
                control={control}
                render={({ field }) => {
                    const links: { platformName: string; url: string }[] = field.value || [];
                    const selectedNames = new Set(links.map((l) => l.platformName));

                    const toggle = (name: string) => {
                        if (selectedNames.has(name)) {
                            field.onChange(links.filter((l) => l.platformName !== name));
                        } else {
                            field.onChange([...links, { platformName: name, url: '' }]);
                        }
                    };

                    const updateUrl = (name: string, url: string) => {
                        field.onChange(
                            links.map((l) => (l.platformName === name ? { ...l, url } : l))
                        );
                    };

                    return (
                        <div className="space-y-3">
                            {/* Platform toggles */}
                            <div className="flex flex-wrap gap-2">
                                {platformNames.map((name) => (
                                    <motion.button
                                        key={name}
                                        type="button"
                                        whileHover={{ scale: 1.03 }}
                                        whileTap={{ scale: 0.97 }}
                                        onClick={() => toggle(name)}
                                        className={`
                                            flex items-center gap-2 px-3 py-2 rounded-xl border text-sm
                                            transition-all duration-300 cursor-pointer
                                            ${
                                                selectedNames.has(name)
                                                    ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                                                    : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-500'
                                            }
                                        `}
                                    >
                                        <ExternalLink className="w-3.5 h-3.5" />
                                        {name}
                                    </motion.button>
                                ))}
                            </div>

                            {/* URL inputs for selected platforms */}
                            {links
                                .filter((l) => l.url !== undefined)
                                .map((link) => (
                                    <div key={link.platformName} className="mt-2">
                                        <Input
                                            label={`${link.platformName} Listing URL`}
                                            placeholder={`https://www.${link.platformName.toLowerCase().replace(/\./g, '')}.com/...`}
                                            value={link.url}
                                            onChange={(e) =>
                                                updateUrl(link.platformName, e.target.value)
                                            }
                                        />
                                    </div>
                                ))}
                        </div>
                    );
                }}
            />
        </section>
    );
}

// ─── Types ─────────────────────────────────────────

interface ImageFile {
    file?: File;
    url: string;
    alt: string;
    preview?: string;
}

interface PropertyFormProps {
    mode: 'create' | 'edit';
    initialData?: Partial<PropertyInput> & { images?: ImageFile[] };
    onSubmit: (data: PropertyInput, images: ImageFile[]) => Promise<void>;
    isLoading?: boolean;
}

// ─── Component ─────────────────────────────────────

const PropertyForm: React.FC<PropertyFormProps> = ({
    mode,
    initialData,
    onSubmit,
    isLoading = false,
}) => {
    const [images, setImages] = useState<ImageFile[]>(initialData?.images || []);

    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
    } = useForm<PropertyInput>({
        // Zod 4 resolver generics do not line up with react-hook-form's
        // FieldValues here; the cast is contained to this one line.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: zodResolver(propertySchema) as any,
        defaultValues: {
            title: '',
            description: '',
            type: 'villa',
            pricePerNight: 0,
            cleaningFee: 0,
            serviceFee: 0,
            address: '',
            city: '',
            state: '',
            country: '',
            zipCode: '',
            amenities: [],
            bedrooms: 1,
            bathrooms: 1,
            maxGuests: 2,
            featured: false,
            status: 'active',
            ...initialData,
        },
    });

    const handleFormSubmit = async (data: PropertyInput) => {
        await onSubmit(data, images);
    };

    return (
        <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            onSubmit={handleSubmit(handleFormSubmit)}
            className="space-y-8"
        >
            {/* ── Section: Basic Information ── */}
            <section className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-5">
                    <Home className="w-5 h-5 text-amber-500" />
                    <h3 className="text-lg font-semibold text-white">Basic Information</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="md:col-span-2">
                        <Input
                            label="Property Title"
                            placeholder="e.g. Luxury Oceanfront Villa"
                            error={errors.title?.message}
                            {...register('title')}
                        />
                    </div>
                    <Select
                        label="Property Type"
                        options={PROPERTY_TYPES}
                        error={errors.type?.message}
                        {...register('type')}
                    />
                    <Select
                        label="Status"
                        options={STATUS_OPTIONS}
                        error={errors.status?.message}
                        {...register('status')}
                    />
                    <div className="md:col-span-2">
                        <Textarea
                            label="Description"
                            placeholder="Describe the property in detail..."
                            rows={4}
                            error={errors.description?.message}
                            {...register('description')}
                        />
                    </div>
                </div>
            </section>

            {/* ── Section: Pricing ── */}
            <section className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-5">
                    <DollarSign className="w-5 h-5 text-amber-500" />
                    <h3 className="text-lg font-semibold text-white">Pricing</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    <Input
                        label="Price per Night (AED)"
                        type="number"
                        placeholder="0"
                        error={errors.pricePerNight?.message}
                        {...register('pricePerNight', { valueAsNumber: true })}
                    />
                    <Input
                        label="Cleaning Fee (AED)"
                        type="number"
                        placeholder="0"
                        error={errors.cleaningFee?.message}
                        {...register('cleaningFee', { valueAsNumber: true })}
                    />
                    <Input
                        label="Service Fee (AED)"
                        type="number"
                        placeholder="0"
                        error={errors.serviceFee?.message}
                        {...register('serviceFee', { valueAsNumber: true })}
                    />
                </div>
            </section>

            {/* ── Section: Location ── */}
            <section className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-5">
                    <MapPin className="w-5 h-5 text-amber-500" />
                    <h3 className="text-lg font-semibold text-white">Location</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="md:col-span-2">
                        <Input
                            label="Address"
                            placeholder="Street address"
                            error={errors.address?.message}
                            {...register('address')}
                        />
                    </div>
                    <Input
                        label="City"
                        placeholder="City"
                        error={errors.city?.message}
                        {...register('city')}
                    />
                    <Input
                        label="State / Province"
                        placeholder="State"
                        error={errors.state?.message}
                        {...register('state')}
                    />
                    <Input
                        label="Country"
                        placeholder="Country"
                        error={errors.country?.message}
                        {...register('country')}
                    />
                    <Input
                        label="Zip Code"
                        placeholder="Zip code"
                        error={errors.zipCode?.message}
                        {...register('zipCode')}
                    />
                </div>
            </section>

            {/* ── Section: Capacity ── */}
            <section className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-5">
                    <Users className="w-5 h-5 text-amber-500" />
                    <h3 className="text-lg font-semibold text-white">Capacity</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    <Input
                        label="Bedrooms"
                        type="number"
                        icon={<Bed className="w-4 h-4" />}
                        error={errors.bedrooms?.message}
                        {...register('bedrooms', { valueAsNumber: true })}
                    />
                    <Input
                        label="Bathrooms"
                        type="number"
                        icon={<Bath className="w-4 h-4" />}
                        error={errors.bathrooms?.message}
                        {...register('bathrooms', { valueAsNumber: true })}
                    />
                    <Input
                        label="Max Guests"
                        type="number"
                        icon={<Users className="w-4 h-4" />}
                        error={errors.maxGuests?.message}
                        {...register('maxGuests', { valueAsNumber: true })}
                    />
                </div>
            </section>

            {/* ── Section: Amenities ── */}
            <section className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-5">Amenities</h3>
                <Controller
                    name="amenities"
                    control={control}
                    render={({ field }) => (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                            {AMENITIES.map(({ key, label, icon: Icon }) => {
                                const isSelected = field.value?.includes(key);
                                return (
                                    <motion.button
                                        key={key}
                                        type="button"
                                        whileHover={{ scale: 1.03 }}
                                        whileTap={{ scale: 0.97 }}
                                        onClick={() => {
                                            const updated = isSelected
                                                ? field.value?.filter((a: string) => a !== key) ||
                                                  []
                                                : [...(field.value || []), key];
                                            field.onChange(updated);
                                        }}
                                        className={`
                      flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm
                      transition-all duration-300 cursor-pointer
                      ${
                          isSelected
                              ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                              : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-500'
                      }
                    `}
                                    >
                                        <Icon className="w-4 h-4 flex-shrink-0" />
                                        {label}
                                    </motion.button>
                                );
                            })}
                        </div>
                    )}
                />
            </section>

            {/* ── Section: Images ── */}
            <section className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-5">Property Images</h3>
                <ImageUpload value={images} onChange={setImages} maxFiles={10} />
            </section>

            {/* ── Section: Featured Toggle ── */}
            <section className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-6">
                <Controller
                    name="featured"
                    control={control}
                    render={({ field }) => (
                        <label className="flex items-center gap-3 cursor-pointer">
                            <div
                                className={`
                  relative w-12 h-6 rounded-full transition-colors duration-300
                  ${field.value ? 'bg-amber-500' : 'bg-slate-700'}
                `}
                                onClick={() => field.onChange(!field.value)}
                            >
                                <motion.div
                                    layout
                                    className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white"
                                    animate={{ x: field.value ? 24 : 0 }}
                                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                />
                            </div>
                            <span className="text-sm font-medium text-slate-300">
                                Featured Property
                            </span>
                        </label>
                    )}
                />
            </section>

            {/* ── External Booking Links ── */}
            <ExternalLinksSection control={control} />

            {/* ── Submit ── */}
            <div className="flex justify-end gap-3">
                <Button type="button" variant="ghost">
                    Cancel
                </Button>
                <Button type="submit" loading={isLoading}>
                    {mode === 'create' ? 'Create Property' : 'Update Property'}
                </Button>
            </div>
        </motion.form>
    );
};

export default PropertyForm;
