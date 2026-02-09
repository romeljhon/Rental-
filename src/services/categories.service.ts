/**
 * Categories Service
 * Handles item categories
 */

import { apiClient } from '@/lib/api-client';

interface Category {
    id: number;
    name: string;
}

export const categoriesService = {
    /**
     * Get all categories
     */
    async getAll(): Promise<Category[]> {
        return apiClient.get<Category[]>('/categories/');
    },

    /**
     * Get category by ID
     */
    async getById(id: number): Promise<Category> {
        return apiClient.get<Category>(`/categories/${id}/`);
    },

    /**
     * Create new category
     */
    async create(name: string): Promise<Category> {
        return apiClient.post<Category>('/categories/', { name });
    },
};

export type { Category };
