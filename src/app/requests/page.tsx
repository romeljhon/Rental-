
"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { RequestCard } from '@/components/requests/RequestCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Inbox } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { authService, requestsService } from '@/services';
import type { RentalRequest, UserProfile } from '@/types';
import { useRouter } from 'next/navigation';

export default function RequestsPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [requests, setRequests] = useState<RentalRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  const fetchRequests = async (userId: string) => {
    setIsLoading(true);
    try {
      // Fetch both sent and received requests
      const [sent, received] = await Promise.all([
        requestsService.getAll({ requester: userId }),
        requestsService.getAll({ owner: userId })
      ]);

      // Combine and dedup by ID just in case
      const allRequests = [...sent, ...received];
      const uniqueRequests = Array.from(new Map(allRequests.map(item => [item.id, item])).values());

      // Fix dates if they come as strings
      const processedRequests = uniqueRequests.map(req => ({
        ...req,
        requestedAt: new Date(req.requestedAt),
        startDate: new Date(req.startDate),
        endDate: new Date(req.endDate),
      }));

      setRequests(processedRequests);
    } catch (error) {
      console.error("Failed to fetch requests:", error);
      toast({ title: "Error", description: "Failed to load requests.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (!user) {
      router.push('/login');
      return;
    }
    setCurrentUser(user);
    fetchRequests(user.id);
  }, []);

  const sentRequests = useMemo(() => {
    if (!currentUser) return [];
    return requests
      .filter(req => req.requester.id === currentUser.id)
      .sort((a, b) => b.requestedAt.getTime() - a.requestedAt.getTime());
  }, [requests, currentUser]);

  const receivedRequests = useMemo(() => {
    if (!currentUser) return [];
    return requests
      .filter(req => req.owner.id === currentUser.id)
      .sort((a, b) => b.requestedAt.getTime() - a.requestedAt.getTime());
  }, [requests, currentUser]);

  const handleStatusUpdate = async (requestId: string, newStatus: string, rating?: number) => {
    try {
      let updatedRequest: RentalRequest;

      if (newStatus === 'Approved') {
        updatedRequest = await requestsService.accept(requestId);
      } else if (newStatus === 'Rejected') {
        updatedRequest = await requestsService.reject(requestId);
      } else if (newStatus === 'Cancelled') {
        // Assuming API supports delete for cancel, or status update
        // The service has a delete method, but also updateStatus.
        // Let's use updateStatus('Cancelled') if backend supports it, otherwise delete.
        // Based on service definition: updateStatus takes a string.
        updatedRequest = await requestsService.updateStatus(requestId, 'Cancelled');
      } else if (newStatus === 'Completed') {
        updatedRequest = await requestsService.complete(requestId, rating);
      } else if (newStatus === 'ReceiptConfirmed') {
        updatedRequest = await requestsService.updateStatus(requestId, 'ReceiptConfirmed');
      } else {
        return;
      }

      // Update local state
      setRequests(prev => prev.map(req =>
        req.id === requestId ? {
          ...updatedRequest,
          requestedAt: new Date(updatedRequest.requestedAt),
          startDate: new Date(updatedRequest.startDate),
          endDate: new Date(updatedRequest.endDate),
        } : req
      ));

      const titleMap: Record<string, string> = {
        'Approved': 'Request Approved',
        'Rejected': 'Request Rejected',
        'Cancelled': 'Request Cancelled',
        'Completed': 'Rental Completed',
        'ReceiptConfirmed': 'Receipt Confirmed'
      };

      toast({
        title: titleMap[newStatus] || 'Status Updated',
        description: `Request status changed to ${newStatus}.`
      });

    } catch (error) {
      console.error("Failed to update request:", error);
      toast({
        title: "Action Failed",
        description: "Could not update request status.",
        variant: "destructive"
      });
    }
  };

  const handleApprove = (requestId: string) => handleStatusUpdate(requestId, 'Approved');
  const handleReject = (requestId: string) => handleStatusUpdate(requestId, 'Rejected');
  const handleCancel = (requestId: string) => handleStatusUpdate(requestId, 'Cancelled');
  const handleConfirmReceipt = (requestId: string) => handleStatusUpdate(requestId, 'ReceiptConfirmed');
  const handleRateItem = (requestId: string, rating: number) => handleStatusUpdate(requestId, 'Completed', rating);


  if (isLoading || !currentUser) {
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
            currentViewingUserId={currentUser.id}
            onApprove={type === 'received' && req.status === 'Pending' ? handleApprove : undefined}
            onReject={type === 'received' && req.status === 'Pending' ? handleReject : undefined}
            onCancel={(req.status === 'Pending' || req.status === 'Approved') ? handleCancel : undefined}
            onConfirmReceipt={type === 'sent' && req.status === 'Approved' && req.requester.id === currentUser.id ? handleConfirmReceipt : undefined}
            onRateItem={type === 'sent' && req.status === 'Completed' && req.requester.id === currentUser.id ? handleRateItem : undefined}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6 container mx-auto py-10 px-4">
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
