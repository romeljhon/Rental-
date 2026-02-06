import { fetchApi } from './api';
import type { UserProfile } from '@/types';

// Storage keys
const TOKEN_KEY = 'rentaleaseToken';
const USER_ID_KEY = 'rentaleaseActiveUserId';
const PROFILE_KEY = 'rentaleaseActiveUserProfile';

/**
 * Gets the stored JWT token.
 */
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Gets the stored user ID.
 */
export function getActiveUserId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(USER_ID_KEY);
}

/**
 * Fetches the real profile of the currently logged-in user from the backend.
 */
export async function initializeAuth(): Promise<UserProfile | null> {
  const token = getAuthToken();
  if (!token) return null;

  try {
    const user = await fetchApi('/users/me/');
    const profile: UserProfile = {
      id: user.id.toString(),
      name: user.username,
      avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${user.username}`
    };
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    localStorage.setItem(USER_ID_KEY, profile.id);
    return profile;
  } catch (error) {
    console.error("Failed to initialize auth profile:", error);
    // If token is invalid, log out
    logout();
    return null;
  }
}

/**
 * Gets the profile from local storage (faster than API call).
 */
export function getActiveUserProfile(): UserProfile | null {
  if (typeof window === 'undefined') return null;
  const profileJson = localStorage.getItem(PROFILE_KEY);
  if (profileJson) {
    try {
      return JSON.parse(profileJson);
    } catch (e) {
      return null;
    }
  }
  return null;
}

/**
 * Logs out the user and redirects to login.
 */
export function logout(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_ID_KEY);
  localStorage.removeItem(PROFILE_KEY);
  window.location.href = '/login';
}

/**
 * Checks if a token exists.
 */
export function isAuthenticated(): boolean {
  return !!getAuthToken();
}
