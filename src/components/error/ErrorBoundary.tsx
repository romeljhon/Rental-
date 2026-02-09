/**
 * Error Boundary Component
 * Catches and handles React errors gracefully
 */

'use client';

import { Component, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface ErrorBoundaryProps {
    children: ReactNode;
    fallback?: ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: any) {
        console.error('Error boundary caught:', error, errorInfo);
        // You can log to error reporting service here
        // e.g., Sentry.captureException(error);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted">
                    <div className="max-w-md w-full space-y-8 text-center">
                        {/* Error Icon */}
                        <div className="flex justify-center">
                            <div className="p-6 rounded-full bg-destructive/10">
                                <AlertCircle className="h-16 w-16 text-destructive" />
                            </div>
                        </div>

                        {/* Error Message */}
                        <div className="space-y-3">
                            <h1 className="text-3xl font-black text-foreground tracking-tight">
                                Oops! Something went wrong
                            </h1>
                            <p className="text-lg text-muted-foreground">
                                We encountered an unexpected error. Don't worry, we're on it!
                            </p>

                            {/* Error Details (Development only) */}
                            {process.env.NODE_ENV === 'development' && this.state.error && (
                                <details className="mt-4 text-left">
                                    <summary className="cursor-pointer text-sm font-bold text-destructive hover:text-destructive/80">
                                        Error Details (Dev Mode)
                                    </summary>
                                    <pre className="mt-2 p-4 rounded-xl bg-destructive/5 text-xs overflow-auto max-h-40">
                                        {this.state.error.message}
                                        {'\n\n'}
                                        {this.state.error.stack}
                                    </pre>
                                </details>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Button
                                onClick={this.handleReset}
                                size="lg"
                                className="rounded-2xl px-8 font-black uppercase tracking-widest shadow-lg"
                            >
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Try Again
                            </Button>
                            <Button
                                asChild
                                variant="outline"
                                size="lg"
                                className="rounded-2xl px-8 font-black uppercase tracking-widest"
                            >
                                <Link href="/">
                                    <Home className="mr-2 h-4 w-4" />
                                    Go Home
                                </Link>
                            </Button>
                        </div>

                        {/* Support Message */}
                        <p className="text-xs text-muted-foreground mt-8">
                            If this problem persists, please contact support
                        </p>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
