'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import type { User } from '@/types';

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}

interface LoginResult {
    requiresOtp: boolean;
    email?: string;
}

interface AuthContextType extends AuthState {
    login: (email: string, password: string) => Promise<LoginResult>;
    verifyOtp: (email: string, otp: string) => Promise<void>;
    register: (name: string, email: string, password: string, phone?: string) => Promise<void>;
    logout: () => void;
    updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, setState] = useState<AuthState>({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: true,
    });

    // Load user from localStorage on mount
    useEffect(() => {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');
        if (token && userStr) {
            try {
                const user = JSON.parse(userStr);
                setState({ user, token, isAuthenticated: true, isLoading: false });
            } catch {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                setState((s) => ({ ...s, isLoading: false }));
            }
        } else {
            setState((s) => ({ ...s, isLoading: false }));
        }
    }, []);

    const login = useCallback(async (email: string, password: string): Promise<LoginResult> => {
        const { data: res } = await api.post('/auth/login', { email, password });
        if (res.data.requiresOtp) {
            return { requiresOtp: true, email: res.data.email };
        }
        const { token, user } = res.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        setState({ user, token, isAuthenticated: true, isLoading: false });
        return { requiresOtp: false };
    }, []);

    const verifyOtp = useCallback(async (email: string, otp: string) => {
        const { data: res } = await api.post('/auth/verify-otp', { email, otp });
        const { token, user } = res.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        setState({ user, token, isAuthenticated: true, isLoading: false });
    }, []);

    const register = useCallback(
        async (name: string, email: string, password: string, phone?: string) => {
            const { data: res } = await api.post('/auth/register', {
                name,
                email,
                password,
                phone,
            });
            const { token, user } = res.data;
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            setState({ user, token, isAuthenticated: true, isLoading: false });
        },
        []
    );

    const logout = useCallback(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setState({ user: null, token: null, isAuthenticated: false, isLoading: false });
    }, []);

    const updateUser = useCallback((user: User) => {
        localStorage.setItem('user', JSON.stringify(user));
        setState((s) => ({ ...s, user }));
    }, []);

    return (
        <AuthContext.Provider value={{ ...state, login, verifyOtp, register, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};
