
"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { RequestCard } from '@/components/requests/RequestCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import type { RentalRequest, UserProfile } from '@/types';
import { Loader2, Inbox } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getActiveUserId, getActiveUserProfile, MOCK_USER_JOHN, MOCK_USER_ALICE } from '@/lib/auth';
import { useNotifications } from '@/contexts/NotificationContext'; // Added

// Original mock profiles - adjust if necessary to match MOCK_USER_JOHN/ALICE
const otherUserProfile: UserProfile = { id: 'user456', name: 'Bob The Builder', avatarUrl: 'https://placehold.co/100x100.png' };


const initialMockRequests: RentalRequest[] = [
  // John's requests (as requester or owner)
  { id: 'req1', itemId: 'item_rented_by_john', item: {id: 'item_rented_by_john', name: 'Yoga Mat', imageUrl: 'https://placehold.co/100x100.png', pricePerDay: 10}, requester: MOCK_USER_JOHN, owner: MOCK_USER_ALICE, startDate: new Date('2024-08-01'), endDate: new Date('2024-08-05'), status: 'Approved', totalPrice: 50, requestedAt: new Date(Date.now() - 1000 * 60 * 60 * 24) },
  { id: 'req2', itemId: 'item_owned_by_john', item: {id: 'item_owned_by_john', name: 'DSLR Camera', imageUrl: 'https://placehold.co/100x100.png', pricePerDay: 50}, requester: MOCK_USER_ALICE, owner: MOCK_USER_JOHN, startDate: new Date('2024-08-10'), endDate: new Date('2024-08-12'), status: 'Approved', totalPrice: 150, requestedAt: new Date(Date.now() - 1000 * 60 * 60 * 48) },
  
  // Alice's requests (as requester or owner)
  { id: 'req3', itemId: 'item_rented_by_alice', item: {id: 'item_rented_by_alice', name: 'Mountain Bike', imageUrl: 'https://placehold.co/100x100.png', pricePerDay: 35}, requester: MOCK_USER_ALICE, owner: MOCK_USER_JOHN, startDate: new Date('2024-07-20'), endDate: new Date('2024-07-22'), status: 'Completed', totalPrice: 105, requestedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10) },
  { id: 'req4', itemId: 'item_owned_by_alice', item: {id: 'item_owned_by_alice', name: 'Ukulele', imageUrl: 'https://placehold.co/100x100.png', pricePerDay: 12}, requester: MOCK_USER_JOHN, owner: MOCK_USER_ALICE, startDate: new Date('2024-08-15'), endDate: new Date('2024-08-18'), status: 'Pending', totalPrice: 48, requestedAt: new Date(Date.now() - 1000 * 60 * 30) },

  // More generic requests
  { id: 'req5', itemId: '5', item: {id: '5', name: 'Downtown Apartment', imageUrl: 'https://placehold.co/100x100.png', pricePerDay: 120}, requester: MOCK_USER_JOHN, owner: otherUserProfile, startDate: new Date('2024-09-01'), endDate: new Date('2024-09-07'), status: 'Rejected', totalPrice: 840, requestedAt: new Date(Date.now() - 1000 * 60 * 60 * 5) },
  { id: 'req6', itemId: 'item_owned_by_john_receipt_confirmed', item: {id: 'item_owned_by_john_receipt_confirmed', name: 'Vintage Leather Jacket', imageUrl: 'https://placehold.co/100x100.png', pricePerDay: 20}, requester: MOCK_USER_ALICE, owner: MOCK_USER_JOHN, startDate: new Date('2024-08-20'), endDate: new Date('2024-08-22'), status: 'ReceiptConfirmed', totalPrice: 60, requestedAt: new Date(Date.now() - 1000 * 60 * 60 * 72) },
];

