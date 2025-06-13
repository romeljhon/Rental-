
"use client";
import React, { useState, useEffect } from 'react';
import { ItemCard } from '@/components/items/ItemCard';
import { ItemFilters } from '@/components/items/ItemFilters';
import type { RentalItem, UserProfile } from '@/types';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { getActiveUserId } from '@/lib/auth'; // Added import

const mockUser: UserProfile = { id: 'user1', name: 'John Doe', avatarUrl: 'https://placehold.co/100x100.png' };
const mockUser2: UserProfile = { id: 'user2', name: 'Jane Smith', avatarUrl: 'https://placehold.co/100x100.png' };
const mockUserAlice: UserProfile = { id: 'user123', name: 'Alice W.', avatarUrl: 'https://placehold.co/100x100.png' };


const getFutureDate = (days: number): Date => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
};

// Items from different owners
const allMockItems: RentalItem[] = [
  { id: '1', name: 'Professional DSLR Camera (Johns)', description: 'High-quality Canon DSLR, perfect for events and professional photography. Comes with two lenses.', category: 'Electronics', pricePerDay: 50, imageUrl: 'https://placehold.co/600x400.png', availabilityStatus: 'Available', owner: mockUser, location: 'New York, NY', rating: 4.8, reviewsCount: 25, features: ['24MP Sensor', '4K Video', 'Includes 18-55mm & 50mm lenses'], deliveryMethod: 'Pick Up', availableFromDate: getFutureDate(0) },
  { id: '2', name: 'Mountain Bike - Full Suspension (Johns)', description: 'Explore trails with this durable full-suspension mountain bike. Suitable for all terrains.', category: 'Sports & Outdoors', pricePerDay: 35, imageUrl: 'https://placehold.co/600x400.png', availabilityStatus: 'Available', owner: mockUser, location: 'Denver, CO', rating: 4.5, reviewsCount: 15, features: ['29-inch wheels', 'Hydraulic disc brakes', 'Lightweight aluminum frame'], deliveryMethod: 'Delivery', availableFromDate: getFutureDate(0) },
  { id: '3', name: 'Vintage Leather Jacket (Johns)', description: 'Stylish vintage leather jacket, medium size. Adds a cool touch to any outfit.', category: 'Apparel', pricePerDay: 20, imageUrl: 'https://placehold.co/600x400.png', availabilityStatus: 'Rented', availableFromDate: getFutureDate(7), owner: mockUser, location: 'Los Angeles, CA', rating: 4.2, reviewsCount: 8, deliveryMethod: 'Both' },
  { id: '4', name: 'Portable Bluetooth Speaker (Janes)', description: 'Loud and clear portable speaker with 12-hour battery life. Waterproof.', category: 'Electronics', pricePerDay: 15, imageUrl: 'https://placehold.co/600x400.png', availabilityStatus: 'Available', owner: mockUser2, location: 'Chicago, IL', rating: 4.9, reviewsCount: 42, deliveryMethod: 'Delivery', availableFromDate: getFutureDate(0) },
  { id: '5', name: 'Cozy Downtown Apartment (Johns)', description: '1-bedroom apartment in the heart of the city. Fully furnished with modern amenities.', category: 'Property', pricePerDay: 120, imageUrl: 'https://placehold.co/600x400.png', availabilityStatus: 'Available', owner: mockUser, location: 'San Francisco, CA', rating: 4.7, reviewsCount: 18, features: ['Sleeps 2', 'WiFi', 'Kitchenette'], deliveryMethod: 'Both', availableFromDate: getFutureDate(0) },
  { id: '6', name: 'Heavy Duty Power Drill (Janes)', description: 'Cordless power drill with multiple bits. Ideal for DIY projects.', category: 'Tools', pricePerDay: 25, imageUrl: 'https://placehold.co/600x400.png', availabilityStatus: 'Unavailable', owner: mockUser2, location: 'Austin, TX', rating: 4.3, reviewsCount: 10, deliveryMethod: 'Pick Up', availableFromDate: getFutureDate(0) },
  { id: 'alice_item_1', name: 'Yoga Mat (Alices)', description: 'Premium non-slip yoga mat.', category: 'Sports & Outdoors', pricePerDay: 10, imageUrl: 'https://placehold.co/600x400.png', availabilityStatus: 'Available', owner: mockUserAlice, location: 'San Francisco, CA', rating: 4.7, reviewsCount: 18, deliveryMethod: 'Pick Up', availableFromDate: getFutureDate(0) },
  { id: 'alice_item_2', name: 'Ukulele (Alices)', description: 'Fun and easy to play concert ukulele.', category: 'Musical Instruments', pricePerDay: 12, imageUrl: 'https://placehold.co/600x400.png', availabilityStatus: 'Rented', availableFromDate: getFutureDate(3), owner: mockUserAlice, location: 'San Francisco, CA', rating: 4.5, reviewsCount: 5, deliveryMethod: 'Both' },
];

