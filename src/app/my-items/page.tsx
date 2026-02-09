
"use client";
import React, { useState, useEffect } from 'react';
import { ItemCard } from '@/components/items/ItemCard';
import type { RentalItem, UserProfile, RentalRequest } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, PackageOpen, ListChecks, TrendingUp, CreditCard, Activity, LayoutDashboard, Bike, Car } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { authService, itemsService, requestsService } from '@/services';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
// Removing storage imports
// import { getAllItems, deleteItem } from '@/lib/item-storage';
// import { getAllRequests } from '@/lib/request-storage';
import { format } from 'date-fns';

export default function MyItemsPage() {
  const [activeUserId, setActiveUserId] = useState<string | null>(null);
  const [myItems, setMyItems] = useState<RentalItem[]>([]);
  const [myRequests, setMyRequests] = useState<RentalRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();
  const [itemToRemove, setItemToRemove] = useState<RentalItem | null>(null);

  // Stats
  const revenue = myRequests
    .filter(req => req.status === 'Completed' || req.status === 'ReceiptConfirmed')
    .reduce((sum, req) => sum + req.totalPrice, 0);

  const activeRentalsCount = myItems.filter(item => item.availabilityStatus === 'Rented').length;
  // Requests for my items that are pending
  const pendingRequestsCount = myRequests.filter(req => req.status === 'Pending').length;

  const fetchUserItems = async (userId: string) => {
    setIsLoading(true);
    try {
      const [items, requests] = await Promise.all([
        itemsService.getByOwner(userId),
        requestsService.getByOwner(userId)
      ]);

      setMyItems(items);
      setMyRequests(requests);
    } catch (error) {
      console.error("Failed to fetch user items/requests:", error);
      toast({ title: "Error", description: "Could not load your fleet data.", variant: "destructive" });
      setMyItems([]);
      setMyRequests([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user) {
      setActiveUserId(user.id);
      fetchUserItems(user.id);
    } else {
      router.push('/login');
    }
  }, []);

  const handleEditItem = (itemId: string) => {
    router.push(`/items/${itemId}/edit`);
  };

  const confirmRemoveItem = async () => {
    if (!itemToRemove || !activeUserId) return;
    setIsLoading(true); // Indicate activity
    try {
      await itemsService.delete(itemToRemove.id);

      toast({
        title: 'Item Removed',
        description: `"${itemToRemove.name}" has been removed from your listings.`,
      });
      // Refetch items for the current user to update the list
      await fetchUserItems(activeUserId);

    } catch (error) {
      console.error("Error removing item:", error);
      toast({ title: "Error", description: "Could not remove item.", variant: "destructive" });
    } finally {
      setItemToRemove(null);
    }
  };

  const openRemoveConfirmation = (itemId: string) => {
    const item = myItems.find(i => i.id === itemId);
    if (item) {
      setItemToRemove(item);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg text-muted-foreground">Loading your items...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20">
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl md:text-5xl font-black font-headline text-foreground tracking-tight flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-primary shadow-lg shadow-primary/20">
              <LayoutDashboard className="h-8 w-8 text-white" />
            </div>
            Fleet <span className="text-primary">Monitor</span>
          </h1>
          <p className="text-lg text-muted-foreground font-medium max-w-xl">
            Real-time overview of your rental business. Track your revenue, item health, and active rentals in one place.
          </p>
        </div>
        <Button size="lg" className="rounded-2xl h-14 px-8 font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 transition-all" onClick={() => router.push('/items/new')}>
          Add New Vehicle
        </Button>
      </section>

      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="rounded-[2.5rem] border-primary/10 shadow-xl bg-primary text-white overflow-hidden relative group">
          <div className="absolute -right-4 -bottom-4 opacity-10 transition-transform group-hover:scale-125 duration-500">
            <TrendingUp className="h-40 w-40" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 flex items-center gap-2">
              <CreditCard className="h-3.5 w-3.5" /> Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black tracking-tighter">₱{revenue.toLocaleString()}</div>
            <p className="text-xs font-bold opacity-60 mt-1 uppercase tracking-widest">+12.5% from last month</p>
          </CardContent>
        </Card>

        <Card className="rounded-[2.5rem] border-primary/10 shadow-xl bg-white dark:bg-slate-900 overflow-hidden relative group">
          <div className="absolute -right-4 -bottom-4 opacity-5 text-primary transition-transform group-hover:scale-125 duration-500">
            <Activity className="h-40 w-40" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
              <Activity className="h-3.5 w-3.5 text-primary" /> Active Rentals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black tracking-tighter text-foreground">{activeRentalsCount} <span className="text-sm font-bold text-muted-foreground tracking-normal">Units</span></div>
            <p className="text-xs font-bold text-primary mt-1 uppercase tracking-widest">{pendingRequestsCount} pending requests</p>
          </CardContent>
        </Card>

        <Card className="rounded-[2.5rem] border-primary/10 shadow-xl bg-white dark:bg-slate-900 overflow-hidden relative group">
          <div className="absolute -right-4 -bottom-4 opacity-5 text-primary transition-transform group-hover:scale-125 duration-500">
            <Car className="h-40 w-40" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
              <ListChecks className="h-3.5 w-3.5 text-primary" /> Fleet Size
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black tracking-tighter text-foreground">{myItems.length} <span className="text-sm font-bold text-muted-foreground tracking-normal">Listed</span></div>
            <p className="text-xs font-bold text-muted-foreground mt-1 uppercase tracking-widest">Across {new Set(myItems.map(i => i.category)).size} Categories</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black font-headline text-foreground tracking-tight">Active Fleet Inventory</h2>
          <div className="flex gap-2">
            <Badge variant="outline" className="rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-widest border-primary/20 text-primary bg-primary/5">All Items</Badge>
          </div>
        </div>

        {myItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {myItems.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                onEdit={handleEditItem}
                onRemove={openRemoveConfirmation}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border-2 border-dashed border-muted rounded-lg">
            <PackageOpen className="mx-auto h-16 w-16 text-muted-foreground opacity-50 mb-4" />
            <h2 className="text-2xl font-semibold text-muted-foreground mb-2">No Items Listed Yet</h2>
            <p className="text-foreground mb-4">You haven't listed any items for rent. Add your first item today!</p>
            <Button variant="default" size="lg" onClick={() => router.push('/items/new')}>
              List an Item
            </Button>
          </div>
        )}

        {itemToRemove && (
          <AlertDialog open={!!itemToRemove} onOpenChange={(open) => !open && setItemToRemove(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure you want to remove this item?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently remove "{itemToRemove.name}" from your listings.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setItemToRemove(null)}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={confirmRemoveItem} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                  Remove Item
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </div>
  );
}
