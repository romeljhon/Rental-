import type { RentalRequest, UserProfile } from '@/types';
import { fetchApi, clearApiCache } from './api';

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
        requester: { id: req.requester_id, name: req.requester_name, avatarUrl: 'https://placehold.co/40x40.png' },
        owner: { id: req.owner_id, name: req.owner_name, avatarUrl: 'https://placehold.co/40x40.png' },
        startDate: new Date(req.start_date),
        endDate: new Date(req.end_date),
        status: req.status as RentalRequest['status'],
        totalPrice: parseFloat(req.total_price),
        depositAmount: parseFloat(req.deposit_amount) || 0,
        handoverCode: req.handover_code,
        returnCode: req.return_code,
        requestedAt: new Date(req.requested_at),
        ratingGiven: req.rating_given,
        transactions: req.transactions,
        dispute: req.dispute,
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

export async function createRequest(requestData: Omit<RentalRequest, 'id' | 'requestedAt' | 'item' | 'requester' | 'owner' | 'depositAmount'> & { itemId: string, requesterName: string, ownerName: string, depositAmount: number }): Promise<RentalRequest> {
    const backendData = {
        item: requestData.itemId,
        requester_name: requestData.requesterName,
        owner_name: requestData.ownerName,
        start_date: requestData.startDate.toISOString().split('T')[0],
        end_date: requestData.endDate.toISOString().split('T')[0],
        status: requestData.status,
        total_price: requestData.totalPrice,
        deposit_amount: requestData.depositAmount,
    };

    const newRequest = await fetchApi('/requests/', {
        method: 'POST',
        body: JSON.stringify(backendData)
    });

    clearApiCache('/requests/');
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
        clearApiCache('/requests/');
        clearApiCache(`/requests/${requestId}/`);
        return mapBackendToFrontend(updatedRequest);
    } catch (error) {
        console.error(`Failed to update request ${requestId}:`, error);
        return null;
    }
}

export async function confirmHandover(requestId: string, code: string): Promise<RentalRequest | null> {
    try {
        const data = await fetchApi(`/requests/${requestId}/confirm_handover/`, {
            method: 'POST',
            body: JSON.stringify({ code })
        });
        clearApiCache('/requests/');
        return mapBackendToFrontend(data);
    } catch (error) {
        console.error("Handover failed:", error);
        throw error;
    }
}

export async function confirmReturn(requestId: string, code: string): Promise<RentalRequest | null> {
    try {
        const data = await fetchApi(`/requests/${requestId}/confirm_return/`, {
            method: 'POST',
            body: JSON.stringify({ code })
        });
        clearApiCache('/requests/');
        return mapBackendToFrontend(data);
    } catch (error) {
        console.error("Return failed:", error);
        throw error;
    }
}

export async function simulatePayment(requestId: string): Promise<RentalRequest | null> {
    try {
        const data = await fetchApi(`/requests/${requestId}/simulate_payment/`, {
            method: 'POST'
        });
        clearApiCache('/requests/');
        return mapBackendToFrontend(data);
    } catch (error) {
        console.error("Payment failed:", error);
        return null;
    }
}
