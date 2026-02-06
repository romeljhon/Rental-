
"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { RequestCard } from '@/components/requests/RequestCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import type { RentalRequest, UserProfile } from '@/types';
import { Loader2, Inbox } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getActiveUserId, getActiveUserProfile } from '@/lib/auth';
import { useNotifications } from '@/contexts/NotificationContext';

import { getAllRequests, updateRequestStatus } from '@/lib/request-storage';

export default function RequestsPage() {
  const { toast } = useToast();
  const { addNotification } = useNotifications();
  const [requests, setRequests] = useState<RentalRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile | null>(null);

  const fetchRequests = async () => {
    setIsLoading(true);
    const loadedRequests = await getAllRequests();
    setRequests(loadedRequests.sort((a, b) => b.requestedAt.getTime() - a.requestedAt.getTime()));
    setIsLoading(false);
  };

  useEffect(() => {
    const activeId = getActiveUserId();
    const activeProfile = getActiveUserProfile();
    setCurrentUserId(activeId);
    setCurrentUserProfile(activeProfile);
    fetchRequests();
  }, []);

  useEffect(() => {
    const handleUserSwitch = () => {
      const newActiveId = getActiveUserId();
      if (newActiveId !== currentUserId) {
        setCurrentUserId(newActiveId);
        setCurrentUserProfile(getActiveUserProfile());
        fetchRequests();
      }
    };

    window.addEventListener('storage', handleUserSwitch);
    window.addEventListener('focus', handleUserSwitch);

    return () => {
      window.removeEventListener('storage', handleUserSwitch);
      window.removeEventListener('focus', handleUserSwitch);
    };
  }, [currentUserId]);

  const sentRequests = useMemo(() => {
    if (!currentUserId) return [];
    return requests.filter(req => req.requester.id === currentUserId).sort((a, b) => b.requestedAt.getTime() - a.requestedAt.getTime());
  }, [requests, currentUserId]);

  const receivedRequests = useMemo(() => {
    if (!currentUserId) return [];
    return requests.filter(req => req.owner.id === currentUserId).sort((a, b) => b.requestedAt.getTime() - a.requestedAt.getTime());
  }, [requests, currentUserId]);


  const updateRequestStatusById = async (requestId: string, newStatus: RentalRequest['status'], rating?: number) => {
    const originalRequest = requests.find(req => req.id === requestId);
    if (!originalRequest || !currentUserProfile) return;

    const updated = await updateRequestStatus(requestId, newStatus, rating);
    if (!updated) return;

    setRequests(prevRequests =>
      prevRequests.map(req =>
        req.id === requestId ? updated : req
      ).sort((a, b) => b.requestedAt.getTime() - a.requestedAt.getTime())
    );

    // Notifications are now handled by backend signals
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
    toast({ title: 'Item Receipt Confirmed', description: 'The owner has been notified.' });
  };

  const handleRateItem = (requestId: string, rating: number) => {
    const requestToUpdate = requests.find(req => req.id === requestId);
    if (requestToUpdate) {
      // Update the request with the rating. Status remains 'Completed'.
      setRequests(prevRequests =>
        prevRequests.map(req =>
          req.id === requestId ? { ...req, ratingGiven: rating } : req
        ).sort((a, b) => b.requestedAt.getTime() - a.requestedAt.getTime())
      );
      toast({ title: 'Rating Submitted!', description: 'Thank you for your feedback.' });

      // In a real app, you would also trigger an update to the item's average rating:
      // e.g., updateItemAverageRating(requestToUpdate.itemId, rating);
      // This would involve fetching the item, recalculating its average rating and reviewsCount,
      // and saving it back to your database or global item state.
      console.log(`Rating ${rating} submitted for request ${requestId}. Item ID: ${requestToUpdate.itemId}. This would typically update the item's average rating on the backend.`);
    }
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
            onRateItem={type === 'sent' && req.status === 'Completed' && req.requester.id === currentUserId ? handleRateItem : undefined}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-headline text-primary">Rental Requests</h1>
      <Tabs defaultValue="received" className="w-full">
        <TabsList className="border-b-2 border-transparent w-full justify-start rounded-none bg-transparent p-0">
          <TabsTrigger value="received" className="relative h-9 rounded-none border-b-2 border-transparent bg-transparent px-4 pb-3 pt-2 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none">
            Received Requests
          </TabsTrigger>
          <TabsTrigger value="sent" className="relative h-9 rounded-none border-b-2 border-transparent bg-transparent px-4 pb-3 pt-2 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none">
            Sent Requests
          </TabsTrigger>
        </TabsList>
        <TabsContent value="received" className="mt-4">
          {renderRequestList(receivedRequests, 'received')}
        </TabsContent>
        <TabsContent value="sent" className="mt-4">
          {renderRequestList(sentRequests, 'sent')}
        </TabsContent>
      </Tabs>
    </div>
  );
}
