
import type { LucideIcon } from 'lucide-react';

export interface NavItem {
  href: string;
  label: string;
  icon?: LucideIcon;
  exact?: boolean;
  protected?: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  avatarUrl?: string;
  // email?: string; // Add if needed for contact or identification
}

export interface ItemImage {
  id: string;
  image: string;
  isPrimary: boolean;
}

export interface RentalItem {
  id: string;
  name: string;
  description: string;
  category: string;
  pricePerDay: number;
  securityDeposit: number;
  imageUrl: string;
  itemImages?: ItemImage[];
  availabilityStatus: 'Available' | 'Rented' | 'Unavailable';
  availableFromDate?: Date;
  owner: UserProfile;
  location?: string;
  rating?: number;
  reviewsCount?: number;
  features?: string[];
  deliveryMethod?: 'Pick Up' | 'Delivery' | 'Both';
  createdAt?: Date;
}

export interface RentalCategory {
  id: string;
  name: string;
  icon: LucideIcon;
  itemCount?: number;
}

export interface Transaction {
  id: string;
  amount: number;
  transactionType: 'Payment' | 'Refund' | 'Payout';
  status: 'Pending' | 'Success' | 'Failed';
  createdAt: Date;
}

export interface Dispute {
  id: string;
  reason: string;
  evidenceImage?: string;
  status: 'Open' | 'Resolved' | 'Arbitrated';
}

export interface RentalRequest {
  id: string;
  itemId: string;
  item: Pick<RentalItem, 'id' | 'name' | 'imageUrl' | 'pricePerDay'>;
  requester: UserProfile;
  owner: UserProfile;
  startDate: Date;
  endDate: Date;
  status: 'Pending' | 'Approved' | 'AwaitingPayment' | 'Paid' | 'InHand' | 'Returned' | 'Completed' | 'Rejected' | 'Cancelled' | 'Disputed';
  totalPrice: number;
  depositAmount: number;
  handoverCode?: string;
  returnCode?: string;
  requestedAt: Date;
  chosenDeliveryMethod?: 'Pick Up' | 'Delivery';
  ratingGiven?: number;
  transactions?: Transaction[];
  dispute?: Dispute;
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

export type NotificationEventType =
  | 'new_request'
  | 'request_update' // Generic for approved, rejected, cancelled
  | 'new_message'
  | 'item_receipt_confirmed';

export interface Notification {
  id: string;
  targetUserId: string; // The user who should see this notification
  eventType: NotificationEventType;
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  link?: string; // e.g., /requests or /messages/conv123
  relatedItemId?: string; // Optional ID of the item related to the notification
  relatedUser?: Pick<UserProfile, 'id' | 'name'>; // Optional: User who triggered the event (e.g., requester, message sender)
}
