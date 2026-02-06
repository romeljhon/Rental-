
"use client";

import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, ListFilter, Smartphone, Car, Home, Wrench, Shirt, Bike, Package } from 'lucide-react';
import type { RentalCategory } from '@/types';

const categories: RentalCategory[] = [
  { id: 'electronics', name: 'Electronics', icon: Smartphone },
  { id: 'vehicles', name: 'Vehicles', icon: Car },
  { id: 'property', name: 'Property', icon: Home },
  { id: 'tools', name: 'Tools', icon: Wrench },
  { id: 'apparel', name: 'Apparel', icon: Shirt },
  { id: 'sports', name: 'Sports & Outdoors', icon: Bike },
  { id: 'other', name: 'Other', icon: Package },
];

interface ItemFiltersProps {
  onSearchChange: (searchTerm: string) => void;
  onCategoryChange: (category: string) => void;
  onSortChange: (sortOption: string) => void;
}

export function ItemFilters({ onSearchChange, onCategoryChange, onSortChange }: ItemFiltersProps) {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState(''); // Empty string shows placeholder initially
  const [sortOption, setSortOption] = React.useState('relevance');

  const handleSearchInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSearchChange(searchTerm);
  };

  const handleCategorySelect = (value: string) => {
    setSelectedCategory(value);
    onCategoryChange(value);
  };

  const handleSortSelect = (value: string) => {
    setSortOption(value);
    onSortChange(value);
  };


  return (
    <div className="w-full">
      <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
        <div className="sm:col-span-2 space-y-2">
          <label htmlFor="search" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Search Items</label>
          <div className="relative group">
            <Input
              id="search"
              type="text"
              placeholder="What are you looking for?"
              value={searchTerm}
              onChange={handleSearchInputChange}
              className="h-12 bg-primary/[0.03] border-primary/10 pl-4 pr-12 rounded-2xl focus-visible:ring-primary/20 focus-visible:border-primary/30 transition-all font-medium"
            />
            <Button type="submit" size="icon" variant="ghost" className="absolute right-1 top-1/2 -translate-y-1/2 h-10 w-10 text-muted-foreground hover:text-primary hover:bg-transparent">
              <Search className="h-5 w-5 transition-transform group-focus-within:scale-110" />
            </Button>
          </div>
        </div>

        <div className="w-full space-y-2">
          <label htmlFor="category" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Category</label>
          <Select value={selectedCategory} onValueChange={handleCategorySelect}>
            <SelectTrigger id="category" className="w-full h-12 bg-primary/[0.03] border-primary/10 rounded-2xl focus:ring-primary/20 focus:border-primary/30 font-medium">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent className="glass border-primary/10 rounded-2xl shadow-2xl">
              <SelectItem value="all" className="rounded-lg">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id} className="rounded-lg">
                  <div className="flex items-center">
                    <cat.icon className="w-4 h-4 mr-2 text-primary" />
                    {cat.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-full space-y-2">
          <label htmlFor="sort" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Sort By</label>
          <Select value={sortOption} onValueChange={handleSortSelect}>
            <SelectTrigger id="sort" className="w-full h-12 bg-primary/[0.03] border-primary/10 rounded-2xl focus:ring-primary/20 focus:border-primary/30 font-medium">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent className="glass border-primary/10 rounded-2xl shadow-2xl">
              <SelectItem value="relevance" className="rounded-lg">Relevance</SelectItem>
              <SelectItem value="price_asc" className="rounded-lg">Price: Low to High</SelectItem>
              <SelectItem value="price_desc" className="rounded-lg">Price: High to Low</SelectItem>
              <SelectItem value="newest" className="rounded-lg">Newest Listings</SelectItem>
              <SelectItem value="rating" className="rounded-lg">Highest Rated</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </form>
    </div>
  );
}
