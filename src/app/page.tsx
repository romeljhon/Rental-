
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
import { SearchX, Sparkles, TrendingUp, ShieldCheck, Heart, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

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
          const dateA = new Date(a.createdAt || 0).getTime();
          const dateB = new Date(b.createdAt || 0).getTime();
          return dateB - dateA;
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
      <div className="space-y-12 pb-20">
        <section className="text-center pt-20 pb-16 px-4 hero-mesh hero-gradient">
          <Skeleton className="h-16 w-full max-w-3xl mx-auto mb-6 rounded-2xl" />
          <Skeleton className="h-6 w-full max-w-xl mx-auto rounded-full" />
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Skeleton className="h-14 w-full rounded-2xl shadow-sm" />
            <Skeleton className="h-14 w-full rounded-2xl shadow-sm" />
            <Skeleton className="h-14 w-full rounded-2xl shadow-sm" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex flex-col space-y-4">
                <Skeleton className="aspect-[4/3] w-full rounded-3xl" />
                <div className="space-y-2 px-2">
                  <Skeleton className="h-6 w-3/4 rounded-full" />
                  <Skeleton className="h-4 w-1/2 rounded-full" />
                  <div className="flex justify-between items-center pt-4">
                    <Skeleton className="h-8 w-1/3 rounded-full" />
                    <Skeleton className="h-10 w-1/3 rounded-xl" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background items-center flex flex-col">
      <section className="w-full relative pt-24 pb-20 px-4 overflow-hidden hero-mesh hero-gradient border-b border-primary/5">
        <div className="container max-w-6xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest mb-8 border border-primary/10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Sparkles className="h-3.5 w-3.5" />
            <span>The Premier Rental Marketplace</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black font-headline mb-8 text-foreground tracking-tight leading-[1.1] animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">
            Rent Everything <span className="text-primary italic">You Need</span>
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-10 animate-in fade-in slide-in-from-bottom-12 duration-700 delay-300">
            Explore a vast collection of local rentals. From high-end gear to everyday tools, finding what you need is just a click away.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-6 text-sm font-semibold text-muted-foreground animate-in fade-in slide-in-from-bottom-16 duration-700 delay-500">
            <div className="flex items-center gap-2 bg-white/50 dark:bg-black/20 px-4 py-2 rounded-full glass">
              <ShieldCheck className="h-4 w-4 text-primary" /> Verified Owners
            </div>
            <div className="flex items-center gap-2 bg-white/50 dark:bg-black/20 px-4 py-2 rounded-full glass">
              <TrendingUp className="h-4 w-4 text-primary" /> Instant Booking
            </div>
            <div className="flex items-center gap-2 bg-white/50 dark:bg-black/20 px-4 py-2 rounded-full glass">
              <Heart className="h-4 w-4 text-primary" /> 24/7 Support
            </div>
          </div>
        </div>
      </section>

      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
        <div className="glass shadow-2xl rounded-3xl p-6 border-primary/5 transition-all duration-500">
          <ItemFilters
            onSearchChange={setSearchTerm}
            onCategoryChange={setCategory}
            onSortChange={setSortOption}
          />
        </div>
      </div>

      <main className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {filteredItems.length > 0 ? (
          <div className="space-y-10">
            <div className="flex items-end justify-between border-b border-primary/5 pb-4">
              <div>
                <h2 className="text-2xl font-black uppercase tracking-tight text-foreground">Available Now</h2>
                <p className="text-sm text-muted-foreground">Showing {filteredItems.length} curated items for you</p>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                Live Updates
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-12">
              {filteredItems.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-24 glass rounded-[3rem] border-dashed border-2 border-primary/10 max-w-3xl mx-auto">
            <div className="bg-primary/5 h-24 w-24 rounded-full flex items-center justify-center mx-auto mb-6">
              <SearchX className="h-12 w-12 text-primary opacity-50" />
            </div>
            <h2 className="text-3xl font-black text-foreground mb-4">No Listings Found</h2>
            <p className="text-muted-foreground max-w-sm mx-auto mb-10 leading-relaxed font-medium">
              We couldn't find any items matching your current filters. Try relaxing your search terms or exploring a different category.
            </p>
            <Button
              variant="default"
              size="lg"
              className="rounded-full px-10 font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all"
              onClick={() => { setSearchTerm(''); setCategory(''); setSortOption('relevance'); }}
            >
              Reset Filters
            </Button>
          </div>
        )}
      </main>

      <footer className="w-full border-t border-primary/5 py-12 bg-primary/[0.02]">
        <div className="container max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Home className="h-5 w-5 text-primary opacity-50" />
            <span className="text-sm font-black uppercase tracking-tighter text-muted-foreground">RentalEase Premium</span>
          </div>
          <p className="text-xs text-muted-foreground font-medium opacity-60 uppercase tracking-[0.2em]">
            © 2026 RentalEase Platform. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
