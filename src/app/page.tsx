"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { ItemCard } from '@/components/items/ItemCard';
import { AdvancedItemFilters, type FilterState } from '@/components/items/ItemFilters';
import type { RentalItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { authService, itemsService } from '@/services';
import { SearchX, MapPin, ChevronRight, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const [allItems, setAllItems] = useState<RentalItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeUserId, setActiveUserId] = useState<string | null>(null);

  // Use FilterState for the new AdvancedItemFilters
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    sortBy: 'newest',
  });

  useEffect(() => {
    const user = authService.getCurrentUser();
    setActiveUserId(user ? user.id : null);
  }, []);

  useEffect(() => {
    const fetchItems = async () => {
      setIsLoading(true);
      try {
        const items = await itemsService.getAll();
        setAllItems(items);
      } catch (error) {
        console.error("Failed to fetch items:", error);
        setAllItems([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchItems();
  }, [activeUserId]);

  const filteredItems = useMemo(() => {
    if (isLoading || activeUserId === null) return [];

    let currentItems = [...allItems];
    currentItems = currentItems.filter(item => item.availabilityStatus !== 'Unavailable');

    if (activeUserId) {
      currentItems = currentItems.filter(item => item.owner.id !== activeUserId);
    }

    // Apply search filter
    if (filters.search) {
      currentItems = currentItems.filter(item =>
        item.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        item.description.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // Apply location filter
    if (filters.location) {
      currentItems = currentItems.filter(item =>
        item.location?.toLowerCase().includes(filters.location!.toLowerCase())
      );
    }

    // Apply category filter (using category name for now)
    if (filters.category) {
      currentItems = currentItems.filter(item =>
        item.category.toLowerCase().replace(/\s*&\s*/, '').replace(/\s+/g, '') ===
        filters.category?.toString().toLowerCase()
      );
    }

    // Apply price filter
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      currentItems = currentItems.filter(item => {
        const price = item.pricePerDay;
        const min = filters.minPrice || 0;
        const max = filters.maxPrice || Infinity;
        return price >= min && price <= max;
      });
    }

    // Apply delivery method filter
    if (filters.deliveryMethod) {
      currentItems = currentItems.filter(item =>
        item.deliveryMethod === filters.deliveryMethod || item.deliveryMethod === 'Both'
      );
    }

    // Apply availability status filter
    if (filters.availabilityStatus) {
      currentItems = currentItems.filter(item =>
        item.availabilityStatus === filters.availabilityStatus
      );
    }

    // Apply sorting
    switch (filters.sortBy) {
      case 'price_asc':
        currentItems.sort((a, b) => a.pricePerDay - b.pricePerDay);
        break;
      case 'price_desc':
        currentItems.sort((a, b) => b.pricePerDay - a.pricePerDay);
        break;
      case 'newest':
        currentItems.sort((a, b) =>
          new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        );
        break;
      case 'rating':
        currentItems.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
    }

    return currentItems;
  }, [filters, allItems, activeUserId, isLoading]);

  const nearbyItems = useMemo(() => {
    return filteredItems.filter(item =>
      item.location === 'Nearby' ||
      item.location?.toLowerCase().includes('manila') ||
      item.location?.toLowerCase().includes('makati')
    ).slice(0, 3);
  }, [filteredItems]);

  if (isLoading || activeUserId === null) {
    return (
      <div className="space-y-12 pb-20">
        <section className="text-center pt-20 pb-16 px-4">
          <Skeleton className="h-16 w-full max-w-3xl mx-auto mb-6 rounded-2xl" />
          <Skeleton className="h-6 w-full max-w-xl mx-auto rounded-full" />
        </section>
        <div className="container max-w-7xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="aspect-[4/5] rounded-[2rem]" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-20">
      <section className="text-center pt-24 pb-32 px-4 hero-gradient relative overflow-hidden">
        <div className="container max-w-4xl mx-auto relative z-10">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-black font-headline mb-8 text-foreground tracking-[-0.04em] leading-[0.95]">
            Rent Anything. <br />
            <span className="text-primary">Anywhere.</span> Anytime.
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-normal font-medium">
            Join thousands of users who trust RentSnap for their instant rental needs.
          </p>
        </div>
      </section>

      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-20">
        <div className="glass shadow-2xl rounded-[2.5rem] p-8 border-primary/10">
          <AdvancedItemFilters
            filters={filters}
            onChange={setFilters}
          />
        </div>
      </div>

      <main className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {filteredItems.length > 0 ? (
          <div className="space-y-24">
            {!filters.search && !filters.category && !filters.location && nearbyItems.length > 0 && (
              <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="flex items-end justify-between mb-8">
                  <div className="space-y-1">
                    <h2 className="text-sm font-black text-primary uppercase tracking-[0.3em]">Discovery</h2>
                    <h3 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-2">
                      <MapPin className="h-6 w-6 text-primary" />
                      Rentals Near You
                    </h3>
                  </div>
                  <Button variant="ghost" className="text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors gap-2">
                    View Map <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {nearbyItems.map((item) => (
                    <Link href={`/items/${item.id}`} key={item.id} className="group relative aspect-[16/9] overflow-hidden rounded-[2rem] border border-primary/5 shadow-xl transition-all hover:-translate-y-2">
                      <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent p-6 flex flex-col justify-end">
                        <div className="glass-dark border-white/10 p-4 rounded-2xl">
                          <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">₱{item.pricePerDay}/day</p>
                          <h4 className="text-lg font-black text-white leading-tight">{item.name}</h4>
                          <p className="text-xs text-white/60 font-medium flex items-center gap-1.5 mt-1">
                            <MapPin className="h-3 w-3" /> {item.location}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-12">
              <div className="flex items-end justify-between pb-8 border-b border-primary/5">
                <div>
                  <h2 className="text-sm font-black text-primary uppercase tracking-[0.3em]">Marketplace</h2>
                  <h3 className="text-4xl font-black tracking-tight text-foreground uppercase">Top Picks</h3>
                  <p className="text-sm text-muted-foreground font-medium mt-1">Discover {filteredItems.length} curated items</p>
                </div>
                <div className="hidden sm:flex items-center gap-3 text-[10px] font-black text-primary uppercase tracking-[0.2em] bg-primary/10 px-5 py-2.5 rounded-full border border-primary/10">
                  <div className="h-2 w-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                  Live Marketplace
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-10 gap-y-16">
                {filteredItems.map((item) => (
                  <ItemCard key={item.id} item={item} />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-24 glass rounded-[3rem] border-dashed border-2 border-primary/10 max-w-3xl mx-auto">
            <div className="bg-primary/5 h-24 w-24 rounded-full flex items-center justify-center mx-auto mb-6">
              <SearchX className="h-12 w-12 text-primary opacity-50" />
            </div>
            <h2 className="text-3xl font-black text-foreground mb-4">No Listings Found</h2>
            <p className="text-muted-foreground max-w-sm mx-auto mb-10 leading-relaxed font-medium">
              We couldn't find any items matching your current filters.
            </p>
            <Button
              variant="default"
              size="lg"
              className="rounded-full px-10 font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all font-headline"
              onClick={() => setFilters({ search: '', sortBy: 'newest' })}
            >
              Reset Filters
            </Button>
          </div>
        )}
      </main>

      <footer className="w-full border-t border-primary/5 py-12 bg-primary/[0.02]">
        <div className="container max-w-7xl mx-auto px-4 text-center">
          <p className="text-xs text-muted-foreground font-medium opacity-60 uppercase tracking-[0.2em]">
            © 2026 RentSnap Platform. All rights reserved.
          </p>
        </div>
      </footer >
    </div >
  );
}
