
"use client";
import React, { useState, useEffect } from 'react';
import { ItemCard } from '@/components/items/ItemCard';
import { ItemFilters } from '@/components/items/ItemFilters';
import type { RentalItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { getActiveUserId } from '@/lib/auth';
import { getAllItems } from '@/lib/item-storage'; // Updated import

export default function HomePage() {
  const [allItems, setAllItems] = useState<RentalItem[]>([]); // Store all items from storage
  const [filteredItems, setFilteredItems] = useState<RentalItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeUserId, setActiveUserId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const [sortOption, setSortOption] = useState('relevance');

  useEffect(() => {
    const currentActiveId = getActiveUserId();
    setActiveUserId(currentActiveId);
  }, []);

  useEffect(() => {
    const fetchItems = async () => {
      setIsLoading(true);
      try {
        const itemsFromStorage = await getAllItems();
        setAllItems(itemsFromStorage);
      } catch (error) {
        console.error("Failed to fetch items:", error);
        setAllItems([]); // Set to empty on error
      } finally {
        setIsLoading(false);
      }
    };

    if (activeUserId !== null) { // Ensure activeUserId is loaded before fetching
      fetchItems();
    }
  }, [activeUserId]); // Refetch if activeUserId changes (though not strictly necessary for browse page if it always shows all)


  useEffect(() => {
    if (isLoading || activeUserId === null) return; // Don't filter until data is loaded and user is known

    let currentItems = [...allItems];

    // Filter out items with 'Unavailable' status
    currentItems = currentItems.filter(item => item.availabilityStatus !== 'Unavailable');

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
          // Attempt to sort by ID or a timestamp if available. Using ID as a proxy.
          const idA = parseInt(a.id.split('_')[1] || '0', 10); // Assuming format like 'item_timestamp_random'
          const idB = parseInt(b.id.split('_')[1] || '0', 10);
          return idB - idA; // Higher timestamp (newer) first
        });
        break;
      case 'rating':
        currentItems.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      default:
        break;
    }
    setFilteredItems(currentItems);
  }, [searchTerm, category, sortOption, allItems, activeUserId, isLoading]);

  if (isLoading || activeUserId === null) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg text-muted-foreground">Loading awesome rentals...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="text-center py-6 md:py-12">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold font-headline mb-4 text-primary tracking-tight">
          Discover Your Next Rental
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-2">
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