export default function RequestsPage() {
  const { toast } = useToast();
  const { addNotification } = useNotifications(); // Added
  const [requests, setRequests] = useState<RentalRequest[]>(initialMockRequests.sort((a,b) => b.requestedAt.getTime() - a.requestedAt.getTime()));
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile | null>(null);


  useEffect(() => {
    const activeId = getActiveUserId();
    const activeProfile = getActiveUserProfile();
    setCurrentUserId(activeId);
    setCurrentUserProfile(activeProfile);
    // Simulate loading, can be removed if data is fetched based on currentUserId
    setTimeout(() => {
      setIsLoading(false);
    }, 500); // Shorter delay
  }, []); 

  useEffect(() => {
    const activeId = getActiveUserId();
    if (activeId !== currentUserId) {
        setCurrentUserId(activeId);
        setCurrentUserProfile(getActiveUserProfile());
    }
  }, [currentUserId]); 
  
  const sentRequests = useMemo(() => {
    if (!currentUserId) return [];
    return requests.filter(req => req.requester.id === currentUserId).sort((a,b) => b.requestedAt.getTime() - a.requestedAt.getTime());
  }, [requests, currentUserId]);

  const receivedRequests = useMemo(() => {
    if (!currentUserId) return [];
    return requests.filter(req => req.owner.id === currentUserId).sort((a,b) => b.requestedAt.getTime() - a.requestedAt.getTime());
  }, [requests, currentUserId]);


  const updateRequestStatusById = (requestId: string, newStatus: RentalRequest['status']) => {
    const originalRequest = requests.find(req => req.id === requestId);
    if (!originalRequest || !currentUserProfile) return;

    setRequests(prevRequests =>
      prevRequests.map(req =>
        req.id === requestId ? { ...req, status: newStatus } : req
      )
    );

    // Notification Logic
    let notifTargetUserId: string | null = null;
    let notifTitle = '';
    let notifMessage = '';

    if (newStatus === 'Approved') {
        notifTargetUserId = originalRequest.requester.id;
        notifTitle = 'Request Approved!';
        notifMessage = `${originalRequest.owner.name} approved your request for ${originalRequest.item.name}.`;
    } else if (newStatus === 'Rejected') {
        notifTargetUserId = originalRequest.requester.id;
        notifTitle = 'Request Rejected';
        notifMessage = `${originalRequest.owner.name} rejected your request for ${originalRequest.item.name}.`;
    } else if (newStatus === 'Cancelled') {
        // If owner cancelled, notify requester. If requester cancelled, notify owner.
        notifTargetUserId = originalRequest.requester.id === currentUserId ? originalRequest.owner.id : originalRequest.requester.id;
        notifTitle = 'Request Cancelled';
        notifMessage = `The request for ${originalRequest.item.name} has been cancelled.`;
    } else if (newStatus === 'ReceiptConfirmed') {
        notifTargetUserId = originalRequest.owner.id;
        notifTitle = 'Item Receipt Confirmed';
        notifMessage = `${originalRequest.requester.name} confirmed receipt of ${originalRequest.item.name}.`;
    }

    if (notifTargetUserId && notifTitle) {
        addNotification({
            targetUserId: notifTargetUserId,
            eventType: newStatus === 'ReceiptConfirmed' ? 'item_receipt_confirmed' : 'request_update',
            title: notifTitle,
            message: notifMessage,
            link: '/requests',
            relatedItemId: originalRequest.itemId,
            relatedUser: {id: currentUserProfile.id, name: currentUserProfile.name}
        });
    }
  };
  
  const handleApprove = (requestId: string) => {
    updateRequestStatusById(requestId, 'Approved');
    toast({ title: 'Request Approved', description: 'The rental request has been approved.' });
  };

  const handleReject = (requestId: string) => {
    updateRequestStatusById(requestId, 'Rejected');
    toast({ title: 'Request Rejected', description: 'The rental request has been rejected.', variant: 'destructive' });
  };
  
  const handleCancel = (requestId: string) => {
    updateRequestStatusById(requestId, 'Cancelled');
    toast({ title: 'Request Cancelled', description: 'The rental request has been cancelled.' });
  };

  const handleConfirmReceipt = (requestId: string) => {
    updateRequestStatusById(requestId, 'ReceiptConfirmed');
    toast({ title: 'Item Receipt Confirmed', description: 'The owner has been notified. (Mock)' });
  };


  if (isLoading || !currentUserId || !currentUserProfile) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg text-muted-foreground">Loading requests...</p>
      </div>
    );
  }
  
  const renderRequestList = (reqs: RentalRequest[], type: 'sent' | 'received') => {
    if (reqs.length === 0) {
      return (
        <div className="text-center py-12 text-muted-foreground">
          <Inbox className="mx-auto h-16 w-16 mb-4 opacity-50" />
          <p className="text-xl">No {type === 'sent' ? 'sent' : 'received'} requests yet.</p>
          <p>When you {type === 'sent' ? 'make' : 'receive'} requests, they will appear here.</p>
        </div>
      );
    }
    return (
      <div className="space-y-4">
        {reqs.map(req => (
          <RequestCard 
            key={req.id} 
            request={req} 
            type={type}
            currentViewingUserId={currentUserId} 
            onApprove={type === 'received' && req.status === 'Pending' ? handleApprove : undefined}
            onReject={type === 'received' && req.status === 'Pending' ? handleReject : undefined}
            onCancel={(req.status === 'Pending' || req.status === 'Approved') ? handleCancel : undefined}
            onConfirmReceipt={type === 'sent' && req.status === 'Approved' && req.requester.id === currentUserId ? handleConfirmReceipt : undefined}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-headline text-primary">Rental Requests</h1>
      <Tabs defaultValue="received" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:w-auto md:inline-flex mb-4">
          <TabsTrigger value="received">Received Requests</TabsTrigger>
          <TabsTrigger value="sent">Sent Requests</TabsTrigger>
        </TabsList>
        <TabsContent value="received">
          {renderRequestList(receivedRequests, 'received')}
        </TabsContent>
        <TabsContent value="sent">
          {renderRequestList(sentRequests, 'sent')}
        </TabsContent>
      </Tabs>
    </div>
  );
}