export default function HomePage() {
  const [items, setItems] = useState<RentalItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<RentalItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeUserId, setActiveUserId] = useState<string | null>(null); // Added state for active user
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState(''); 
  const [sortOption, setSortOption] = useState('relevance');

  useEffect(() => {
    // Get active user ID on mount
    const currentActiveId = getActiveUserId();
    setActiveUserId(currentActiveId);
  }, []);

  useEffect(() => {
    // Simulate fetching items
    // This effect runs once to set the initial 'items' state
    if (activeUserId !== null) { // Ensure activeUserId is loaded before proceeding
        setIsLoading(true);
        setTimeout(() => {
          const availableAndRentedItems = allMockItems.filter(item => item.availabilityStatus !== 'Unavailable');
          setItems(availableAndRentedItems);
          // Initial filtering logic is now handled in the next useEffect
          setIsLoading(false);
        }, 500); // Shortened delay, actual loading might vary
    }
  }, [activeUserId]);


  useEffect(() => {
    // This effect handles all filtering, including the owner filter
    if (!isLoading && activeUserId !== null) { // Ensure items are loaded and activeUserId is known
      let currentItems = [...items];

      // Filter out items owned by the active user
      if (activeUserId) {
        currentItems = currentItems.filter(item => item.owner.id !== activeUserId);
      }

      if (searchTerm) {
        currentItems = currentItems.filter(item =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      if (category && category !== 'all') {
        currentItems = currentItems.filter(item => item.category.toLowerCase().replace(/\s*&\s*/, '').replace(/\s+/g, '') === category);
      }
      
      switch (sortOption) {
        case 'price_asc':
          currentItems.sort((a, b) => a.pricePerDay - b.pricePerDay);
          break;
        case 'price_desc':
          currentItems.sort((a, b) => b.pricePerDay - a.pricePerDay);
          break;
        case 'newest': 
          currentItems.sort((a, b) => {
            const idA = parseInt(a.id.replace(/[^0-9]/g, ''), 10); // Attempt to get numeric part of ID
            const idB = parseInt(b.id.replace(/[^0-9]/g, ''), 10);
            if (isNaN(idA) || isNaN(idB)) return 0;
            return idB - idA;
          });
          break;
        case 'rating':
          currentItems.sort((a, b) => (b.rating || 0) - (a.rating || 0));
          break;
        default: 
          break;
      }
      setFilteredItems(currentItems);
    }
  }, [searchTerm, category, sortOption, items, activeUserId, isLoading]);

  if (isLoading || activeUserId === null) { // Show loader until activeUserId is resolved and items potentially filtered
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg text-muted-foreground">Loading awesome rentals...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="text-center py-8">
        <h1 className="text-4xl md:text-5xl font-bold font-headline mb-4 text-primary">
          Discover Your Next Rental
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          From everyday essentials to unique experiences, find what you need, when you need it.
        </p>
      </section>

      <ItemFilters 
        onSearchChange={setSearchTerm} 
        onCategoryChange={setCategory}
        onSortChange={setSortOption}
      />

      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-muted-foreground mb-2">No Items Found</h2>
          <p className="text-foreground">Try adjusting your search or filters, or check back later!</p>
           <Button variant="outline" className="mt-4" onClick={() => { setSearchTerm(''); setCategory(''); setSortOption('relevance'); }}>
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
}
