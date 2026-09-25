'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredRole?: 'admin' | 'user';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
    const { isAuthenticated, isLoading, user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/login');
        }
        if (!isLoading && isAuthenticated && requiredRole && user?.role !== requiredRole) {
            router.push('/');
        }
    }, [isAuthenticated, isLoading, requiredRole, user, router]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950">
                <div className="text-center space-y-4">
                    <Loader2 className="w-10 h-10 animate-spin text-amber-500 mx-auto" />
                    <p className="text-sm text-slate-400">Loading...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) return null;
    if (requiredRole && user?.role !== requiredRole) return null;

    return <>{children}</>;
};

export default ProtectedRoute;
