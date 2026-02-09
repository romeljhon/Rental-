/**
 * User Profile Page
 * View and edit user profile information
 */

'use client';

import { useState, useEffect } from 'react';
import { User, Mail, MapPin, Star, Package, Calendar, Camera, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { authService } from '@/services';
import { itemsService } from '@/services';
import { requestsService } from '@/services';
import type { RentalItem, RentalRequest } from '@/types';

export default function ProfilePage() {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const currentUser = authService.getCurrentUser();
  const [userData, setUserData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    location: '',
    bio: '',
    phone: '',
  });

  const [stats, setStats] = useState({
    totalListings: 0,
    activeRentals: 0,
    totalRevenue: 0,
    averageRating: 4.8,
    reviewsCount: 0,
    memberSince: new Date(),
  });

  useEffect(() => {
    if (currentUser) {
      loadUserData();
    }
  }, [currentUser]);

  const loadUserData = async () => {
    if (!currentUser) return;

    setIsLoading(true);
    try {
      // Load user's items and requests
      const [items, requests] = await Promise.all([
        itemsService.getByOwner(currentUser.id),
        requestsService.getByOwner(currentUser.id),
      ]);

      // Calculate stats
      const activeRentals = items.filter(item => item.availabilityStatus === 'Rented').length;
      const completedRequests = requests.filter(r =>
        r.status === 'Completed' || r.status === 'ReceiptConfirmed'
      );
      const totalRevenue = completedRequests.reduce((sum, req) => sum + req.totalPrice, 0);

      setStats({
        totalListings: items.length,
        activeRentals,
        totalRevenue,
        averageRating: 4.8, // Would come from backend in real app
        reviewsCount: completedRequests.length,
        memberSince: new Date(2024, 0, 1), // Would come from backend
      });
    } catch (error) {
      console.error('Failed to load user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // In a real app, this would call an API to update the user profile
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call

      toast({
        title: 'Profile Updated',
        description: 'Your profile has been successfully updated.',
      });
      setIsEditing(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!currentUser || isLoading) {
    return (
      <ProtectedRoute>
        <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="space-y-8 pb-20">
        {/* Profile Header */}
        <div className="bg-white dark:bg-slate-900 rounded-[3rem] border-2 border-primary/10 overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20" />

          <div className="px-8 pb-8">
            <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-end -mt-16">
              {/* Avatar */}
              <div className="relative group">
                <Avatar className="h-32 w-32 border-4 border-white dark:border-slate-900 shadow-2xl">
                  <AvatarImage src={currentUser.avatarUrl} />
                  <AvatarFallback className="text-3xl font-black">
                    {currentUser.name[0]}
                  </AvatarFallback>
                </Avatar>
                <button className="absolute bottom-2 right-2 p-2 rounded-full bg-primary text-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="h-4 w-4" />
                </button>
              </div>

              {/* User Info */}
              <div className="flex-1 mt-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-3xl font-black text-foreground tracking-tight">
                      {currentUser.name}
                    </h1>
                    <p className="text-muted-foreground flex items-center gap-2 mt-1">
                      <Mail className="h-4 w-4" />
                      {currentUser.email}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="rounded-full px-3 py-1">
                        <Star className="h-3 w-3 mr-1 fill-primary text-primary" />
                        {stats.averageRating} ({stats.reviewsCount} reviews)
                      </Badge>
                      <Badge variant="secondary" className="rounded-full px-3 py-1">
                        Member since {stats.memberSince.getFullYear()}
                      </Badge>
                    </div>
                  </div>

                  {!isEditing ? (
                    <Button
                      onClick={() => setIsEditing(true)}
                      size="lg"
                      className="rounded-2xl px-6 font-bold uppercase tracking-widest"
                    >
                      <User className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        onClick={() => setIsEditing(false)}
                        variant="outline"
                        size="lg"
                        className="rounded-2xl px-4"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSave}
                        disabled={isSaving}
                        size="lg"
                        className="rounded-2xl px-6 font-bold uppercase tracking-widest"
                      >
                        {isSaving ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4 mr-2" />
                        )}
                        Save Changes
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              <div className="p-4 rounded-2xl bg-primary/5 text-center">
                <Package className="h-6 w-6 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-black text-foreground">{stats.totalListings}</div>
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  Total Listings
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-primary/5 text-center">
                <Calendar className="h-6 w-6 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-black text-foreground">{stats.activeRentals}</div>
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  Active Rentals
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-primary/5 text-center">
                <Star className="h-6 w-6 mx-auto mb-2 text-primary fill-primary" />
                <div className="text-2xl font-black text-foreground">{stats.averageRating}</div>
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  Avg Rating
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-primary/5 text-center">
                <div className="text-2xl font-black text-primary">₱{stats.totalRevenue.toLocaleString()}</div>
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  Total Revenue
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <Tabs defaultValue="about" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 h-14 p-1 bg-white dark:bg-slate-900 rounded-2xl border-2 border-primary/10">
            <TabsTrigger value="about" className="rounded-xl font-bold text-xs uppercase tracking-widest">
              About
            </TabsTrigger>
            <TabsTrigger value="reviews" className="rounded-xl font-bold text-xs uppercase tracking-widest">
              Reviews
            </TabsTrigger>
            <TabsTrigger value="activity" className="rounded-xl font-bold text-xs uppercase tracking-widest">
              Activity
            </TabsTrigger>
          </TabsList>

          <TabsContent value="about" className="space-y-6">
            <Card className="rounded-[2.5rem] border-2 border-primary/10">
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  {isEditing ? 'Update your profile details' : 'Your public profile information'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input
                      value={userData.name}
                      onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                      disabled={!isEditing}
                      className="h-12 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={userData.email}
                      onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                      disabled={!isEditing}
                      className="h-12 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone Number</Label>
                    <Input
                      value={userData.phone}
                      onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
                      disabled={!isEditing}
                      placeholder="+63 XXX XXX XXXX"
                      className="h-12 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Location</Label>
                    <Input
                      value={userData.location}
                      onChange={(e) => setUserData({ ...userData, location: e.target.value })}
                      disabled={!isEditing}
                      placeholder="City, Country"
                      className="h-12 rounded-xl"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Bio</Label>
                  <Textarea
                    value={userData.bio}
                    onChange={(e) => setUserData({ ...userData, bio: e.target.value })}
                    disabled={!isEditing}
                    placeholder="Tell others about yourself..."
                    className="min-h-[120px] rounded-xl"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews">
            <Card className="rounded-[2.5rem] border-2 border-primary/10">
              <CardHeader>
                <CardTitle>Reviews & Ratings</CardTitle>
                <CardDescription>What others say about renting from you</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Star className="h-12 w-12 mx-auto mb-4 text-muted-foreground/20" />
                  <p className="text-sm text-muted-foreground">No reviews yet</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity">
            <Card className="rounded-[2.5rem] border-2 border-primary/10">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your rental history and transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground/20" />
                  <p className="text-sm text-muted-foreground">No recent activity</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  );
}
