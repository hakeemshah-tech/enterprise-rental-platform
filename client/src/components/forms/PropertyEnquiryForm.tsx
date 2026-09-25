'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, CheckCircle, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';
import { enquirySchema, type EnquiryInput } from '@/lib/validations';
import api from '@/lib/api';

interface PropertyEnquiryFormProps {
    propertyId: string;
    propertyTitle: string;
}

const PropertyEnquiryForm: React.FC<PropertyEnquiryFormProps> = ({ propertyId, propertyTitle }) => {
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
            await api.post('/enquiries', {
                ...data,
                property: propertyId,
                subject: `Enquiry about: ${propertyTitle}`,
            });
            setSuccess(true);
            reset();
        } catch (err: unknown) {
            const e = err as { response?: { data?: { message?: string } } };
            setError(e.response?.data?.message || 'Something went wrong. Please try again.');
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6"
        >
            <h3 className="text-lg font-semibold text-white mb-1">Enquire About This Property</h3>
            <p className="text-sm text-slate-400 mb-5">
                Have a question about <span className="text-amber-400">{propertyTitle}</span>? Send
                us a message and we&apos;ll get back to you shortly.
            </p>

            {success && (
                <div
                    className="mb-5 p-4 bg-green-500/10 border border-green-500/20 rounded-xl
                    flex items-center gap-3 text-sm text-green-400"
                >
                    <CheckCircle className="w-5 h-5 flex-shrink-0" />
                    <span>
                        Thank you! Your enquiry has been submitted. Our team will reach out shortly.
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
                <Input
                    label="Phone (Optional)"
                    type="tel"
                    placeholder="+971 50 000 0000"
                    error={errors.phone?.message}
                    {...register('phone')}
                />
                <Textarea
                    label="Message"
                    placeholder="What would you like to know about this property?"
                    rows={4}
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
                            <Send className="w-4 h-4" /> Send Enquiry
                        </>
                    )}
                </Button>
            </form>
        </motion.div>
    );
};

export default PropertyEnquiryForm;
