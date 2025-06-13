
import type { LucideIcon } from 'lucide-react';

export interface NavItem {
  href: string;
  label: string;
  icon?: LucideIcon;
  exact?: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  avatarUrl?: string;
  // email?: string; // Add if needed for contact or identification
}

export interface RentalItem {
  id: string;
  name: string;
  description: string;
  category: string; // Could be an enum or a string referencing RentalCategory.name
  pricePerDay: number;
  imageUrl: string; // Primary image URL
  images?: string[]; // Additional image URLs
  availabilityStatus: 'Available' | 'Rented' | 'Unavailable'; // More descriptive status
  availableFromDate?: Date; // Date when a 'Rented' item will become available
  owner: UserProfile;
  location?: string; // e.g., "City, State" or specific address
  rating?: number; // Average rating (e.g., 1-5)
  reviewsCount?: number;
  features?: string[]; // e.g., ["WiFi", "Parking", "Pet-friendly"]
  deliveryMethod?: 'Pick Up' | 'Delivery' | 'Both'; // Updated field
  // Could add specific fields based on category, e.g., mileage for cars
}

export interface RentalCategory {
  id: string;
  name: string;
  icon: LucideIcon; // For UI representation
  itemCount?: number; // Optional: for displaying number of items in this category
}

export interface RentalRequest {
  id: string;
  itemId: string;
  item: Pick<RentalItem, 'id' | 'name' | 'imageUrl' | 'pricePerDay'>; // Embed partial item info
  requester: UserProfile;
  owner: UserProfile;
  startDate: Date;
  endDate: Date;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled' | 'Completed' | 'AwaitingPayment';
  totalPrice: number;
  requestedAt: Date;
  chosenDeliveryMethod?: 'Pick Up' | 'Delivery'; // New field for renter's choice
  // messageThreadId?: string; // Link to a messaging thread
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  timestamp: Date;
  isRead?: boolean;
}

export interface Conversation {
  id: string;
  participants: UserProfile[]; // Array of users in the conversation
  lastMessage?: Message; // Optional: for displaying snippet in conversation list
  unreadCount?: number; // For the current user
  itemContext?: Pick<RentalItem, 'id' | 'name'>; // Optional: if message is about specific item
}
