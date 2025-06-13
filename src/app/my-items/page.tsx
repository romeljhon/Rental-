
"use client";
import React, { useState, useEffect } from 'react';
import { ItemCard } from '@/components/items/ItemCard';
import type { RentalItem, UserProfile } from '@/types';
import { Button } from '@/components/ui/button';
import { Loader2, PackageOpen, ListChecks } from 'lucide-react';

// This would typically be the ID of the logged-in user.
// For mock purposes, we use the ID of the mockUser from other pages.
const CURRENT_OWNER_ID = 'user1'; 

// Using the same mock user and initial items for consistency
const mockUser: UserProfile = { id: 'user1', name: 'John Doe', avatarUrl: 'https://placehold.co/100x100.png' };

const allMockItems: RentalItem[] = [
  { id: '1', name: 'Professional DSLR Camera', description: 'High-quality Canon DSLR, perfect for events and professional photography. Comes with two lenses.', category: 'Electronics', pricePerDay: 50, imageUrl: 'https://placehold.co/600x400.png', availabilityStatus: 'Available', owner: mockUser, location: 'New York, NY', rating: 4.8, reviewsCount: 25, features: ['24MP Sensor', '4K Video', 'Includes 18-55mm & 50mm lenses'] },
  { id: '2', name: 'Mountain Bike - Full Suspension', description: 'Explore trails with this durable full-suspension mountain bike. Suitable for all terrains.', category: 'Sports & Outdoors', pricePerDay: 35, imageUrl: 'https://placehold.co/600x400.png', availabilityStatus: 'Available', owner: mockUser, location: 'Denver, CO', rating: 4.5, reviewsCount: 15, features: ['29-inch wheels', 'Hydraulic disc brakes', 'Lightweight aluminum frame'] },
  { id: '3', name: 'Vintage Leather Jacket', description: 'Stylish vintage leather jacket, medium size. Adds a cool touch to any outfit.', category: 'Apparel', pricePerDay: 20, imageUrl: 'https://placehold.co/600x400.png', availabilityStatus: 'Rented', owner: mockUser, location: 'Los Angeles, CA', rating: 4.2, reviewsCount: 8 },
  { id: 'other_owner_item', name: 'Portable Projector', description: 'HD portable projector, great for movie nights.', category: 'Electronics', pricePerDay: 30, imageUrl: 'https://placehold.co/600x400.png', availabilityStatus: 'Available', owner: { id: 'user2', name: 'Jane Smith', avatarUrl: 'https://placehold.co/100x100.png'}, location: 'Chicago, IL', rating: 4.6, reviewsCount: 10 },
  { id: '4', name: 'Portable Bluetooth Speaker', description: 'Loud and clear portable speaker with 12-hour battery life. Waterproof.', category: 'Electronics', pricePerDay: 15, imageUrl: 'https://placehold.co/600x400.png', availabilityStatus: 'Available', owner: mockUser, location: 'Chicago, IL', rating: 4.9, reviewsCount: 42 },
];

export default function MyItemsPage() {
  const [myItems, setMyItems] = useState<RentalItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API call to fetch items owned by the current user
    setTimeout(() => {
      const itemsOwnedByUser = allMockItems.filter(item => item.owner.id === CURRENT_OWNER_ID);
      setMyItems(itemsOwnedByUser);
      setIsLoading(false);
    }, 500);
  }, []);

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
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border-2 border-dashed border-muted rounded-lg">
          <PackageOpen className="mx-auto h-16 w-16 text-muted-foreground opacity-50 mb-4" />
          <h2 className="text-2xl font-semibold text-muted-foreground mb-2">No Items Listed Yet</h2>
          <p className="text-foreground mb-4">You haven't listed any items for rent. Add your first item today!</p>
          <Button variant="default" size="lg" onClick={() => { /* Navigate to /items/new */ window.location.href = '/items/new'; }}>
            List an Item
          </Button>
        </div>
      )}
    </div>
  );
}
