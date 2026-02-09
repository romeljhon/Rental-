/**
 * Authentication Service
 * Handles user authentication and registration
 */

import { apiClient } from '@/lib/api-client';
import type { UserProfile } from '@/types';

interface LoginRequest {
    username: string;
    password: string;
}

interface RegisterRequest {
    username: string;
    email: string;
    password: string;
    password2?: string;
}

interface AuthResponse {
    user: {
        id: number;
        username: string;
        email: string;
        first_name?: string;
        last_name?: string;
    };
    token: string;
}

export const authService = {
    /**
     * Register a new user
     */
    async register(data: RegisterRequest): Promise<AuthResponse> {
        const response = await apiClient.post<AuthResponse>('/register/', data);

        // Store token and user info
        if (typeof window !== 'undefined' && response.token) {
            localStorage.setItem('rentsnapToken', response.token);
            localStorage.setItem('rentsnapActiveUserId', response.user.id.toString());
            localStorage.setItem('rentsnapUser', JSON.stringify(response.user));
        }

        return response;
    },

    /**
     * Login user
     */
    async login(data: LoginRequest): Promise<AuthResponse> {
        const response = await apiClient.post<AuthResponse>('/login/', data);

        // Store token and user info
        if (typeof window !== 'undefined' && response.token) {
            localStorage.setItem('rentsnapToken', response.token);
            localStorage.setItem('rentsnapActiveUserId', response.user.id.toString());
            localStorage.setItem('rentsnapUser', JSON.stringify(response.user));
        }

        return response;
    },

    /**
     * Logout user
     */
    logout(): void {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('rentsnapToken');
            localStorage.removeItem('rentsnapActiveUserId');
            localStorage.removeItem('rentsnapUser');
            apiClient.clearCache();
            window.location.href = '/login';
        }
    },

    /**
     * Get current user
     */
    getCurrentUser(): UserProfile | null {
        if (typeof window !== 'undefined') {
            const userStr = localStorage.getItem('rentsnapUser');
            const userId = localStorage.getItem('rentsnapActiveUserId');

            if (userStr && userId) {
                try {
                    const user = JSON.parse(userStr);
                    return {
                        id: user.id.toString(),
                        name: user.username || `User ${user.id}`,
                        avatarUrl: user.avatar_url || 'https://placehold.co/40x40.png',
                        email: user.email,
                    };
                } catch (e) {
                    console.error('Failed to parse user:', e);
                }
            }
        }
        return null;
    },

    /**
     * Check if user is authenticated
     */
    isAuthenticated(): boolean {
        if (typeof window !== 'undefined') {
            return !!localStorage.getItem('rentsnapToken');
        }
        return false;
    },

    /**
     * Get auth token
     */
    getToken(): string | null {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('rentsnapToken');
        }
        return null;
    },

    /**
     * Get user ID
     */
    getUserId(): string | null {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('rentsnapActiveUserId');
        }
        return null;
    },
};
