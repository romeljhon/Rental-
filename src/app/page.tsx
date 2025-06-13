
"use client";
import React, { useState, useEffect } from 'react';
import { ItemCard } from '@/components/items/ItemCard';
import { ItemFilters } from '@/components/items/ItemFilters';
import type { RentalItem, UserProfile } from '@/types';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

const mockUser: UserProfile = { id: 'user1', name: 'John Doe', avatarUrl: 'https://placehold.co/100x100.png' };

const initialItems: RentalItem[] = [
  { id: '1', name: 'Professional DSLR Camera', description: 'High-quality Canon DSLR, perfect for events and professional photography. Comes with two lenses.', category: 'Electronics', pricePerDay: 50, imageUrl: 'https://placehold.co/600x400.png', availabilityStatus: 'Available', owner: mockUser, location: 'New York, NY', rating: 4.8, reviewsCount: 25, features: ['24MP Sensor', '4K Video', 'Includes 18-55mm & 50mm lenses'] },
  { id: '2', name: 'Mountain Bike - Full Suspension', description: 'Explore trails with this durable full-suspension mountain bike. Suitable for all terrains.', category: 'Sports & Outdoors', pricePerDay: 35, imageUrl: 'https://placehold.co/600x400.png', availabilityStatus: 'Available', owner: mockUser, location: 'Denver, CO', rating: 4.5, reviewsCount: 15, features: ['29-inch wheels', 'Hydraulic disc brakes', 'Lightweight aluminum frame'] },
  { id: '3', name: 'Vintage Leather Jacket', description: 'Stylish vintage leather jacket, medium size. Adds a cool touch to any outfit.', category: 'Apparel', pricePerDay: 20, imageUrl: 'https://placehold.co/600x400.png', availabilityStatus: 'Rented', owner: mockUser, location: 'Los Angeles, CA', rating: 4.2, reviewsCount: 8 },
  { id: '4', name: 'Portable Bluetooth Speaker', description: 'Loud and clear portable speaker with 12-hour battery life. Waterproof.', category: 'Electronics', pricePerDay: 15, imageUrl: 'https://placehold.co/600x400.png', availabilityStatus: 'Available', owner: mockUser, location: 'Chicago, IL', rating: 4.9, reviewsCount: 42 },
  { id: '5', name: 'Cozy Downtown Apartment', description: '1-bedroom apartment in the heart of the city. Fully furnished with modern amenities.', category: 'Property', pricePerDay: 120, imageUrl: 'https://placehold.co/600x400.png', availabilityStatus: 'Available', owner: mockUser, location: 'San Francisco, CA', rating: 4.7, reviewsCount: 18, features: ['Sleeps 2', 'WiFi', 'Kitchenette'] },
  { id: '6', name: 'Heavy Duty Power Drill', description: 'Cordless power drill with multiple bits. Ideal for DIY projects.', category: 'Tools', pricePerDay: 25, imageUrl: 'https://placehold.co/600x400.png', availabilityStatus: 'Unavailable', owner: mockUser, location: 'Austin, TX', rating: 4.3, reviewsCount: 10 },
];

export default function HomePage() {
  const [items, setItems] = useState<RentalItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<RentalItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState(''); // Empty string means "all" or no filter initially
  const [sortOption, setSortOption] = useState('relevance');

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setItems(initialItems);
      setFilteredItems(initialItems);
      setIsLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    let currentItems = [...items];

    if (searchTerm) {
      currentItems = currentItems.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // If category is set and it's not "all", then filter by it.
    // An empty string for category (initial or cleared state) also means no category filter.
    if (category && category !== 'all') {
      currentItems = currentItems.filter(item => item.category.toLowerCase().replace(/\s*&\s*/, '').replace(/\s+/g, '') === category);
    }
    
    // Sorting logic
    switch (sortOption) {
      case 'price_asc':
        currentItems.sort((a, b) => a.pricePerDay - b.pricePerDay);
        break;
      case 'price_desc':
        currentItems.sort((a, b) => b.pricePerDay - a.pricePerDay);
        break;
      case 'newest': // Assuming items have a creation date or rely on ID order for mock
        currentItems.sort((a, b) => parseInt(b.id) - parseInt(a.id)); // Simple sort by ID for mock
        break;
      case 'rating':
        currentItems.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      default: // relevance (no specific logic for mock, keep original order or search-based order)
        break;
    }


    setFilteredItems(currentItems);
  }, [searchTerm, category, sortOption, items]);

  if (isLoading) {
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
          <p className="text-foreground">Try adjusting your search or filters.</p>
           <Button variant="outline" className="mt-4" onClick={() => { setSearchTerm(''); setCategory(''); }}>
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
}
