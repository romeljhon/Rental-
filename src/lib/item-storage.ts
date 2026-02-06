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
    securityDeposit: parseFloat(item.security_deposit) || 0,
    imageUrl: item.image_url || (item.item_images && item.item_images.length > 0 ? item.item_images[0].image : 'https://placehold.co/600x400.png'),
    itemImages: item.item_images,
    availabilityStatus: item.is_available ? 'Available' : (item.status === 'Rented' ? 'Rented' : 'Unavailable'),
    owner: item.owner_details || {
      id: item.owner_id || 'user123',
      name: `User ${item.owner_id}`,
      avatarUrl: 'https://placehold.co/100x100.png'
    },
    location: item.location || 'Nearby',
    rating: parseFloat(item.rating) || 0,
    reviewsCount: item.reviews_count || 0,
    availableFromDate: new Date(),
    features: [],
    deliveryMethod: item.delivery_method || 'Both',
    createdAt: item.created_at ? new Date(item.created_at) : new Date()
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

export async function addItem(itemData: Omit<RentalItem, 'id' | 'owner' | 'rating' | 'reviewsCount' | 'availabilityStatus' | 'availableFromDate' | 'imageUrl'> & { files?: File[]; imageUrl?: string }): Promise<RentalItem> {
  let categories = await fetchApi('/categories/');
  let category = categories.find((c: any) => c.name.toLowerCase() === itemData.category.toLowerCase());

  if (!category) {
    category = await fetchApi('/categories/', {
      method: 'POST',
      body: JSON.stringify({ name: itemData.category })
    });
  }

  const formData = new FormData();
  formData.append('name', itemData.name);
  formData.append('description', itemData.description);
  formData.append('price_per_day', itemData.pricePerDay.toString());
  formData.append('security_deposit', itemData.securityDeposit.toString());
  formData.append('category', category.id.toString());
  formData.append('location', itemData.location || 'Nearby');
  formData.append('delivery_method', itemData.deliveryMethod || 'Both');
  formData.append('is_available', 'true');

  if (itemData.files) {
    itemData.files.forEach(file => {
      formData.append('images', file);
    });
  } else if (itemData.imageUrl) {
    formData.append('image_url', itemData.imageUrl);
  }

  const newItem = await fetchApi('/items/', {
    method: 'POST',
    body: formData
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
