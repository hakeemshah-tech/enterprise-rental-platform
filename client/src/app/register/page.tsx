'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, Lock, User as UserIcon, Phone, UserPlus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { registerSchema, type RegisterInput } from '@/lib/validations';
import { useAuth } from '@/context/AuthContext';
import { COMPANY } from '@/lib/companyConfig';

export default function RegisterPage() {
    const router = useRouter();
    const { register: doRegister } = useAuth();
    const [error, setError] = useState('');

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) as any });

    const onSubmit = async (data: RegisterInput) => {
        setError('');
        try {
            await doRegister(data.name, data.email, data.password, data.phone);
            router.push('/');
        } catch (err: unknown) {
            const e = err as { response?: { data?: { message?: string } } };
            setError(e.response?.data?.message || 'Registration failed. Please try again.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 py-16">
            <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-orange-500/5 rounded-full blur-3xl" />

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative w-full max-w-md"
            >
                <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/50 rounded-3xl p-8 shadow-2xl">
                    <div className="text-center mb-8">
                        <div
                            className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-amber-400 to-orange-600
              flex items-center justify-center shadow-lg shadow-amber-500/25 mb-4"
                        >
                            <UserPlus className="w-7 h-7 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-white">Create Account</h1>
                        <p className="text-sm text-slate-400 mt-1">
                            Join {COMPANY.brandName} and start exploring
                        </p>
                    </div>

                    {error && (
                        <div className="mb-5 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <Input
                            label="Full Name"
                            placeholder="John Doe"
                            icon={<UserIcon className="w-4 h-4" />}
                            error={errors.name?.message}
                            {...register('name')}
                        />
                        <Input
                            label="Email"
                            type="email"
                            placeholder="you@example.com"
                            icon={<Mail className="w-4 h-4" />}
                            error={errors.email?.message}
                            {...register('email')}
                        />
                        <Input
                            label="Phone (Optional)"
                            type="tel"
                            placeholder="+971 50 000 0000"
                            icon={<Phone className="w-4 h-4" />}
                            error={errors.phone?.message}
                            {...register('phone')}
                        />
                        <Input
                            label="Password"
                            type="password"
                            placeholder="At least 6 characters"
                            icon={<Lock className="w-4 h-4" />}
                            error={errors.password?.message}
                            {...register('password')}
                        />
                        <Input
                            label="Confirm Password"
                            type="password"
                            placeholder="Re-enter your password"
                            icon={<Lock className="w-4 h-4" />}
                            error={errors.confirmPassword?.message}
                            {...register('confirmPassword')}
                        />

                        <Button type="submit" fullWidth loading={isSubmitting}>
                            Create Account
                        </Button>
                    </form>

                    <p className="text-center text-sm text-slate-400 mt-6">
                        Already have an account?{' '}
                        <Link
                            href="/login"
                            className="text-amber-400 hover:text-amber-300 font-medium transition-colors"
                        >
                            Sign in
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
