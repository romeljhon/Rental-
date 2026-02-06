
"use client";
import React, { useState } from 'react';
import Image from 'next/image';
import type { RentalRequest } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  CalendarDays, Check, X, Hourglass, PackageCheck, Star,
  Wallet, ShieldCheck, AlertCircle, Loader2, CheckCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { confirmHandover, confirmReturn, simulatePayment } from '@/lib/request-storage';

interface RequestCardProps {
  request: RentalRequest;
  type: 'sent' | 'received';
  currentViewingUserId: string | null; // ID of the user currently viewing the page
  onApprove?: (requestId: string) => void;
  onReject?: (requestId: string) => void;
  onCancel?: (requestId: string) => void;
  onConfirmReceipt?: (requestId: string) => void;
  onRateItem?: (requestId: string, rating: number) => void;
}

const statusColors: Record<RentalRequest['status'], string> = {
  Pending: 'bg-yellow-500/80 text-white',
  Approved: 'bg-green-500/80 text-white',
  AwaitingPayment: 'bg-orange-500/80 text-white',
  Paid: 'bg-emerald-500/80 text-white',
  InHand: 'bg-indigo-500/80 text-white',
  Returned: 'bg-purple-500/80 text-white',
  Completed: 'bg-blue-500/80 text-white',
  Rejected: 'bg-red-500/80 text-white',
  Cancelled: 'bg-gray-500/80 text-white',
  Disputed: 'bg-rose-600 text-white',
};

const statusIcons: Record<RentalRequest['status'], React.ElementType> = {
  Pending: Hourglass,
  Approved: Check,
  AwaitingPayment: Hourglass,
  Paid: Wallet,
  InHand: ShieldCheck,
  Returned: PackageCheck,
  Completed: CheckCircle,
  Rejected: X,
  Cancelled: X,
  Disputed: AlertCircle,
};

