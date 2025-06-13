
"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { RequestCard } from '@/components/requests/RequestCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import type { RentalRequest, UserProfile } from '@/types';
import { Loader2, Inbox } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const currentUserId = 'user123'; 
const currentUserProfile: UserProfile = { id: currentUserId, name: 'Alice Wonderland', avatarUrl: 'https://placehold.co/100x100.png' };
const otherUserProfile: UserProfile = { id: 'user456', name: 'Bob The Builder', avatarUrl: 'https://placehold.co/100x100.png' };


const initialMockRequests: RentalRequest[] = [
  { id: 'req1', itemId: '1', item: {id: '1', name: 'DSLR Camera', imageUrl: 'https://placehold.co/100x100.png', pricePerDay: 50}, requester: currentUserProfile, owner: otherUserProfile, startDate: new Date('2024-08-01'), endDate: new Date('2024-08-05'), status: 'Approved', totalPrice: 250, requestedAt: new Date(Date.now() - 1000 * 60 * 60 * 24) },
  { id: 'req2', itemId: '2', item: {id: '2', name: 'Mountain Bike', imageUrl: 'https://placehold.co/100x100.png', pricePerDay: 35}, requester: otherUserProfile, owner: currentUserProfile, startDate: new Date('2024-08-10'), endDate: new Date('2024-08-12'), status: 'Approved', totalPrice: 105, requestedAt: new Date(Date.now() - 1000 * 60 * 60 * 48) },
  { id: 'req3', itemId: '3', item: {id: '3', name: 'Leather Jacket', imageUrl: 'https://placehold.co/100x100.png', pricePerDay: 20}, requester: currentUserProfile, owner: otherUserProfile, startDate: new Date('2024-07-20'), endDate: new Date('2024-07-22'), status: 'Completed', totalPrice: 60, requestedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10) },
  { id: 'req4', itemId: '4', item: {id: '4', name: 'Bluetooth Speaker', imageUrl: 'https://placehold.co/100x100.png', pricePerDay: 15}, requester: otherUserProfile, owner: currentUserProfile, startDate: new Date('2024-08-15'), endDate: new Date('2024-08-18'), status: 'Pending', totalPrice: 60, requestedAt: new Date(Date.now() - 1000 * 60 * 30) },
  { id: 'req5', itemId: '5', item: {id: '5', name: 'Downtown Apartment', imageUrl: 'https://placehold.co/100x100.png', pricePerDay: 120}, requester: currentUserProfile, owner: otherUserProfile, startDate: new Date('2024-09-01'), endDate: new Date('2024-09-07'), status: 'Rejected', totalPrice: 840, requestedAt: new Date(Date.now() - 1000 * 60 * 60 * 5) },
  { id: 'req6', itemId: 'item_owned_by_current_user_and_approved', item: {id: 'item_owned_by_current_user_and_approved', name: 'Owned Item Example', imageUrl: 'https://placehold.co/100x100.png', pricePerDay: 20}, requester: otherUserProfile, owner: currentUserProfile, startDate: new Date('2024-08-20'), endDate: new Date('2024-08-22'), status: 'ReceiptConfirmed', totalPrice: 40, requestedAt: new Date(Date.now() - 1000 * 60 * 60 * 72) },
];

export default function RequestsPage() {
  const { toast } = useToast();
  const [requests, setRequests] = useState<RentalRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setRequests(initialMockRequests.sort((a,b) => b.requestedAt.getTime() - a.requestedAt.getTime()));
      setIsLoading(false);
    }, 1000);
  }, []);
  
  const sentRequests = useMemo(() => {
    return requests.filter(req => req.requester.id === currentUserId).sort((a,b) => b.requestedAt.getTime() - a.requestedAt.getTime());
  }, [requests]);

  const receivedRequests = useMemo(() => {
    return requests.filter(req => req.owner.id === currentUserId).sort((a,b) => b.requestedAt.getTime() - a.requestedAt.getTime());
  }, [requests]);


  const updateRequestStatusById = (requestId: string, newStatus: RentalRequest['status']) => {
    setRequests(prevRequests =>
      prevRequests.map(req =>
        req.id === requestId ? { ...req, status: newStatus } : req
      )
    );
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


  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg text-muted-foreground">Loading your requests...</p>
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
            onApprove={type === 'received' && req.status === 'Pending' ? handleApprove : undefined}
            onReject={type === 'received' && req.status === 'Pending' ? handleReject : undefined}
            onCancel={(req.status === 'Pending' || req.status === 'Approved') ? handleCancel : undefined}
            onConfirmReceipt={type === 'sent' && req.status === 'Approved' ? handleConfirmReceipt : undefined}
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
