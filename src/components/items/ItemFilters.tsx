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
  const [selectedCategory, setSelectedCategory] = React.useState('');
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
    <div className="mb-8 p-6 bg-card rounded-xl shadow-md">
      <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 items-end">
        <div className="md:col-span-2 lg:col-span-2">
          <label htmlFor="search" className="block text-sm font-medium text-foreground mb-1">Search Items</label>
          <div className="relative">
            <Input
              id="search"
              type="text"
              placeholder="e.g. Mountain Bike, Canon Camera..."
              value={searchTerm}
              onChange={handleSearchInputChange}
              className="pr-10"
            />
            <Button type="submit" size="icon" variant="ghost" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-primary">
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-foreground mb-1">Category</label>
          <Select value={selectedCategory} onValueChange={handleCategorySelect}>
            <SelectTrigger id="category" className="w-full">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  <div className="flex items-center">
                    <cat.icon className="w-4 h-4 mr-2 text-muted-foreground" />
                    {cat.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label htmlFor="sort" className="block text-sm font-medium text-foreground mb-1">Sort By</label>
          <Select value={sortOption} onValueChange={handleSortSelect}>
            <SelectTrigger id="sort" className="w-full">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relevance">Relevance</SelectItem>
              <SelectItem value="price_asc">Price: Low to High</SelectItem>
              <SelectItem value="price_desc">Price: High to Low</SelectItem>
              <SelectItem value="newest">Newest Listings</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </form>
    </div>
  );
}
