
"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';

import { ItemCard } from '@/components/items/ItemCard';
import type { RentalItem, UserProfile } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { UserCircle, PackageOpen, ArrowLeft, MessageSquare, Loader2 } from 'lucide-react';
import { getAllItems } from '@/lib/item-storage';
import { getAllMockUsers } from '@/lib/auth';

interface UserPageData {
  user: UserProfile;
  items: RentalItem[];
}

export default function UserProfilePage() {
  const params = useParams();
  const userId = params.userId as string;

  const [data, setData] = useState<UserPageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      const fetchUserData = async () => {
        setIsLoading(true);
        try {
          // Both functions now safely use localStorage on the client
          const allUsers = getAllMockUsers();
          const user = allUsers.find(u => u.id === userId);

          if (!user) {
            setError("User not found.");
            setData(null);
            return;
          }

          const allItems = await getAllItems();
          const userItems = allItems.filter(item => item.owner.id === userId && item.availabilityStatus === 'Available');

          setData({ user, items: userItems });
        } catch (e) {
          console.error("Failed to fetch user data:", e);
          setError("An error occurred while loading the profile.");
        } finally {
          setIsLoading(false);
        }
      };
      fetchUserData();
    }
  }, [userId]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg text-muted-foreground">Loading user profile...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center">
        <Alert variant="destructive" className="max-w-md">
          <UserCircle className="h-4 w-4" />
          <AlertTitle>{error === "User not found." ? "User Not Found" : "Error"}</AlertTitle>
          <AlertDescription>
            {error || "The user profile you are looking for does not exist."}
          </AlertDescription>
        </Alert>
        <Button asChild variant="outline" className="mt-6">
          <Link href="/"><ArrowLeft className="mr-2 h-4 w-4" />Back to Home</Link>
        </Button>
      </div>
    );
  }

  const { user, items } = data;

  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            <Image
              src={user.avatarUrl || 'https://placehold.co/120x120.png'}
              alt={user.name}
              width={100}
              height={100}
              className="rounded-full border-4 border-primary/50 shadow-md"
              data-ai-hint="profile person large"
            />
            <div>
              <CardTitle className="text-3xl font-headline text-primary mb-1">{user.name.split('(')[0].trim()}</CardTitle>
              <p className="text-muted-foreground">Member since {new Date().getFullYear() - Math.floor(Math.random() * 3 + 1)}</p>
            </div>
            <Button asChild variant="outline" className="mt-4 sm:mt-0 sm:ml-auto">
              <Link href={`/messages?with=${user.id}`}><MessageSquare className="mr-2 h-4 w-4" />Contact {user.name.split(' ')[0]}</Link>
            </Button>
          </div>
        </CardHeader>
      </Card>
      
      <section>
        <h2 className="text-2xl font-bold font-headline mb-6 text-foreground">
          Items for Rent by {user.name.split(' ')[0]}
        </h2>
        {items.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((item) => (
              <ItemCard key={item.id} item={item} /> 
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border-2 border-dashed border-muted rounded-lg">
            <PackageOpen className="mx-auto h-16 w-16 text-muted-foreground opacity-50 mb-4" />
            <h3 className="text-xl font-semibold text-muted-foreground mb-2">No Available Items</h3>
            <p className="text-foreground">{user.name.split(' ')[0]} doesn't have any items currently available for rent.</p>
          </div>
        )}
      </section>
       <div className="mt-8 text-center">
        <Button asChild variant="outline">
          <Link href="/"><ArrowLeft className="mr-2 h-4 w-4" />Back to All Listings</Link>
        </Button>
      </div>
    </div>
  );
}
