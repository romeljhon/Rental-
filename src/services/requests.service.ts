/**
 * Rental Requests Service
 * Handles all rental request operations
 */

import { apiClient } from '@/lib/api-client';
import type { RentalRequest } from '@/types';

interface CreateRequestData {
    item: number;
    requester_name: string;
    owner_name: string;
    requester_id: string;
    owner_id: string;
    start_date: string;
    end_date: string;
    total_price: number;
    status?: string;
}

interface UpdateRequestData {
    status?: string;
    rating_given?: number;
}

interface RequestsResponse {
    results?: RentalRequest[];
    count?: number;
}

export const requestsService = {
    /**
     * Get all requests with optional filtering
     */
    async getAll(params?: {
        requester?: string;
        owner?: string;
        status?: string;
    }): Promise<RentalRequest[]> {
        const response = await apiClient.get<RequestsResponse>('/requests/', params);
        return response.results || response as any as RentalRequest[];
    },

    /**
     * Get requests by requester ID
     */
    async getByRequester(requesterId: string): Promise<RentalRequest[]> {
        return this.getAll({ requester: requesterId });
    },

    /**
     * Get requests by owner ID (items owner)
     */
    async getByOwner(ownerId: string): Promise<RentalRequest[]> {
        return this.getAll({ owner: ownerId });
    },

    /**
     * Get single request by ID
     */
    async getById(id: string): Promise<RentalRequest> {
        return apiClient.get<RentalRequest>(`/requests/${id}/`);
    },

    /**
     * Create new rental request
     */
    async create(data: CreateRequestData): Promise<RentalRequest> {
        return apiClient.post<RentalRequest>('/requests/', data);
    },

    /**
     * Update request status
     */
    async updateStatus(id: string, status: string): Promise<RentalRequest> {
        return apiClient.patch<RentalRequest>(`/requests/${id}/`, { status });
    },

    /**
     * Update request (general)
     */
    async update(id: string, data: UpdateRequestData): Promise<RentalRequest> {
        return apiClient.patch<RentalRequest>(`/requests/${id}/`, data);
    },

    /**
     * Delete/cancel request
     */
    async delete(id: string): Promise<void> {
        return apiClient.delete<void>(`/requests/${id}/`);
    },

    /**
     * Accept rental request
     */
    async accept(id: string): Promise<RentalRequest> {
        return this.updateStatus(id, 'Approved');
    },

    /**
     * Reject rental request
     */
    async reject(id: string): Promise<RentalRequest> {
        return this.updateStatus(id, 'Rejected');
    },

    /**
     * Complete rental
     */
    async complete(id: string, rating?: number): Promise<RentalRequest> {
        return apiClient.patch<RentalRequest>(`/requests/${id}/`, {
            status: 'Completed',
            rating_given: rating,
        });
    },
};
