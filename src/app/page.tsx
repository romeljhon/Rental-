"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { ItemCard } from '@/components/items/ItemCard';
import { ItemFilters } from '@/components/items/ItemFilters';
import type { RentalItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { getActiveUserId } from '@/lib/auth';
import { getAllItems } from '@/lib/item-storage';

export default function HomePage() {
  const [allItems, setAllItems] = useState<RentalItem[]>([]);
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
        setAllItems([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (activeUserId !== null) {
      fetchItems();
    }
  }, [activeUserId]);

  const filteredItems = useMemo(() => {
    if (isLoading || activeUserId === null) return [];

    let currentItems = [...allItems];

    currentItems = currentItems.filter(item => item.availabilityStatus !== 'Unavailable');

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
          const idA = parseInt(a.id.split('_')[1] || '0', 10);
          const idB = parseInt(b.id.split('_')[1] || '0', 10);
          return idB - idA;
        });
        break;
      case 'rating':
        currentItems.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      default:
        break;
    }
    return currentItems;
  }, [searchTerm, category, sortOption, allItems, activeUserId, isLoading]);

  if (isLoading || activeUserId === null) {
    return (
      <div className="space-y-8">
        <section className="text-center py-6 md:py-12 px-4">
          <Skeleton className="h-12 w-full max-w-xl mx-auto mb-4" />
          <Skeleton className="h-6 w-full max-w-md mx-auto" />
        </section>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="flex flex-col h-[400px] overflow-hidden">
              <Skeleton className="aspect-video w-full" />
              <div className="p-4 space-y-4">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <div className="flex justify-between items-center pt-4">
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-8 w-24" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 px-4 sm:px-6 lg:px-8">
      <section className="text-center py-6 md:py-12">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold font-headline mb-4 text-primary tracking-tight">
          Discover Your Next Rental
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
          From everyday essentials to unique experiences, find what you need, when you need it.
        </p>
      </section>

      <ItemFilters
        onSearchChange={setSearchTerm}
        onCategoryChange={setCategory}
        onSortChange={setSortOption}
      />

      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-12">
          {filteredItems.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <h2 className="text-2xl font-semibold text-muted-foreground mb-2">No Items Found</h2>
          <p className="text-foreground">Try adjusting your search or filters, or check back later!</p>
          <Button variant="outline" className="mt-6" onClick={() => { setSearchTerm(''); setCategory(''); setSortOption('relevance'); }}>
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
}
