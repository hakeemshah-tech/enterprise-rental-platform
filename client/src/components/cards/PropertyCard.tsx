'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { MapPin, Bed, Bath, Users, Star } from 'lucide-react';
import type { Property } from '@/types';
import { formatAED } from '@/lib/format';

interface PropertyCardProps {
    property: Property;
    index?: number;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property, index = 0 }) => {
    const mainImage = property.images?.[0]?.url || '/placeholder-property.jpg';

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
        >
            <Link href={`/properties/${property._id}`} className="group block">
                <div
                    className="bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-2xl
          overflow-hidden hover:border-slate-700/50 transition-all duration-500
          hover:shadow-2xl hover:shadow-amber-500/5 hover:-translate-y-1"
                >
                    {/* Image */}
                    <div className="relative aspect-[4/3] overflow-hidden">
                        <div
                            className="w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                            style={{
                                backgroundImage: `url(${mainImage})`,
                                backgroundColor: '#1e293b',
                            }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

                        {/* Badges */}
                        <div className="absolute top-3 left-3 flex gap-2">
                            {property.featured && (
                                <span className="px-2.5 py-1 text-[11px] font-semibold bg-amber-500 text-black rounded-lg">
                                    Featured
                                </span>
                            )}
                            <span
                                className="px-2.5 py-1 text-[11px] font-medium bg-slate-900/70 backdrop-blur-sm
                text-white border border-slate-700/50 rounded-lg capitalize"
                            >
                                {property.type}
                            </span>
                        </div>

                        {/* Price */}
                        <div className="absolute bottom-3 right-3">
                            <div className="bg-slate-950/70 backdrop-blur-sm border border-slate-700/50 rounded-xl px-3 py-1.5">
                                <span className="text-lg font-bold text-white">
                                    {formatAED(property.price.perNight)}
                                </span>
                                <span className="text-xs text-slate-400">/night</span>
                            </div>
                        </div>

                        {/* Rating */}
                        {property.rating > 0 && (
                            <div
                                className="absolute top-3 right-3 flex items-center gap-1 bg-slate-900/70
                backdrop-blur-sm border border-slate-700/50 rounded-lg px-2 py-1"
                            >
                                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                                <span className="text-xs font-semibold text-white">
                                    {property.rating.toFixed(1)}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Content */}
                    <div className="p-4">
                        <h3
                            className="text-white font-semibold text-base line-clamp-1 group-hover:text-amber-400
              transition-colors duration-300"
                        >
                            {property.title}
                        </h3>
                        <div className="flex items-center gap-1 mt-1.5 text-sm text-slate-400">
                            <MapPin className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                            <span className="line-clamp-1">
                                {property.location.city}, {property.location.country}
                            </span>
                        </div>

                        {/* Stats */}
                        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-800/50">
                            <div className="flex items-center gap-1 text-xs text-slate-400">
                                <Bed className="w-3.5 h-3.5" />
                                <span>{property.bedrooms} Beds</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-slate-400">
                                <Bath className="w-3.5 h-3.5" />
                                <span>{property.bathrooms} Baths</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-slate-400">
                                <Users className="w-3.5 h-3.5" />
                                <span>{property.maxGuests} Guests</span>
                            </div>
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
};

export default PropertyCard;
