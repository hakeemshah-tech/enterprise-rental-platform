'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';
import { enquirySchema, type EnquiryInput } from '@/lib/validations';
import api from '@/lib/api';
import { COMPANY } from '@/lib/companyConfig';
import { useSettings } from '@/hooks/useSettings';

// ─── Contact Info ────────────────────────────────────
const CONTACT_DETAILS = [
    {
        icon: MapPin,
        label: 'Office Address',
        value: COMPANY.headquarters.full,
        href: COMPANY.headquarters.googleMapsUrl,
    },
    {
        icon: Phone,
        label: 'Phone',
        value: COMPANY.contact.phone,
        href: COMPANY.contact.phoneHref,
    },
    {
        icon: Mail,
        label: 'Email',
        value: COMPANY.contact.email,
        href: COMPANY.contact.emailHref,
    },
    {
        icon: Clock,
        label: 'Working Hours',
        value: COMPANY.contact.workingHours,
    },
];

// ─── Enquiry Form ────────────────────────────────────
const EnquiryForm: React.FC = () => {
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } = useForm<EnquiryInput>({ resolver: zodResolver(enquirySchema) as any });

    const onSubmit = async (data: EnquiryInput) => {
        setError('');
        setSuccess(false);
        try {
            await api.post('/enquiries', data);
            setSuccess(true);
            reset();
        } catch (err: unknown) {
            const e = err as { response?: { data?: { message?: string } } };
            setError(e.response?.data?.message || 'Something went wrong. Please try again.');
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
        >
            <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/50 rounded-3xl p-6 sm:p-8">
                <h2 className="text-2xl font-bold text-white mb-1">Send us a Message</h2>
                <p className="text-sm text-slate-400 mb-6">
                    Have a question about bookings or property management? We&apos;d love to hear
                    from you.
                </p>

                {success && (
                    <div
                        className="mb-5 p-4 bg-green-500/10 border border-green-500/20 rounded-xl
            flex items-center gap-3 text-sm text-green-400"
                    >
                        <CheckCircle className="w-5 h-5 flex-shrink-0" />
                        <span>
                            Thank you! Your enquiry has been submitted. Our team will reach out
                            shortly.
                        </span>
                    </div>
                )}

                {error && (
                    <div className="mb-5 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                            label="Full Name"
                            placeholder="Your name"
                            error={errors.name?.message}
                            {...register('name')}
                        />
                        <Input
                            label="Email"
                            type="email"
                            placeholder="you@example.com"
                            error={errors.email?.message}
                            {...register('email')}
                        />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                            label="Phone (Optional)"
                            type="tel"
                            placeholder="+971 50 000 0000"
                            error={errors.phone?.message}
                            {...register('phone')}
                        />
                        <Input
                            label="Subject"
                            placeholder="e.g. Booking Inquiry"
                            error={errors.subject?.message}
                            {...register('subject')}
                        />
                    </div>
                    <Textarea
                        label="Message"
                        placeholder="Tell us how we can help..."
                        rows={5}
                        error={errors.message?.message}
                        {...register('message')}
                    />
                    <Button type="submit" fullWidth loading={isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" /> Sending...
                            </>
                        ) : (
                            <>
                                <Send className="w-4 h-4" /> Send Message
                            </>
                        )}
                    </Button>
                </form>
            </div>
        </motion.div>
    );
};

// ─── Contact Page ────────────────────────────────────
export default function ContactPage() {
    const { settings } = useSettings();

    const contactDetails = [
        {
            icon: MapPin,
            label: 'Office Address',
            value: settings?.companyInfo?.address || COMPANY.headquarters.full,
            href: COMPANY.headquarters.googleMapsUrl,
        },
        {
            icon: Phone,
            label: 'Phone',
            value: settings?.companyInfo?.phone || COMPANY.contact.phone,
            href: `tel:${(settings?.companyInfo?.phone || COMPANY.contact.phone).replace(/\s+/g, '')}`,
        },
        {
            icon: Mail,
            label: 'Email',
            value: settings?.companyInfo?.email || COMPANY.contact.email,
            href: `mailto:${settings?.companyInfo?.email || COMPANY.contact.email}`,
        },
        {
            icon: Clock,
            label: 'Working Hours',
            value: settings?.companyInfo?.workingHours || COMPANY.contact.workingHours,
        },
    ];
    return (
        <div className="min-h-screen bg-slate-950">
            {/* Hero */}
            <section className="relative py-28">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
                    <div className="absolute bottom-1/4 right-1/3 w-72 h-72 bg-orange-500/5 rounded-full blur-3xl" />
                </div>
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
                            Get in{' '}
                            <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                                Touch
                            </span>
                        </h1>
                        <p className="mt-5 text-lg text-slate-300 max-w-2xl mx-auto">
                            Whether you&apos;re looking to book a vacation home or explore property
                            management solutions, we&apos;re here to help.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Main Content */}
            <section className="pb-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
                        {/* Form */}
                        <div className="lg:col-span-3">
                            <EnquiryForm />
                        </div>

                        {/* Contact Info + Map */}
                        <div className="lg:col-span-2 space-y-6">
                            <motion.div
                                initial={{ opacity: 0, x: 30 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.6, delay: 0.3 }}
                                className="space-y-4"
                            >
                                {contactDetails.map((item, i) => (
                                    <motion.div
                                        key={item.label}
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.4 + i * 0.1 }}
                                        className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-5
                      hover:border-amber-500/30 transition-all duration-300"
                                    >
                                        <div className="flex items-start gap-4">
                                            <div
                                                className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20
                        flex items-center justify-center flex-shrink-0"
                                            >
                                                <item.icon className="w-5 h-5 text-amber-400" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-amber-400 font-medium uppercase tracking-wider mb-0.5">
                                                    {item.label}
                                                </p>
                                                {item.href ? (
                                                    <a
                                                        href={item.href}
                                                        target={
                                                            item.href.startsWith('http')
                                                                ? '_blank'
                                                                : undefined
                                                        }
                                                        className="text-sm text-slate-300 hover:text-amber-400 transition-colors"
                                                    >
                                                        {item.value}
                                                    </a>
                                                ) : (
                                                    <p className="text-sm text-slate-300">
                                                        {item.value}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>

                            {/* Google Maps */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.8 }}
                                className="rounded-2xl overflow-hidden border border-slate-800/50"
                            >
                                <iframe
                                    src={
                                        settings?.googleMapsEmbedUrl ||
                                        COMPANY.headquarters.embedUrl
                                    }
                                    width="100%"
                                    height="280"
                                    style={{
                                        border: 0,
                                        filter: 'invert(90%) hue-rotate(180deg) saturate(0.3)',
                                    }}
                                    allowFullScreen
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    title={`${settings?.companyInfo?.companyName || COMPANY.brandName} Office Location`}
                                />
                            </motion.div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