export function RequestCard({
  request, type, currentViewingUserId, onApprove, onReject, onCancel,
  onConfirmReceipt, onRateItem
}: RequestCardProps) {
  const StatusIcon = statusIcons[request.status];
  const isOwnerViewing = type === 'received' && currentViewingUserId === request.owner.id;
  const isRequesterViewing = type === 'sent' && currentViewingUserId === request.requester.id;

  const [currentRating, setCurrentRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const handleRatingSubmit = () => {
    if (onRateItem && currentRating > 0) {
      onRateItem(request.id, currentRating);
    }
  };

  const onConfirmHandoverLocal = async () => {
    setIsVerifying(true);
    try {
      await confirmHandover(request.id, verificationCode);
      window.location.reload(); // Refresh to show new status
    } catch (e) {
      alert("Invalid handover code!");
    } finally {
      setIsVerifying(false);
    }
  };

  const onConfirmReturnLocal = async () => {
    setIsVerifying(true);
    try {
      await confirmReturn(request.id, verificationCode);
      window.location.reload();
    } catch (e) {
      alert("Invalid return code!");
    } finally {
      setIsVerifying(false);
    }
  };

  const onSimulatePaymentLocal = async () => {
    await simulatePayment(request.id);
    window.location.reload();
  };

  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="flex flex-col sm:flex-row items-start gap-4 space-y-0 pb-3 relative">
        <div className="flex-shrink-0 w-full sm:w-auto">
          <Image
            src={request.item.imageUrl || 'https://placehold.co/100x100.png'}
            alt={request.item.name}
            width={80}
            height={80}
            className="rounded-md object-cover aspect-square w-full sm:w-20 sm:h-20 max-h-[160px]"
          />
        </div>
        <div className="flex-grow w-full">
          <div className="flex justify-between items-start mb-1">
            <CardTitle className="text-lg font-headline">{request.item.name}</CardTitle>
            <Badge className={`capitalize text-[10px] sm:text-xs py-1 px-2.5 absolute top-3 right-4 sm:static ${statusColors[request.status]}`}>
              <StatusIcon className="w-3 h-3 mr-1.5" />
              {request.status === 'AwaitingPayment' ? 'Ready to Pay' : request.status}
            </Badge>
          </div>
          <div className="text-sm text-muted-foreground space-y-0.5">
            <p className="flex items-center">
              <CalendarDays className="w-4 h-4 mr-1.5 shrink-0" />
              <span className="truncate">{format(new Date(request.startDate), 'MMM d, yyyy')} - {format(new Date(request.endDate), 'MMM d, yyyy')}</span>
            </p>
            <p className="truncate">
              {isRequesterViewing ? `Owner: ${request.owner.name}` : `Renter: ${request.requester.name}`}
            </p>
            <div className="flex items-center gap-3">
              <p className="font-semibold text-primary">
                Total: ₱{request.totalPrice.toFixed(2)}
              </p>
              {request.depositAmount > 0 && (
                <p className="text-xs text-muted-foreground">
                  (Incl. ₱{request.depositAmount.toFixed(2)} deposit)
                </p>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-2 pb-3 border-t bg-muted/20">
        {/* LIFE CYCLE - PAYER VIEW */}
        {isRequesterViewing && (request.status === 'Approved' || request.status === 'AwaitingPayment') && (
          <div className="space-y-4 p-2">
            <div className="flex items-center gap-2 text-primary font-bold">
              <Wallet className="w-4 h-4" />
              Complete Payment to proceed
            </div>
            <p className="text-xs text-muted-foreground">The owner has approved your request. Once you pay, you will be able to verify the handover.</p>
            <Button onClick={onSimulatePaymentLocal} className="w-full bg-primary hover:bg-primary/90 text-sm h-9">
              Simulate Payment
            </Button>
          </div>
        )}

        {/* LIFE CYCLE - HANDOVER PHASE */}
        {request.status === 'Paid' && (
          <div className="p-3 border-2 border-dashed border-primary/20 rounded-xl bg-primary/5">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="w-5 h-5 text-primary" />
              <span className="font-headline font-bold uppercase text-xs tracking-wider">Handover Protocol</span>
            </div>
            {isOwnerViewing ? (
              <div className="space-y-2">
                <p className="text-sm">Show this code to the renter when they pick up the item:</p>
                <div className="text-3xl font-black text-center tracking-widest text-primary p-2 bg-white rounded-lg border border-primary/10 select-all">
                  {request.handoverCode}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm">Enter the code provided by the owner below to confirm pickup:</p>
                <div className="flex gap-2">
                  <Input
                    placeholder="8-digit code"
                    className="h-10 text-center font-mono tracking-widest"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.toUpperCase())}
                  />
                  <Button onClick={onConfirmHandoverLocal} disabled={isVerifying} className="h-10 px-6">
                    {isVerifying ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : 'Confirm'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* LIFE CYCLE - RETURN PHASE */}
        {request.status === 'InHand' && (
          <div className="p-3 border-2 border-dashed border-indigo-200 rounded-xl bg-indigo-50/50">
            <div className="flex items-center gap-2 mb-2 text-indigo-700">
              <PackageCheck className="w-5 h-5" />
              <span className="font-headline font-bold uppercase text-xs tracking-wider">Return Protocol</span>
            </div>
            {isOwnerViewing ? (
              <div className="space-y-2">
                <p className="text-sm">Show this code to the renter when they return the item:</p>
                <div className="text-3xl font-black text-center tracking-widest text-indigo-700 p-2 bg-white rounded-lg border border-indigo-200 select-all">
                  {request.returnCode}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm">Enter the code provided by the owner to confirm return:</p>
                <div className="flex gap-2">
                  <Input
                    placeholder="8-digit code"
                    className="h-10 text-center font-mono tracking-widest"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.toUpperCase())}
                  />
                  <Button onClick={onConfirmReturnLocal} disabled={isVerifying} className="h-10 px-6 bg-indigo-600 hover:bg-indigo-700">
                    {isVerifying ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : 'Confirm'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* RATING SECTION */}
        {isRequesterViewing && request.status === 'Completed' && (
          <div className="space-y-3 mt-2">
            {!request.ratingGiven ? (
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">Rate your experience:</p>
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setCurrentRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-0.5"
                    >
                      <Star className={`w-6 h-6 ${(hoverRating || currentRating) >= star ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'}`} />
                    </button>
                  ))}
                  {currentRating > 0 && (
                    <Button size="sm" onClick={handleRatingSubmit} className="ml-4 h-8 bg-black text-white px-4">
                      Submit
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-sm text-foreground flex items-center gap-2">
                You rated: <span className="font-bold">{request.ratingGiven}</span> stars
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-3.5 h-3.5 ${i < request.ratingGiven! ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground/30'}`} />
                  ))}
                </div>
              </p>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-2 pb-4 flex justify-end space-x-2">
        {isOwnerViewing && request.status === 'Pending' && onApprove && onReject && (
          <>
            <Button variant="outline" size="sm" onClick={() => onReject(request.id)} className="border-destructive text-destructive hover:bg-destructive/10">
              <X className="w-4 h-4 mr-1.5" /> Reject
            </Button>
            <Button size="sm" onClick={() => onApprove(request.id)} className="bg-green-600 hover:bg-green-700 text-white">
              <Check className="w-4 h-4 mr-1.5" /> Approve
            </Button>
          </>
        )}
        {(isRequesterViewing || isOwnerViewing) && (request.status === 'Pending' || request.status === 'Approved' || request.status === 'AwaitingPayment') && onCancel && (
          <Button variant="ghost" size="sm" onClick={() => onCancel(request.id)} className="text-destructive hover:bg-destructive/10 hover:text-destructive">
            <X className="w-4 h-4 mr-1.5" /> Cancel Request
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
