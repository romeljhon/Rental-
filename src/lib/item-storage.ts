import type { RentalItem, UserProfile } from '@/types';
import { getActiveUserProfile } from '@/lib/auth';
import { fetchApi, clearApiCache } from './api';

// Helper to map backend item to frontend RentalItem
function mapBackendToFrontend(item: any): RentalItem {
  return {
    id: item.id.toString(),
    name: item.name,
    description: item.description,
    category: item.category_name || 'General',
    pricePerDay: parseFloat(item.price_per_day),
    imageUrl: item.image_url || 'https://placehold.co/600x400.png',
    availabilityStatus: item.is_available ? 'Available' : 'Unavailable',
    owner: {
      id: item.owner_id || 'user123',
      name: item.owner_id === 'user123' ? 'John Doe' : item.owner_id === 'user456' ? 'Alice' : 'User',
      avatarUrl: 'https://placehold.co/100x100.png'
    },
    location: item.location || 'Nearby',
    rating: parseFloat(item.rating) || 0,
    reviewsCount: item.reviews_count || 0,
    availableFromDate: new Date(),
    features: [],
    deliveryMethod: item.delivery_method || 'Both'
  };
}

export async function getAllItems(): Promise<RentalItem[]> {
  try {
    const items = await fetchApi('/items/');
    return items.map(mapBackendToFrontend);
  } catch (error) {
    console.error("Failed to fetch items from backend:", error);
    return [];
  }
}

export async function getItemById(id: string): Promise<RentalItem | null> {
  try {
    const item = await fetchApi(`/items/${id}/`);
    return mapBackendToFrontend(item);
  } catch (error) {
    console.error(`Failed to fetch item ${id}:`, error);
    return null;
  }
}

export async function addItem(itemData: Omit<RentalItem, 'id' | 'owner' | 'rating' | 'reviewsCount' | 'availabilityStatus' | 'availableFromDate'> & { imageUrl?: string }): Promise<RentalItem> {
  let categories = await fetchApi('/categories/');
  let category = categories.find((c: any) => c.name.toLowerCase() === itemData.category.toLowerCase());

  if (!category) {
    category = await fetchApi('/categories/', {
      method: 'POST',
      body: JSON.stringify({ name: itemData.category })
    });
  }

  const activeUser = getActiveUserProfile();

  const backendData = {
    name: itemData.name,
    description: itemData.description,
    price_per_day: itemData.pricePerDay,
    category: category.id,
    image_url: itemData.imageUrl || '',
    location: itemData.location || 'Nearby',
    rating: 0,
    reviews_count: 0,
    is_available: true,
    owner_id: activeUser?.id || 'user123',
    delivery_method: itemData.deliveryMethod || 'Both'
  };

  const newItem = await fetchApi('/items/', {
    method: 'POST',
    body: JSON.stringify(backendData)
  });

  clearApiCache('/items/');
  return mapBackendToFrontend(newItem);
}

export async function updateItem(updatedItemData: RentalItem): Promise<RentalItem | null> {
  const backendData = {
    name: updatedItemData.name,
    description: updatedItemData.description,
    price_per_day: updatedItemData.pricePerDay,
    image_url: updatedItemData.imageUrl,
    location: updatedItemData.location,
    rating: updatedItemData.rating,
    reviews_count: updatedItemData.reviewsCount,
    is_available: updatedItemData.availabilityStatus === 'Available',
    delivery_method: updatedItemData.deliveryMethod
  };

  try {
    const updatedItem = await fetchApi(`/items/${updatedItemData.id}/`, {
      method: 'PATCH',
      body: JSON.stringify(backendData)
    });
    clearApiCache('/items/');
    clearApiCache(`/items/${updatedItemData.id}/`);
    return mapBackendToFrontend(updatedItem);
  } catch (error) {
    console.error(`Failed to update item ${updatedItemData.id}:`, error);
    return null;
  }
}

export async function deleteItem(itemId: string): Promise<boolean> {
  try {
    await fetchApi(`/items/${itemId}/`, {
      method: 'DELETE'
    });
    clearApiCache('/items/');
    clearApiCache(`/items/${itemId}/`);
    return true;
  } catch (error) {
    console.error(`Failed to delete item ${itemId}:`, error);
    return false;
  }
}
