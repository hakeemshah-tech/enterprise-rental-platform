'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Home,
    Search,
    Menu,
    X,
    User,
    LogOut,
    LayoutDashboard,
    CalendarCheck,
    ChevronDown,
    Info,
    MessageSquare,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { COMPANY } from '@/lib/companyConfig';
import { useSettings } from '@/hooks/useSettings';

const NAV_LINKS = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/properties', label: 'Properties', icon: Search },
    { href: '/about', label: 'About Us', icon: Info },
    { href: '/contact', label: 'Contact', icon: MessageSquare },
];

const Navbar: React.FC = () => {
    const { user, isAuthenticated, logout } = useAuth();
    const pathname = usePathname();
    const { settings } = useSettings();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const brandName = settings?.companyInfo?.companyName || COMPANY.brandName;
    const tagline = settings?.companyInfo?.tagline || COMPANY.tagline;

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileOpen(false);
        setIsProfileOpen(false);
    }, [pathname]);

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
                isScrolled
                    ? 'bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50 shadow-2xl'
                    : 'bg-transparent'
            }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 lg:h-20">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <div
                            className="w-10 h-10 rounded-xl overflow-hidden shadow-lg
              shadow-amber-500/25 group-hover:shadow-amber-500/40 transition-shadow duration-300"
                        >
                            <Image
                                src="/logo.jpg"
                                alt={brandName}
                                width={40}
                                height={40}
                                className="w-full h-full object-cover"
                                priority
                            />
                        </div>
                        <div className="hidden sm:block">
                            <h1 className="text-lg font-bold text-white leading-tight">
                                {brandName}
                            </h1>
                            <p className="text-[10px] text-amber-400 font-medium -mt-0.5 tracking-wider uppercase">
                                {tagline}
                            </p>
                        </div>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden lg:flex items-center gap-1">
                        {NAV_LINKS.map(({ href, label, icon: Icon }) => (
                            <Link
                                key={href}
                                href={href}
                                className={`relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300
                  flex items-center gap-2
                  ${
                      pathname === href
                          ? 'text-amber-400'
                          : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                            >
                                <Icon className="w-4 h-4" />
                                {label}
                                {pathname === href && (
                                    <motion.div
                                        layoutId="nav-indicator"
                                        className="absolute bottom-0 left-3 right-3 h-0.5 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"
                                    />
                                )}
                            </Link>
                        ))}
                    </div>

                    {/* Desktop Auth */}
                    <div className="hidden lg:flex items-center gap-3">
                        {isAuthenticated && user ? (
                            <div className="relative">
                                <button
                                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-slate-300
                    hover:bg-white/5 transition-all duration-300"
                                >
                                    <div
                                        className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-600
                    flex items-center justify-center text-white font-semibold text-sm"
                                    >
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="font-medium">{user.name}</span>
                                    <ChevronDown
                                        className={`w-4 h-4 transition-transform duration-200 ${
                                            isProfileOpen ? 'rotate-180' : ''
                                        }`}
                                    />
                                </button>

                                <AnimatePresence>
                                    {isProfileOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 8, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 8, scale: 0.95 }}
                                            className="absolute right-0 mt-2 w-56 bg-slate-900/95 backdrop-blur-xl
                        border border-slate-700/50 rounded-xl shadow-2xl overflow-hidden"
                                        >
                                            <div className="p-3 border-b border-slate-800">
                                                <p className="text-sm font-medium text-white">
                                                    {user.name}
                                                </p>
                                                <p className="text-xs text-slate-400">
                                                    {user.email}
                                                </p>
                                            </div>
                                            <div className="p-1.5">
                                                <Link
                                                    href="/bookings"
                                                    className="flex items-center gap-2 px-3 py-2 text-sm text-slate-300
                            hover:bg-white/5 rounded-lg transition-colors"
                                                >
                                                    <CalendarCheck className="w-4 h-4" /> My
                                                    Bookings
                                                </Link>
                                                {user.role === 'admin' && (
                                                    <Link
                                                        href="/admin"
                                                        className="flex items-center gap-2 px-3 py-2 text-sm text-slate-300
                              hover:bg-white/5 rounded-lg transition-colors"
                                                    >
                                                        <LayoutDashboard className="w-4 h-4" />{' '}
                                                        Admin Panel
                                                    </Link>
                                                )}
                                                <button
                                                    onClick={logout}
                                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400
                            hover:bg-red-500/10 rounded-lg transition-colors"
                                                >
                                                    <LogOut className="w-4 h-4" /> Logout
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <>
                                <Link
                                    href="/login"
                                    className="px-5 py-2 text-sm font-medium text-slate-300
                    hover:text-white transition-colors"
                                >
                                    Sign In
                                </Link>
                                <Link
                                    href="/register"
                                    className="px-5 py-2 text-sm font-semibold text-white rounded-xl
                    bg-gradient-to-r from-amber-500 to-orange-600
                    shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40
                    transition-all duration-300"
                                >
                                    Get Started
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Toggle */}
                    <button
                        onClick={() => setIsMobileOpen(!isMobileOpen)}
                        className="lg:hidden p-2 rounded-xl text-slate-300 hover:bg-white/10 transition-colors"
                    >
                        {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMobileOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="lg:hidden bg-slate-950/95 backdrop-blur-xl border-t border-slate-800/50"
                    >
                        <div className="px-4 py-4 space-y-1">
                            {NAV_LINKS.map(({ href, label, icon: Icon }) => (
                                <Link
                                    key={href}
                                    href={href}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
                    ${
                        pathname === href
                            ? 'text-amber-400 bg-amber-500/10'
                            : 'text-slate-300 hover:bg-white/5'
                    }`}
                                >
                                    <Icon className="w-5 h-5" /> {label}
                                </Link>
                            ))}

                            {isAuthenticated && user ? (
                                <>
                                    <Link
                                        href="/bookings"
                                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium
                      text-slate-300 hover:bg-white/5 transition-all"
                                    >
                                        <CalendarCheck className="w-5 h-5" /> My Bookings
                                    </Link>
                                    {user.role === 'admin' && (
                                        <Link
                                            href="/admin"
                                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium
                        text-slate-300 hover:bg-white/5 transition-all"
                                        >
                                            <LayoutDashboard className="w-5 h-5" /> Admin Panel
                                        </Link>
                                    )}
                                    <button
                                        onClick={logout}
                                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium
                      text-red-400 hover:bg-red-500/10 transition-all"
                                    >
                                        <LogOut className="w-5 h-5" /> Logout
                                    </button>
                                </>
                            ) : (
                                <div className="flex gap-3 pt-3 border-t border-slate-800">
                                    <Link
                                        href="/login"
                                        className="flex-1 text-center px-4 py-2.5 text-sm font-medium text-slate-300
                      border border-slate-700 rounded-xl hover:bg-white/5 transition-all"
                                    >
                                        Sign In
                                    </Link>
                                    <Link
                                        href="/register"
                                        className="flex-1 text-center px-4 py-2.5 text-sm font-semibold text-white rounded-xl
                      bg-gradient-to-r from-amber-500 to-orange-600 transition-all"
                                    >
                                        Get Started
                                    </Link>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.nav>
    );
};

export default Navbar;
