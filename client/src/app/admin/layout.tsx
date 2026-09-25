'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Building,
    CalendarCheck,
    MessageSquare,
    Settings,
    ChevronLeft,
} from 'lucide-react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

const ADMIN_NAV = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/properties', label: 'Properties', icon: Building },
    { href: '/admin/bookings', label: 'Bookings', icon: CalendarCheck },
    { href: '/admin/enquiries', label: 'Enquiries', icon: MessageSquare },
    { href: '/admin/settings', label: 'Website Content', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    return (
        <ProtectedRoute requiredRole="admin">
            <div className="min-h-screen bg-slate-950 flex">
                {/* Sidebar */}
                <aside className="hidden lg:flex flex-col w-64 bg-slate-900/50 border-r border-slate-800/50 p-4">
                    <div className="flex items-center gap-2 px-3 mb-8">
                        <div
                            className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-600
              flex items-center justify-center"
                        >
                            <span className="text-white font-bold text-xs">SW</span>
                        </div>
                        <span className="font-semibold text-white text-sm">Admin Panel</span>
                    </div>

                    <nav className="flex-1 space-y-1">
                        {ADMIN_NAV.map(({ href, label, icon: Icon }) => (
                            <Link
                                key={href}
                                href={href}
                                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium
                  transition-all duration-200
                  ${
                      pathname === href
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'text-slate-400 hover:bg-white/5 hover:text-white border border-transparent'
                  }`}
                            >
                                <Icon className="w-4 h-4" />
                                {label}
                            </Link>
                        ))}
                    </nav>

                    <Link
                        href="/"
                        className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-slate-400
              hover:bg-white/5 hover:text-white transition-all"
                    >
                        <ChevronLeft className="w-4 h-4" /> Back to Site
                    </Link>
                </aside>

                {/* Mobile Header */}
                <div
                    className="lg:hidden fixed top-16 left-0 right-0 z-40 bg-slate-900/90 backdrop-blur-xl
          border-b border-slate-800/50 px-4 py-2 flex gap-1 overflow-x-auto"
                >
                    {ADMIN_NAV.map(({ href, label, icon: Icon }) => (
                        <Link
                            key={href}
                            href={href}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                whitespace-nowrap transition-all
                ${
                    pathname === href
                        ? 'bg-amber-500/10 text-amber-400'
                        : 'text-slate-400 hover:text-white'
                }`}
                        >
                            <Icon className="w-3.5 h-3.5" />
                            {label}
                        </Link>
                    ))}
                </div>

                {/* Main Content */}
                <main className="flex-1 p-4 sm:p-6 lg:p-8 lg:mt-0 mt-12">{children}</main>
            </div>
        </ProtectedRoute>
    );
}
