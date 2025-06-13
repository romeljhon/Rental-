import Image from 'next/image';
import type { RentalRequest } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Check, X, Hourglass, DollarSign } from 'lucide-react';
import { format } from 'date-fns';

interface RequestCardProps {
  request: RentalRequest;
  type: 'sent' | 'received'; // To control displayed actions
  onApprove?: (requestId: string) => void;
  onReject?: (requestId: string) => void;
  onCancel?: (requestId: string) => void;
}

const statusColors: Record<RentalRequest['status'], string> = {
  Pending: 'bg-yellow-500/80 hover:bg-yellow-500/90 text-yellow-foreground',
  Approved: 'bg-green-500/80 hover:bg-green-500/90 text-green-foreground',
  Rejected: 'bg-red-500/80 hover:bg-red-500/90 text-red-foreground',
  Cancelled: 'bg-gray-500/80 hover:bg-gray-500/90 text-gray-foreground',
  Completed: 'bg-blue-500/80 hover:bg-blue-500/90 text-blue-foreground',
  AwaitingPayment: 'bg-orange-500/80 hover:bg-orange-500/90 text-orange-foreground',
};

const statusIcons: Record<RentalRequest['status'], React.ElementType> = {
  Pending: Hourglass,
  Approved: Check,
  Rejected: X,
  Cancelled: X,
  Completed: Check,
  AwaitingPayment: DollarSign,
};


export function RequestCard({ request, type, onApprove, onReject, onCancel }: RequestCardProps) {
  const StatusIcon = statusIcons[request.status];
  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="flex flex-row items-start gap-4 space-y-0 pb-3">
        <div className="flex-shrink-0">
          <Image
            src={request.item.imageUrl || 'https://placehold.co/100x100.png'}
            alt={request.item.name}
            width={80}
            height={80}
            className="rounded-md object-cover aspect-square"
            data-ai-hint="rental item"
          />
        </div>
        <div className="flex-grow">
          <CardTitle className="text-lg font-headline mb-1">{request.item.name}</CardTitle>
          <div className="text-sm text-muted-foreground space-y-0.5">
            <p className="flex items-center">
              <CalendarDays className="w-4 h-4 mr-1.5" />
              {format(new Date(request.startDate), 'MMM d, yyyy')} - {format(new Date(request.endDate), 'MMM d, yyyy')}
            </p>
            <p>
              {type === 'sent' ? `To: ${request.owner.name}` : `From: ${request.requester.name}`}
            </p>
             <p className="flex items-center font-semibold text-primary">
              <DollarSign className="w-4 h-4 mr-1" />
              {request.totalPrice.toFixed(2)}
            </p>
          </div>
        </div>
        <Badge className={`capitalize text-xs py-1 px-2.5 ${statusColors[request.status]}`}>
          <StatusIcon className="w-3 h-3 mr-1.5" />
          {request.status}
        </Badge>
      </CardHeader>
      
      {(type === 'received' && request.status === 'Pending' && onApprove && onReject) && (
        <CardFooter className="pt-2 pb-4 flex justify-end space-x-2">
          <Button variant="outline" size="sm" onClick={() => onReject(request.id)} className="border-destructive text-destructive hover:bg-destructive/10">
            <X className="w-4 h-4 mr-1.5" /> Reject
          </Button>
          <Button size="sm" onClick={() => onApprove(request.id)} className="bg-green-600 hover:bg-green-700 text-white">
            <Check className="w-4 h-4 mr-1.5" /> Approve
          </Button>
        </CardFooter>
      )}
      {(type === 'sent' && (request.status === 'Pending' || request.status === 'Approved') && onCancel) && (
        <CardFooter className="pt-2 pb-4 flex justify-end">
          <Button variant="ghost" size="sm" onClick={() => onCancel(request.id)} className="text-destructive hover:bg-destructive/10 hover:text-destructive">
            <X className="w-4 h-4 mr-1.5" /> Cancel Request
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
