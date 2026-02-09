
"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { UserPlus, Loader2, AlertCircle, Sparkles, ShieldCheck, ArrowRight } from 'lucide-react';
import { fetchApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function RegisterPage() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const { toast } = useToast();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const data = await fetchApi('/auth/register/', {
                method: 'POST',
                body: JSON.stringify({ username, email, password }),
            });

            localStorage.setItem('rentsnapToken', data.token);
            localStorage.setItem('rentsnapActiveUserId', data.user.id.toString());

            toast({
                title: "Account Created",
                description: `Welcome to RentSnap, ${data.user.username}!`,
            });

            router.push('/');
            router.refresh();
        } catch (err: any) {
            setError(err.message || 'Registration failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center relative overflow-hidden bg-background">
            {/* Background Decorations */}
            <div className="absolute inset-0 hero-mesh hero-gradient opacity-40 pointer-events-none" />
            <div className="absolute top-1/4 -left-20 w-80 h-80 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="container relative z-10 flex items-center justify-center px-4 py-12">
                <div className="w-full max-w-[1000px] grid lg:grid-cols-2 bg-card/30 glass border-primary/10 rounded-[2.5rem] overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-700">

                    {/* Left Side: Brand Info */}
                    <div className="hidden lg:flex flex-col justify-between p-12 bg-primary/5 border-r border-primary/10">
                        <div className="space-y-6">
                            <div className="flex items-center gap-2 text-primary">
                                <Sparkles className="h-6 w-6" />
                                <span className="font-black uppercase tracking-widest text-sm">Step into the future</span>
                            </div>
                            <h2 className="text-5xl font-black font-headline text-foreground leading-tight tracking-tighter">
                                Start your <br /><span className="text-primary italic">Rental Journey</span>
                            </h2>
                            <p className="text-lg text-muted-foreground font-medium leading-relaxed max-w-sm">
                                Join thousands of people renting high-quality gear safely and easily.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-4 p-4 rounded-2xl glass bg-white/50 dark:bg-black/20 border-white/20">
                                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                    <ShieldCheck className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="font-bold text-sm">Verified Security</p>
                                    <p className="text-xs text-muted-foreground">Encryption at every step</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Side: Form */}
                    <div className="p-8 lg:p-12 flex flex-col justify-center">
                        <div className="mb-10 text-center lg:text-left">
                            <h1 className="text-3xl font-black text-foreground mb-2">Create Account</h1>
                            <p className="text-muted-foreground font-medium">Get started in less than a minute</p>
                        </div>

                        <form onSubmit={handleRegister} className="space-y-5">
                            {error && (
                                <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-1">
                                    <AlertCircle className="h-5 w-5" />
                                    <p className="text-sm font-semibold">{error}</p>
                                </div>
                            )}

                            <div className="grid gap-5">
                                <div className="space-y-2">
                                    <Label htmlFor="username" className="text-xs font-black uppercase tracking-widest text-muted-foreground/70 ml-1">Username</Label>
                                    <Input
                                        id="username"
                                        placeholder="johndoe"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        required
                                        className="h-12 bg-primary/[0.03] border-primary/10 rounded-xl focus:ring-primary/20"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-xs font-black uppercase tracking-widest text-muted-foreground/70 ml-1">Email Address</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="john@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="h-12 bg-primary/[0.03] border-primary/10 rounded-xl focus:ring-primary/20"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="password" className="text-xs font-black uppercase tracking-widest text-muted-foreground/70 ml-1">Password</Label>
                                        <Input
                                            id="password"
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            className="h-12 bg-primary/[0.03] border-primary/10 rounded-xl focus:ring-primary/20"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="confirmPassword" className="text-xs font-black uppercase tracking-widest text-muted-foreground/70 ml-1">Confirm</Label>
                                        <Input
                                            id="confirmPassword"
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                            className="h-12 bg-primary/[0.03] border-primary/10 rounded-xl focus:ring-primary/20"
                                        />
                                    </div>
                                </div>
                            </div>

                            <Button type="submit" className="w-full h-14 text-sm font-black uppercase tracking-widest mt-6 shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:scale-[1.02] transition-all rounded-[1rem]" disabled={isLoading}>
                                {isLoading ? (
                                    <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Processsing...</>
                                ) : (
                                    <span className="flex items-center gap-2">Create My Account <ArrowRight className="h-4 w-4" /></span>
                                )}
                            </Button>
                        </form>

                        <div className="mt-10 text-center">
                            <p className="text-sm text-muted-foreground font-medium">
                                Already member?{" "}
                                <Link href="/login" className="text-primary font-black hover:underline underline-offset-4">
                                    Sign In here
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
