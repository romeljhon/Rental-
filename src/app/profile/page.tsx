
"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserCog, Save, Loader2, Camera } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { UserProfile } from '@/types';
import { getActiveUserProfile, updateUserProfileInStorage } from '@/lib/auth';
import { useRouter } from 'next/navigation';

const profileFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  avatarUrl: z.string().url({ message: "Please enter a valid URL for the avatar." }).or(z.literal('')).optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function ProfilePage() {
  const { toast } = useToast();
  const router = useRouter();
  const [activeUser, setActiveUser] = useState<UserProfile | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(undefined);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: '',
      avatarUrl: '',
    },
  });

  useEffect(() => {
    const user = getActiveUserProfile();
    setActiveUser(user);
    if (user) {
      form.reset({
        name: user.name.split('(')[0].trim(), // Remove "(Owner)" or "(Renter)" part for editing
        avatarUrl: user.avatarUrl || '',
      });
      setAvatarPreview(user.avatarUrl);
    }
  }, [form]);

  const watchedAvatarUrl = form.watch('avatarUrl');

  useEffect(() => {
    setAvatarPreview(watchedAvatarUrl);
  }, [watchedAvatarUrl]);

  const onSubmit = async (data: ProfileFormValues) => {
    if (!activeUser) {
      toast({ title: "Error", description: "No active user found.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      // Re-append role indication if it was part of the original name, for display consistency elsewhere
      const originalRoleSuffix = activeUser.name.match(/\(.*\)/);
      const newDisplayName = originalRoleSuffix ? `${data.name.trim()} ${originalRoleSuffix[0]}` : data.name.trim();

      const success = updateUserProfileInStorage(activeUser.id, newDisplayName, data.avatarUrl || '');
      if (success) {
        toast({
          title: "Profile Updated",
          description: "Your profile information has been saved.",
        });
        // Force a re-fetch of user profile for header and other components
        // A common way is to briefly change then revert a query param, or use router.refresh()
        router.refresh(); 
        // Update local state for immediate feedback on the page if needed, though router.refresh() should handle it
        setActiveUser(prev => prev ? {...prev, name: newDisplayName, avatarUrl: data.avatarUrl || prev.avatarUrl} : null);

      } else {
        toast({ title: "Error", description: "Could not update profile.", variant: "destructive" });
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast({ title: "Error", description: "An unexpected error occurred.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!activeUser) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl font-headline text-primary flex items-center gap-2">
            <UserCog className="h-7 w-7" />
            My Profile
          </CardTitle>
          <CardDescription>View and update your personal information.</CardDescription>
        </CardHeader>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="h-32 w-32 border-4 border-primary/30 shadow-md">
                <AvatarImage src={avatarPreview || activeUser.avatarUrl} alt={activeUser.name} data-ai-hint="profile person large" />
                <AvatarFallback className="text-4xl">
                  {activeUser.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="w-full space-y-1">
                 <Label htmlFor="avatarUrl" className="flex items-center gap-1.5"><Camera size={14}/> Avatar URL</Label>
                <Controller
                  name="avatarUrl"
                  control={form.control}
                  render={({ field }) => (
                    <Input
                      id="avatarUrl"
                      placeholder="https://example.com/avatar.png"
                      {...field}
                      disabled={isSubmitting}
                    />
                  )}
                />
                {form.formState.errors.avatarUrl && (
                  <p className="text-sm text-destructive">{form.formState.errors.avatarUrl.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="name">Full Name</Label>
              <Controller
                name="name"
                control={form.control}
                render={({ field }) => (
                  <Input 
                    id="name" 
                    placeholder="Your full name" 
                    {...field} 
                    disabled={isSubmitting} 
                  />
                )}
              />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
              )}
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="email">Email Address</Label>
              <Input 
                id="email" 
                type="email"
                value={activeUser.id.includes('user123') ? "alice.w@example.com" : "john.doe@example.com"} // Mock email based on ID
                disabled 
                className="bg-muted/50 cursor-not-allowed"
              />
               <p className="text-xs text-muted-foreground">Email address cannot be changed.</p>
            </div>

          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save Changes
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
