
import type { UserProfile } from '@/types';

// Define initial mock users
const INITIAL_MOCK_USER_JOHN: UserProfile = { id: 'user1', name: 'John Doe (Owner)', avatarUrl: 'https://placehold.co/40x40.png' };
const INITIAL_MOCK_USER_ALICE: UserProfile = { id: 'user123', name: 'Alice W. (Renter)', avatarUrl: 'https://placehold.co/40x40.png' };

const MOCK_USERS_STORAGE_KEY = 'rentaleaseAllMockUsers';
const ACTIVE_USER_ID_KEY = 'rentaleaseActiveUserId';

// Function to load users from localStorage or return initial set
function loadUsers(): UserProfile[] {
  if (typeof window !== 'undefined') {
    const storedUsers = localStorage.getItem(MOCK_USERS_STORAGE_KEY);
    if (storedUsers) {
      try {
        return JSON.parse(storedUsers);
      } catch (e) {
        console.error("Failed to parse users from localStorage", e);
        // Fallback to initial if parsing fails
      }
    }
    // If no users in storage, initialize with defaults and save
    const initialUsers = [INITIAL_MOCK_USER_JOHN, INITIAL_MOCK_USER_ALICE];
    localStorage.setItem(MOCK_USERS_STORAGE_KEY, JSON.stringify(initialUsers));
    return initialUsers;
  }
  // Default for server-side or pre-hydration
  return [INITIAL_MOCK_USER_JOHN, INITIAL_MOCK_USER_ALICE];
}

// ALL_MOCK_USERS is now a function that ensures it gets the latest from storage or initial state
export function getAllMockUsers(): UserProfile[] {
  return loadUsers();
}

// Export the initial constants for reference if needed elsewhere, but primary user list is dynamic
export const MOCK_USER_JOHN: UserProfile = INITIAL_MOCK_USER_JOHN;
export const MOCK_USER_ALICE: UserProfile = INITIAL_MOCK_USER_ALICE;


export function getActiveUserId(): string {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(ACTIVE_USER_ID_KEY) || INITIAL_MOCK_USER_JOHN.id;
  }
  return INITIAL_MOCK_USER_JOHN.id; // Default for server-side or pre-hydration
}

export function setActiveUserId(userId: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(ACTIVE_USER_ID_KEY, userId);
    // Potentially trigger a custom event here if other components need to react immediately
    // window.dispatchEvent(new Event('activeUserChanged'));
  }
}

export function getActiveUserProfile(): UserProfile {
    const userId = getActiveUserId();
    const users = getAllMockUsers();
    const user = users.find(u => u.id === userId);
    return user || users.find(u => u.id === INITIAL_MOCK_USER_JOHN.id) || INITIAL_MOCK_USER_JOHN; // Default if user ID not in list
}

export function updateUserProfileInStorage(userId: string, newName: string, newAvatarUrl: string): boolean {
  if (typeof window === 'undefined') {
    console.error("Cannot update profile: localStorage is not available.");
    return false;
  }
  let users = getAllMockUsers();
  const userIndex = users.findIndex(u => u.id === userId);

  if (userIndex !== -1) {
    users[userIndex] = { ...users[userIndex], name: newName, avatarUrl: newAvatarUrl || users[userIndex].avatarUrl };
    localStorage.setItem(MOCK_USERS_STORAGE_KEY, JSON.stringify(users));
    
    // If the updated user is the active user, we might want to refresh things.
    // Setting the active user ID again can sometimes trigger listeners or re-fetches if components depend on it.
    if (userId === getActiveUserId()) {
        // This is a bit of a hack to encourage components relying on getActiveUserProfile to re-fetch/re-render.
        // A more robust solution would involve a global state manager or context update.
        // For now, this might help the header update if it re-evaluates on 'storage' event or focus.
        // setActiveUserId(userId); // Re-set to potentially trigger updates, or rely on component re-renders.
    }
    return true;
  }
  return false;
}
