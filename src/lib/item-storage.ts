
'use server'; // Keep as server action if some functions might be, but localStorage is client-side.
// For client-side localStorage, this directive might need adjustment or functions to be client components.

import type { RentalItem, UserProfile } from '@/types';
import { getActiveUserProfile } from '@/lib/auth'; // To assign owner

const ITEMS_STORAGE_KEY = 'rentaleaseAllItems';

// Helper to get a future date
const getFutureDate = (days: number): Date => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
};

// Define initial mock users - these should ideally come from a shared place or be passed if needed.
// For simplicity here, redefining or importing if this file stays server-side might be needed.
// If this becomes fully client-side, it can directly use auth.
const mockUserJohn: UserProfile = { id: 'user1', name: 'John Doe', avatarUrl: 'https://placehold.co/100x100.png' };
const mockUserAlice: UserProfile = { id: 'user123', name: 'Alice W.', avatarUrl: 'https://placehold.co/100x100.png'};
const mockUserJane: UserProfile = { id: 'user2', name: 'Jane Smith', avatarUrl: 'https://placehold.co/100x100.png'};


const initialMockItems: RentalItem[] = [
  { id: '1', name: 'Professional DSLR Camera (Johns)', description: 'High-quality Canon DSLR, perfect for events and professional photography. Comes with two lenses.', category: 'Electronics', pricePerDay: 50, imageUrl: 'https://placehold.co/600x400.png', images: ['https://placehold.co/600x400.png', 'https://placehold.co/600x400.png'], availabilityStatus: 'Available', owner: mockUserJohn, location: 'New York, NY', rating: 4.8, reviewsCount: 25, features: ['24MP Sensor', '4K Video', 'Includes 18-55mm & 50mm lenses'], deliveryMethod: 'Pick Up', availableFromDate: getFutureDate(0) },
  { id: '2', name: 'Mountain Bike - Full Suspension (Johns)', description: 'Explore trails with this durable full-suspension mountain bike. Suitable for all terrains.', category: 'Sports & Outdoors', pricePerDay: 35, imageUrl: 'https://placehold.co/600x400.png', availabilityStatus: 'Available', owner: mockUserJohn, location: 'Denver, CO', rating: 4.5, reviewsCount: 15, features: ['29-inch wheels', 'Hydraulic disc brakes', 'Lightweight aluminum frame'], deliveryMethod: 'Delivery', availableFromDate: getFutureDate(0) },
  { id: '3', name: 'Vintage Leather Jacket (Johns)', description: 'Stylish vintage leather jacket, medium size. Adds a cool touch to any outfit.', category: 'Apparel', pricePerDay: 20, imageUrl: 'https://placehold.co/600x400.png', availabilityStatus: 'Rented', availableFromDate: getFutureDate(7), owner: mockUserJohn, location: 'Los Angeles, CA', rating: 4.2, reviewsCount: 8, deliveryMethod: 'Both' },
  { id: '4', name: 'Portable Bluetooth Speaker (Janes)', description: 'Loud and clear portable speaker with 12-hour battery life. Waterproof.', category: 'Electronics', pricePerDay: 15, imageUrl: 'https://placehold.co/600x400.png', availabilityStatus: 'Available', owner: mockUserJane, location: 'Chicago, IL', rating: 4.9, reviewsCount: 42, deliveryMethod: 'Delivery', availableFromDate: getFutureDate(0) },
  { id: '5', name: 'Cozy Downtown Apartment (Johns)', description: '1-bedroom apartment in the heart of the city. Fully furnished with modern amenities.', category: 'Property', pricePerDay: 120, imageUrl: 'https://placehold.co/600x400.png', availabilityStatus: 'Available', owner: mockUserJohn, location: 'San Francisco, CA', rating: 4.7, reviewsCount: 18, features: ['Sleeps 2', 'WiFi', 'Kitchenette'], deliveryMethod: 'Both', availableFromDate: getFutureDate(0) },
  { id: '6', name: 'Heavy Duty Power Drill (Janes)', description: 'Cordless power drill with multiple bits. Ideal for DIY projects.', category: 'Tools', pricePerDay: 25, imageUrl: 'https://placehold.co/600x400.png', availabilityStatus: 'Unavailable', owner: mockUserJane, location: 'Austin, TX', rating: 4.3, reviewsCount: 10, deliveryMethod: 'Pick Up', availableFromDate: getFutureDate(0) },
  { id: 'alice_item_1', name: 'Yoga Mat (Alices)', description: 'Premium non-slip yoga mat.', category: 'Sports & Outdoors', pricePerDay: 10, imageUrl: 'https://placehold.co/600x400.png', availabilityStatus: 'Available', owner: mockUserAlice, location: 'San Francisco, CA', rating: 4.7, reviewsCount: 18, deliveryMethod: 'Pick Up', availableFromDate: getFutureDate(0) },
  { id: 'alice_item_2', name: 'Ukulele (Alices)', description: 'Fun and easy to play concert ukulele.', category: 'Musical Instruments', pricePerDay: 12, imageUrl: 'https://placehold.co/600x400.png', availabilityStatus: 'Rented', availableFromDate: getFutureDate(3), owner: mockUserAlice, location: 'San Francisco, CA', rating: 4.5, reviewsCount: 5, deliveryMethod: 'Both' },
];

