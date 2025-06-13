
"use client";
import React, { useState, useEffect } from 'react';
import { ItemCard } from '@/components/items/ItemCard';
import type { RentalItem, UserProfile } from '@/types';
import { Button } from '@/components/ui/button';
import { Loader2, PackageOpen, ListChecks } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation'; 
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
import { getActiveUserId } from '@/lib/auth';
import { getAllItems, deleteItem } from '@/lib/item-storage'; // Updated import

export default function MyItemsPage() {
  const [activeUserId, setActiveUserId] = useState<string | null>(null);
  const [myItems, setMyItems] = useState<RentalItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter(); 
  const [itemToRemove, setItemToRemove] = useState<RentalItem | null>(null);

  const fetchUserItems = async (userId: string) => {
    setIsLoading(true);
    try {
      const allItems = await getAllItems();
      const itemsOwnedByUser = allItems.filter(item => item.owner.id === userId);
      setMyItems(itemsOwnedByUser);
    } catch (error) {
      console.error("Failed to fetch user items:", error);
      toast({ title: "Error", description: "Could not load your items.", variant: "destructive" });
      setMyItems([]); // Set to empty on error
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const currentId = getActiveUserId();
    setActiveUserId(currentId);
    if (currentId) {
      fetchUserItems(currentId);
    } else {
        setIsLoading(false); // No user ID, stop loading
    }
  }, []); // Fetch on initial mount based on initial active user

  // Refetch items if activeUserId changes (e.g., user switches profile in header)
  useEffect(() => {
    const handleUserSwitch = () => {
        const newActiveId = getActiveUserId();
        if (newActiveId !== activeUserId) { // Check if user actually changed
            setActiveUserId(newActiveId);
            if (newActiveId) {
                fetchUserItems(newActiveId);
            } else {
                setMyItems([]);
                setIsLoading(false);
            }
        }
    };

    // Listen for storage changes as a proxy for user switching if direct event isn't available
    window.addEventListener('storage', handleUserSwitch);
    // Also re-check on focus in case localStorage was changed in another tab
    window.addEventListener('focus', handleUserSwitch);


    // Initial fetch if activeUserId is already set but perhaps items weren't loaded
    // This is more for robustness if the first useEffect's conditions weren't perfectly met
    if (activeUserId && myItems.length === 0 && !isLoading) { // Avoid re-fetching if already loading or has items
        // fetchUserItems(activeUserId); // Commented out to avoid potential rapid re-fetches; rely on user switch or initial load.
    }
    
    return () => {
        window.removeEventListener('storage', handleUserSwitch);
        window.removeEventListener('focus', handleUserSwitch);
    };
  }, [activeUserId, isLoading, myItems.length]); // Dependencies for re-running the effect

  const handleEditItem = (itemId: string) => {
    router.push(`/items/${itemId}/edit`);
  };

  const confirmRemoveItem = async () => {
    if (!itemToRemove || !activeUserId) return;
    setIsLoading(true); // Indicate activity
    try {
      const success = await deleteItem(itemToRemove.id);
      if (success) {
        toast({
          title: 'Item Removed',
          description: `"${itemToRemove.name}" has been removed from your listings.`,
        });
        // Refetch items for the current user to update the list
        await fetchUserItems(activeUserId);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to remove item. It might have already been deleted.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error("Error removing item:", error);
      toast({ title: "Error", description: "Could not remove item.", variant: "destructive" });
    } finally {
      setItemToRemove(null); 
      // setIsLoading(false); // fetchUserItems will set this
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
    <div className="space-y-8">
      <section className="py-4">
        <h1 className="text-3xl md:text-4xl font-bold font-headline mb-3 text-primary flex items-center gap-3">
          <ListChecks className="h-8 w-8" />
          My Listed Items
        </h1>
        <p className="text-lg text-muted-foreground">
          Manage and view all the items you've made available for rent.
        </p>
      </section>

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
  );
}
