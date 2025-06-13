"use client";
import React, { useState, useEffect } from 'react';
import { RequestCard } from '@/components/requests/RequestCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import type { RentalRequest, UserProfile } from '@/types';
import { Loader2, Inbox } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Mock current user
const currentUserId = 'user123'; // Assume this is the ID of the logged-in user
const currentUserProfile: UserProfile = { id: currentUserId, name: 'Alice Wonderland', avatarUrl: 'https://placehold.co/100x100.png' };

const otherUserProfile: UserProfile = { id: 'user456', name: 'Bob The Builder', avatarUrl: 'https://placehold.co/100x100.png' };


const mockRequests: RentalRequest[] = [
  { id: 'req1', itemId: '1', item: {id: '1', name: 'DSLR Camera', imageUrl: 'https://placehold.co/100x100.png', pricePerDay: 50}, requester: currentUserProfile, owner: otherUserProfile, startDate: new Date('2024-08-01'), endDate: new Date('2024-08-05'), status: 'Pending', totalPrice: 250, requestedAt: new Date() },
  { id: 'req2', itemId: '2', item: {id: '2', name: 'Mountain Bike', imageUrl: 'https://placehold.co/100x100.png', pricePerDay: 35}, requester: otherUserProfile, owner: currentUserProfile, startDate: new Date('2024-08-10'), endDate: new Date('2024-08-12'), status: 'Approved', totalPrice: 105, requestedAt: new Date() },
  { id: 'req3', itemId: '3', item: {id: '3', name: 'Leather Jacket', imageUrl: 'https://placehold.co/100x100.png', pricePerDay: 20}, requester: currentUserProfile, owner: otherUserProfile, startDate: new Date('2024-07-20'), endDate: new Date('2024-07-22'), status: 'Completed', totalPrice: 60, requestedAt: new Date() },
  { id: 'req4', itemId: '4', item: {id: '4', name: 'Bluetooth Speaker', imageUrl: 'https://placehold.co/100x100.png', pricePerDay: 15}, requester: otherUserProfile, owner: currentUserProfile, startDate: new Date('2024-08-15'), endDate: new Date('2024-08-18'), status: 'Pending', totalPrice: 60, requestedAt: new Date() },
  { id: 'req5', itemId: '5', item: {id: '5', name: 'Downtown Apartment', imageUrl: 'https://placehold.co/100x100.png', pricePerDay: 120}, requester: currentUserProfile, owner: otherUserProfile, startDate: new Date('2024-09-01'), endDate: new Date('2024-09-07'), status: 'Rejected', totalPrice: 840, requestedAt: new Date() },
];

export default function RequestsPage() {
  const { toast } = useToast();
  const [sentRequests, setSentRequests] = useState<RentalRequest[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<RentalRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setSentRequests(mockRequests.filter(req => req.requester.id === currentUserId));
      setReceivedRequests(mockRequests.filter(req => req.owner.id === currentUserId));
      setIsLoading(false);
    }, 1000);
  }, []);

  const updateRequestStatus = (requestId: string, newStatus: RentalRequest['status'], listSetter: React.Dispatch<React.SetStateAction<RentalRequest[]>>) => {
    listSetter(prevRequests =>
      prevRequests.map(req =>
        req.id === requestId ? { ...req, status: newStatus } : req
      )
    );
  };
  
  const handleApprove = (requestId: string) => {
    updateRequestStatus(requestId, 'Approved', setReceivedRequests);
    toast({ title: 'Request Approved', description: 'The rental request has been approved.' });
  };

  const handleReject = (requestId: string) => {
    updateRequestStatus(requestId, 'Rejected', setReceivedRequests);
    toast({ title: 'Request Rejected', description: 'The rental request has been rejected.', variant: 'destructive' });
  };
  
  const handleCancel = (requestId: string) => {
    // Determine if it's a sent or received request to update the correct list
    const isSent = sentRequests.some(req => req.id === requestId);
    if (isSent) {
      updateRequestStatus(requestId, 'Cancelled', setSentRequests);
    } else {
      updateRequestStatus(requestId, 'Cancelled', setReceivedRequests);
    }
    toast({ title: 'Request Cancelled', description: 'The rental request has been cancelled.' });
  };


  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg text-muted-foreground">Loading your requests...</p>
      </div>
    );
  }
  
  const renderRequestList = (requests: RentalRequest[], type: 'sent' | 'received') => {
    if (requests.length === 0) {
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
        {requests.map(req => (
          <RequestCard 
            key={req.id} 
            request={req} 
            type={type} 
            onApprove={type === 'received' ? handleApprove : undefined}
            onReject={type === 'received' ? handleReject : undefined}
            onCancel={handleCancel} // Cancel can be on both sent and received (e.g. owner cancels approved)
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
