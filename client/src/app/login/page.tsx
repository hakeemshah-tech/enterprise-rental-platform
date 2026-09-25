'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn, ShieldCheck, ArrowLeft } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { loginSchema, type LoginInput } from '@/lib/validations';
import { useAuth } from '@/context/AuthContext';
import { COMPANY } from '@/lib/companyConfig';

export default function LoginPage() {
    const router = useRouter();
    const { login, verifyOtp } = useAuth();
    const [error, setError] = useState('');
    const [otpStep, setOtpStep] = useState(false);
    const [otpEmail, setOtpEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [otpSubmitting, setOtpSubmitting] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) as any });

    const onSubmit = async (data: LoginInput) => {
        setError('');
        try {
            const result = await login(data.email, data.password);
            if (result.requiresOtp) {
                setOtpEmail(result.email!);
                setOtpStep(true);
            } else {
                router.push('/');
            }
        } catch (err: unknown) {
            const e = err as { response?: { data?: { message?: string } } };
            setError(e.response?.data?.message || 'Invalid credentials. Please try again.');
        }
    };

    const onOtpSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setOtpSubmitting(true);
        try {
            await verifyOtp(otpEmail, otp);
            router.push('/');
        } catch (err: unknown) {
            const e = err as { response?: { data?: { message?: string } } };
            setError(e.response?.data?.message || 'Invalid OTP. Please try again.');
        } finally {
            setOtpSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 py-16">
            {/* Background effects */}
            <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
            <div className="absolute bottom-1/3 right-1/4 w-72 h-72 bg-orange-500/5 rounded-full blur-3xl" />

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative w-full max-w-md"
            >
                <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/50 rounded-3xl p-8 shadow-2xl">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div
                            className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-amber-400 to-orange-600
              flex items-center justify-center shadow-lg shadow-amber-500/25 mb-4"
                        >
                            <LogIn className="w-7 h-7 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-white">Welcome Back</h1>
                        <p className="text-sm text-slate-400 mt-1">
                            Sign in to your {COMPANY.brandName} account
                        </p>
                    </div>

                    {error && (
                        <div className="mb-5 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400">
                            {error}
                        </div>
                    )}

                    {otpStep ? (
                        <>
                            <div className="text-center mb-6">
                                <p className="text-sm text-slate-400">
                                    We sent a verification code to
                                </p>
                                <p className="text-amber-400 font-medium mt-1">{otpEmail}</p>
                            </div>

                            <form onSubmit={onOtpSubmit} className="space-y-5">
                                <Input
                                    label="Verification Code"
                                    type="text"
                                    placeholder="Enter 6-digit code"
                                    icon={<ShieldCheck className="w-4 h-4" />}
                                    value={otp}
                                    onChange={(e) =>
                                        setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))
                                    }
                                    maxLength={6}
                                    inputMode="numeric"
                                    autoComplete="one-time-code"
                                />

                                <Button
                                    type="submit"
                                    fullWidth
                                    loading={otpSubmitting}
                                    disabled={otp.length !== 6}
                                >
                                    Verify
                                </Button>
                            </form>

                            <button
                                type="button"
                                onClick={() => {
                                    setOtpStep(false);
                                    setOtp('');
                                    setError('');
                                }}
                                className="flex items-center justify-center gap-1.5 text-sm text-slate-400 hover:text-amber-400 transition-colors mt-6 mx-auto"
                            >
                                <ArrowLeft className="w-3.5 h-3.5" />
                                Back to login
                            </button>
                        </>
                    ) : (
                        <>
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                                <Input
                                    label="Email"
                                    type="email"
                                    placeholder="you@example.com"
                                    icon={<Mail className="w-4 h-4" />}
                                    error={errors.email?.message}
                                    {...register('email')}
                                />
                                <Input
                                    label="Password"
                                    type="password"
                                    placeholder="Enter your password"
                                    icon={<Lock className="w-4 h-4" />}
                                    error={errors.password?.message}
                                    {...register('password')}
                                />

                                <Button type="submit" fullWidth loading={isSubmitting}>
                                    Sign In
                                </Button>
                            </form>

                            <p className="text-center text-sm text-slate-400 mt-6">
                                Don&apos;t have an account?{' '}
                                <Link
                                    href="/register"
                                    className="text-amber-400 hover:text-amber-300 font-medium transition-colors"
                                >
                                    Create one
                                </Link>
                            </p>
                        </>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
