'use client';

import React from 'react';
import { AuthProvider } from '@/context/AuthContext';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const ClientLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <AuthProvider>
            <Navbar />
            <main className="pt-16 lg:pt-20">{children}</main>
            <Footer />
        </AuthProvider>
    );
};

export default ClientLayout;
