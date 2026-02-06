import type { RentalRequest, UserProfile } from '@/types';
import { fetchApi } from './api';

function mapBackendToFrontend(req: any): RentalRequest {
    return {
        id: req.id.toString(),
        itemId: req.item.toString(),
        item: {
            id: req.item_details?.id?.toString() || req.item.toString(),
            name: req.item_details?.name || 'Unknown Item',
            imageUrl: req.item_details?.image_url || 'https://placehold.co/100x100.png',
            pricePerDay: parseFloat(req.item_details?.price_per_day || req.total_price),
        },
        requester: { id: req.requester_name, name: req.requester_name, avatarUrl: 'https://placehold.co/40x40.png' },
        owner: { id: req.owner_name, name: req.owner_name, avatarUrl: 'https://placehold.co/40x40.png' },
        startDate: new Date(req.start_date),
        endDate: new Date(req.end_date),
        status: req.status as RentalRequest['status'],
        totalPrice: parseFloat(req.total_price),
        requestedAt: new Date(req.requested_at),
        ratingGiven: req.rating_given,
    };
}

export async function getAllRequests(): Promise<RentalRequest[]> {
    try {
        const requests = await fetchApi('/requests/');
        return requests.map(mapBackendToFrontend);
    } catch (error) {
        console.error("Failed to fetch requests:", error);
        return [];
    }
}

export async function createRequest(requestData: Omit<RentalRequest, 'id' | 'requestedAt' | 'item' | 'requester' | 'owner'> & { itemId: string, requesterName: string, ownerName: string }): Promise<RentalRequest> {
    const backendData = {
        item: requestData.itemId,
        requester_name: requestData.requesterName,
        owner_name: requestData.ownerName,
        start_date: requestData.startDate.toISOString().split('T')[0],
        end_date: requestData.endDate.toISOString().split('T')[0],
        status: requestData.status,
        total_price: requestData.totalPrice,
    };

    const newRequest = await fetchApi('/requests/', {
        method: 'POST',
        body: JSON.stringify(backendData)
    });

    return mapBackendToFrontend(newRequest);
}

export async function updateRequestStatus(requestId: string, status: RentalRequest['status'], rating?: number): Promise<RentalRequest | null> {
    const body: any = { status };
    if (rating !== undefined) {
        body.rating_given = rating;
    }

    try {
        const updatedRequest = await fetchApi(`/requests/${requestId}/`, {
            method: 'PATCH',
            body: JSON.stringify(body)
        });
        return mapBackendToFrontend(updatedRequest);
    } catch (error) {
        console.error(`Failed to update request ${requestId}:`, error);
        return null;
    }
}
