
import type { UserProfile } from '@/types';

// Define mock users
export const MOCK_USER_JOHN: UserProfile = { id: 'user1', name: 'John Doe (Owner)', avatarUrl: 'https://placehold.co/40x40.png' };
export const MOCK_USER_ALICE: UserProfile = { id: 'user123', name: 'Alice W. (Renter)', avatarUrl: 'https://placehold.co/40x40.png' };

export const ALL_MOCK_USERS: UserProfile[] = [MOCK_USER_JOHN, MOCK_USER_ALICE];

const ACTIVE_USER_ID_KEY = 'rentaleaseActiveUserId'; // Changed key for clarity

export function getActiveUserId(): string {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(ACTIVE_USER_ID_KEY) || MOCK_USER_JOHN.id;
  }
  return MOCK_USER_JOHN.id; // Default for server-side or pre-hydration
}

export function setActiveUserId(userId: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(ACTIVE_USER_ID_KEY, userId);
  }
}

export function getActiveUserProfile(): UserProfile {
    const userId = getActiveUserId();
    const user = ALL_MOCK_USERS.find(u => u.id === userId);
    return user || MOCK_USER_JOHN; // Default if user ID not in list
}
