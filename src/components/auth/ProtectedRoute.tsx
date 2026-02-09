/**
 * Protected Route Component
 * Redirects unauthenticated users to login
 */

'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { authService } from '@/services';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

export function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
    const router = useRouter();
    const pathname = usePathname();
    const isAuthenticated = authService.isAuthenticated();

    useEffect(() => {
        if (!isAuthenticated) {
            // Store intended destination
            sessionStorage.setItem('redirectAfterLogin', pathname);
            router.push('/login');
        }
    }, [isAuthenticated, router, pathname]);

    if (!isAuthenticated) {
        return fallback || (
            <div className="flex justify-center items-center min-h-screen">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

    return <>{children}</>;
}

/**
 * Redirect if authenticated (for login/register pages)
 */
export function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const isAuthenticated = authService.isAuthenticated();

    useEffect(() => {
        if (isAuthenticated) {
            const redirectTo = sessionStorage.getItem('redirectAfterLogin') || '/';
            sessionStorage.removeItem('redirectAfterLogin');
            router.push(redirectTo);
        }
    }, [isAuthenticated, router]);

    if (isAuthenticated) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

    return <>{children}</>;
}