function parseStoredItems(jsonString: string | null): RentalItem[] {
  if (!jsonString) return initialMockItems; // Fallback to initial if nothing stored
  try {
    const parsed = JSON.parse(jsonString) as any[];
    return parsed.map(item => ({
      ...item,
      availableFromDate: item.availableFromDate ? new Date(item.availableFromDate) : undefined,
    }));
  } catch (error) {
    console.error("Error parsing items from localStorage:", error);
    return initialMockItems; // Fallback on error
  }
}

// Ensure this function is only called on the client-side.
function getClientSideLocalStorageItems(): RentalItem[] {
  if (typeof window === 'undefined') {
    return initialMockItems; // Server-side or pre-hydration, return default
  }
  const storedItemsJson = localStorage.getItem(ITEMS_STORAGE_KEY);
  if (!storedItemsJson) {
    // If nothing in localStorage, initialize it with initialMockItems
    localStorage.setItem(ITEMS_STORAGE_KEY, JSON.stringify(initialMockItems));
    return initialMockItems;
  }
  return parseStoredItems(storedItemsJson);
}

// Ensure this function is only called on the client-side.
function saveClientSideLocalStorageItems(items: RentalItem[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(ITEMS_STORAGE_KEY, JSON.stringify(items));
  }
}

export async function getAllItems(): Promise<RentalItem[]> {
  // This function is designed to be callable from server components or client.
  // For client-side calls, it will use localStorage.
  // For server-side calls, it currently defaults to initialMockItems.
  // A real app would fetch from a database here.
  if (typeof window !== 'undefined') {
    return getClientSideLocalStorageItems();
  }
  return Promise.resolve([...initialMockItems]); // Simulate async fetch
}

export async function getItemById(id: string): Promise<RentalItem | null> {
  const items = await getAllItems();
  const item = items.find(item => item.id === id);
  return item || null;
}

export async function addItem(itemData: Omit<RentalItem, 'id' | 'owner' | 'rating' | 'reviewsCount' | 'availabilityStatus' | 'availableFromDate'> & { imageUrl?: string }): Promise<RentalItem> {
  if (typeof window === 'undefined') {
    throw new Error("Cannot add item: localStorage is not available.");
  }
  const items = getClientSideLocalStorageItems();
  const activeUser = getActiveUserProfile(); // Assumes getActiveUserProfile can be called here

  const newItem: RentalItem = {
    ...itemData,
    id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    owner: activeUser,
    imageUrl: itemData.imageUrl || `https://placehold.co/600x400.png`, // Default placeholder
    availabilityStatus: 'Available',
    availableFromDate: getFutureDate(0), // Default to available now
    rating: 0, // Initial rating
    reviewsCount: 0, // Initial reviews count
    // features can be an empty array or handled based on form input
    features: itemData.features || [],
  };
  const updatedItems = [...items, newItem];
  saveClientSideLocalStorageItems(updatedItems);
  return newItem;
}

export async function updateItem(updatedItemData: RentalItem): Promise<RentalItem | null> {
   if (typeof window === 'undefined') {
    throw new Error("Cannot update item: localStorage is not available.");
  }
  const items = getClientSideLocalStorageItems();
  const itemIndex = items.findIndex(item => item.id === updatedItemData.id);
  if (itemIndex === -1) {
    return null; // Item not found
  }
  items[itemIndex] = { ...items[itemIndex], ...updatedItemData };
  saveClientSideLocalStorageItems(items);
  return items[itemIndex];
}

export async function deleteItem(itemId: string): Promise<boolean> {
  if (typeof window === 'undefined') {
    throw new Error("Cannot delete item: localStorage is not available.");
  }
  let items = getClientSideLocalStorageItems();
  const initialLength = items.length;
  items = items.filter(item => item.id !== itemId);
  if (items.length < initialLength) {
    saveClientSideLocalStorageItems(items);
    return true; // Item was deleted
  }
  return false; // Item not found or not deleted
}
