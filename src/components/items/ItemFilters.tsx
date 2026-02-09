/**
 * Advanced Item Filters Component
 * Comprehensive filtering for rental items
 */

'use client';

import { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, X, MapPin, Calendar, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { categoriesService, type Category } from '@/services';

export interface FilterState {
  search: string;
  category?: number;
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  deliveryMethod?: 'Pick Up' | 'Delivery' | 'Both';
  availabilityStatus?: 'Available' | 'Rented' | 'Unavailable';
  sortBy?: 'price_asc' | 'price_desc' | 'rating' | 'newest';
}

interface AdvancedItemFiltersProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  onSearch?: () => void;
}

export function AdvancedItemFilters({ filters, onChange, onSearch }: AdvancedItemFiltersProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState<FilterState>(filters);
  const [priceRange, setPriceRange] = useState<[number, number]>([
    filters.minPrice || 0,
    filters.maxPrice || 10000,
  ]);

  useEffect(() => {
    // Load categories
    categoriesService.getAll().then(setCategories).catch(console.error);
  }, []);

  useEffect(() => {
    setLocalFilters(filters);
    setPriceRange([filters.minPrice || 0, filters.maxPrice || 10000]);
  }, [filters]);

  const handleSearchChange = (value: string) => {
    const updated = { ...localFilters, search: value };
    setLocalFilters(updated);
    onChange(updated);
  };

  const handleApplyFilters = () => {
    const updated = {
      ...localFilters,
      minPrice: priceRange[0],
      maxPrice: priceRange[1],
    };
    onChange(updated);
    setIsOpen(false);
    onSearch?.();
  };

  const handleResetFilters = () => {
    const reset: FilterState = { search: localFilters.search };
    setLocalFilters(reset);
    setPriceRange([0, 10000]);
    onChange(reset);
  };

  const activeFilterCount = Object.keys(filters).filter(
    key => key !== 'search' && filters[key as keyof FilterState] !== undefined
  ).length;

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search rentals..."
            value={localFilters.search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-12 h-14 rounded-2xl border-2 border-primary/10 focus:border-primary/30 text-base"
          />
        </div>

        {/* Advanced Filters Trigger */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="lg"
              className="h-14 px-6 rounded-2xl border-2 border-primary/10 hover:border-primary/30 relative"
            >
              <SlidersHorizontal className="h-5 w-5 mr-2" />
              <span className="hidden sm:inline">Filters</span>
              {activeFilterCount > 0 && (
                <Badge
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center bg-primary text-white text-xs"
                >
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>

          <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
            <SheetHeader className="mb-8">
              <SheetTitle className="text-2xl font-black">Advanced Filters</SheetTitle>
              <SheetDescription>
                Refine your search to find the perfect rental
              </SheetDescription>
            </SheetHeader>

            <div className="space-y-8">
              {/* Category Filter */}
              <div className="space-y-3">
                <Label className="text-sm font-black uppercase tracking-widest text-muted-foreground">
                  Category
                </Label>
                <Select
                  value={localFilters.category?.toString() || "ALL"}
                  onValueChange={(value) =>
                    setLocalFilters({ ...localFilters, category: value === "ALL" ? undefined : parseInt(value) })
                  }
                >
                  <SelectTrigger className="h-12 rounded-xl">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Categories</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Price Range */}
              <div className="space-y-3">
                <Label className="text-sm font-black uppercase tracking-widest text-muted-foreground">
                  <DollarSign className="h-4 w-4 inline mr-1" />
                  Price Range (per day)
                </Label>
                <div className="pt-2">
                  <Slider
                    value={priceRange}
                    onValueChange={(value) => setPriceRange(value as [number, number])}
                    min={0}
                    max={10000}
                    step={100}
                    className="mb-4"
                  />
                  <div className="flex justify-between text-sm font-bold">
                    <span>₱{priceRange[0].toLocaleString()}</span>
                    <span>₱{priceRange[1].toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="space-y-3">
                <Label className="text-sm font-black uppercase tracking-widest text-muted-foreground">
                  <MapPin className="h-4 w-4 inline mr-1" />
                  Location
                </Label>
                <Input
                  placeholder="Enter city or area"
                  value={localFilters.location || ''}
                  onChange={(e) =>
                    setLocalFilters({ ...localFilters, location: e.target.value || undefined })
                  }
                  className="h-12 rounded-xl"
                />
              </div>

              {/* Delivery Method */}
              <div className="space-y-3">
                <Label className="text-sm font-black uppercase tracking-widest text-muted-foreground">
                  Delivery Method
                </Label>
                <Select
                  value={localFilters.deliveryMethod || "ALL"}
                  onValueChange={(value) =>
                    setLocalFilters({
                      ...localFilters,
                      deliveryMethod: value === "ALL" ? undefined : (value as any),
                    })
                  }
                >
                  <SelectTrigger className="h-12 rounded-xl">
                    <SelectValue placeholder="Any Method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Any Method</SelectItem>
                    <SelectItem value="Pick Up">Pick Up Only</SelectItem>
                    <SelectItem value="Delivery">Delivery Only</SelectItem>
                    <SelectItem value="Both">Both Options</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Availability Status */}
              <div className="space-y-3">
                <Label className="text-sm font-black uppercase tracking-widest text-muted-foreground">
                  Availability
                </Label>
                <Select
                  value={localFilters.availabilityStatus || "ALL"}
                  onValueChange={(value) =>
                    setLocalFilters({
                      ...localFilters,
                      availabilityStatus: value === "ALL" ? undefined : (value as any),
                    })
                  }
                >
                  <SelectTrigger className="h-12 rounded-xl">
                    <SelectValue placeholder="All Items" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Items</SelectItem>
                    <SelectItem value="Available">Available Now</SelectItem>
                    <SelectItem value="Rented">Currently Rented</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sort By */}
              <div className="space-y-3">
                <Label className="text-sm font-black uppercase tracking-widest text-muted-foreground">
                  Sort By
                </Label>
                <Select
                  value={localFilters.sortBy || "relevance"}
                  onValueChange={(value) =>
                    setLocalFilters({ ...localFilters, sortBy: value === "relevance" ? undefined : (value as any) })
                  }
                >
                  <SelectTrigger className="h-12 rounded-xl">
                    <SelectValue placeholder="Relevance" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">Relevance</SelectItem>
                    <SelectItem value="price_asc">Price: Low to High</SelectItem>
                    <SelectItem value="price_desc">Price: High to Low</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                    <SelectItem value="newest">Newest First</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-8 pt-6 border-t">
              <Button
                variant="outline"
                onClick={handleResetFilters}
                className="flex-1 h-12 rounded-xl font-bold uppercase tracking-widest"
              >
                <X className="h-4 w-4 mr-2" />
                Reset
              </Button>
              <Button
                onClick={handleApplyFilters}
                className="flex-1 h-12 rounded-xl font-bold uppercase tracking-widest shadow-lg"
              >
                Apply Filters
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Active Filters Display */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {localFilters.category && (
            <Badge variant="secondary" className="rounded-full px-4 py-1.5">
              Category: {categories.find(c => c.id === localFilters.category)?.name}
              <button
                onClick={() => setLocalFilters({ ...localFilters, category: undefined })}
                className="ml-2 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {(localFilters.minPrice || localFilters.maxPrice) && (
            <Badge variant="secondary" className="rounded-full px-4 py-1.5">
              Price: ₱{localFilters.minPrice || 0} - ₱{localFilters.maxPrice || 10000}
            </Badge>
          )}
          {localFilters.location && (
            <Badge variant="secondary" className="rounded-full px-4 py-1.5">
              {localFilters.location}
              <button
                onClick={() => setLocalFilters({ ...localFilters, location: undefined })}
                className="ml-2 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
