/**
 * Auth Context Provider
 * Manages authentication state across the application
 */

'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '@/services';
import type { UserProfile } from '@/types';

interface AuthContextType {
    user: UserProfile | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (username: string, password: string) => Promise<void>;
    register: (username: string, email: string, password: string) => Promise<void>;
    logout: () => void;
    refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check authentication on mount
        const currentUser = authService.getCurrentUser();
        setUser(currentUser);
        setIsLoading(false);
    }, []);

    const login = async (username: string, password: string) => {
        setIsLoading(true);
        try {
            await authService.login({ username, password });
            const currentUser = authService.getCurrentUser();
            setUser(currentUser);
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (username: string, email: string, password: string) => {
        setIsLoading(true);
        try {
            await authService.register({ username, email, password });
            const currentUser = authService.getCurrentUser();
            setUser(currentUser);
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        authService.logout();
        setUser(null);
    };

    const refreshUser = () => {
        const currentUser = authService.getCurrentUser();
        setUser(currentUser);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                isLoading,
                login,
                register,
                logout,
                refreshUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
