/**
 * Items Service
 * Handles all item-related API calls
 */

import { apiClient } from '@/lib/api-client';
import type { RentalItem } from '@/types';

interface CreateItemRequest {
    name: string;
    description: string;
    price_per_day: number;
    category: number;
    image_url?: string;
    location?: string;
    delivery_method?: string;
    owner_id?: string;
}

interface UpdateItemRequest extends Partial<CreateItemRequest> {
    is_available?: boolean;
}

interface ItemsResponse {
    results?: RentalItem[];
    count?: number;
    next?: string | null;
    previous?: string | null;
}

export const itemsService = {
    /**
     * Get all items with optional filtering
     */
    async getAll(params?: {
        category_id?: number;
        search?: string;
        min_price?: number;
        max_price?: number;
        location?: string;
        is_available?: boolean;
    }): Promise<RentalItem[]> {
        const response = await apiClient.get<ItemsResponse>('/items/', params);
        return response.results || response as any as RentalItem[];
    },

    /**
     * Get single item by ID
     */
    async getById(id: string): Promise<RentalItem> {
        return apiClient.get<RentalItem>(`/items/${id}/`);
    },

    /**
     * Get items by owner ID
     */
    async getByOwner(ownerId: string): Promise<RentalItem[]> {
        const allItems = await this.getAll();
        return allItems.filter(item => item.owner_id === ownerId);
    },

    /**
     * Create new item
     */
    async create(data: CreateItemRequest): Promise<RentalItem> {
        return apiClient.post<RentalItem>('/items/', data);
    },

    /**
     * Update existing item
     */
    async update(id: string, data: UpdateItemRequest): Promise<RentalItem> {
        return apiClient.patch<RentalItem>(`/items/${id}/`, data);
    },

    /**
     * Delete item
     */
    async delete(id: string): Promise<void> {
        return apiClient.delete<void>(`/items/${id}/`);
    },

    /**
     * Upload item image
     */
    async uploadImage(itemId: string, file: File): Promise<RentalItem> {
        return apiClient.uploadFile<RentalItem>(`/items/${itemId}/upload-image/`, file);
    },

    /**
     * Check item availability for date range
     */
    async checkAvailability(itemId: string, startDate: string, endDate: string): Promise<boolean> {
        try {
            const response = await apiClient.get<{ available: boolean }>(
                `/items/${itemId}/check-availability/`,
                { start_date: startDate, end_date: endDate }
            );
            return response.available;
        } catch (error) {
            console.error('Availability check failed:', error);
            return false;
        }
    },
};
