
"use client";
import React, { useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Star, Eye, Edit, Trash2, Package, Truck, ListChecks, CalendarClock, ChevronRight } from 'lucide-react';
import type { RentalItem } from '@/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface ItemCardProps {
  item: RentalItem;
  onEdit?: (itemId: string) => void;
  onRemove?: (itemId: string) => void;
}

export function ItemCard({ item, onEdit, onRemove }: ItemCardProps) {
  const availabilityMessage = useMemo(() => {
    if (item.availabilityStatus === 'Rented' && item.availableFromDate) {
      const currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);
      const dateFromItem = new Date(item.availableFromDate);
      dateFromItem.setHours(0, 0, 0, 0);

      if (currentDate >= dateFromItem) {
        return `Due: ${format(dateFromItem, 'MMM d')}. Soon available.`;
      } else {
        return `Back: ${format(dateFromItem, 'MMM d')}`;
      }
    }
    return null;
  }, [item.availabilityStatus, item.availableFromDate]);

  const renderDeliveryIcon = () => {
    if (!item.deliveryMethod) return null;
    switch (item.deliveryMethod) {
      case 'Pick Up':
        return <Package className="w-3 h-3 mr-1 text-primary" />;
      case 'Delivery':
        return <Truck className="w-3 h-3 mr-1 text-primary" />;
      case 'Both':
        return <ListChecks className="w-3 h-3 mr-1 text-primary" />;
      default:
        return null;
    }
  };

  return (
    <div className="group relative">
      <Card className="flex flex-col h-full overflow-hidden border-primary/5 bg-card hover:border-primary/20 transition-all duration-500 shadow-sm hover:shadow-2xl hover:-translate-y-2 rounded-[2rem]">
        <CardHeader className="p-0 relative">
          <Link href={`/items/${item.id}`} passHref>
            <div className="aspect-[4/3] overflow-hidden relative bg-muted/30">
              <Image
                src={item.imageUrl || `https://placehold.co/600x400.png`}
                alt={item.name}
                width={600}
                height={400}
                className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700 ease-out"
                data-ai-hint={`${item.category} ${item.name}`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
          </Link>

          <div className="absolute top-4 left-4 flex flex-col gap-2">
            <Badge className={cn(
              "shadow-lg backdrop-blur-md border-0 px-3 py-1 font-black uppercase text-[10px] tracking-widest",
              item.availabilityStatus === 'Available' ? "bg-primary text-white" : "bg-destructive text-destructive-foreground"
            )}>
              {item.availabilityStatus}
            </Badge>
          </div>

          {item.rating && (
            <div className="absolute top-4 right-4 glass shadow-lg rounded-full px-2.5 py-1 flex items-center gap-1.5 border-primary/10">
              <Star className="w-3.5 h-3.5 text-orange-400 fill-orange-400" />
              <span className="text-xs font-black text-foreground">{item.rating.toFixed(1)}</span>
            </div>
          )}
        </CardHeader>

        <CardContent className="p-6 flex-grow flex flex-col">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60">{item.category}</span>
            <div className="w-1 h-1 rounded-full bg-primary/20" />
            {item.location && (
              <div className="flex items-center text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                <MapPin className="w-2.5 h-2.5 mr-1" />
                {item.location}
              </div>
            )}
          </div>

          <CardTitle className="text-xl font-headline font-black mb-3 leading-tight group-hover:text-primary transition-colors">
            <Link href={`/items/${item.id}`}>
              {item.name}
            </Link>
          </CardTitle>

          <p className="text-sm text-muted-foreground/80 line-clamp-2 mb-6 leading-relaxed font-medium">
            {item.description}
          </p>

          <div className="mt-auto space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Price Rate</span>
                <div className="flex items-baseline text-primary">
                  <span className="text-xs font-bold mr-0.5">₱</span>
                  <span className="text-2xl font-black tracking-tight">{item.pricePerDay}</span>
                  <span className="text-[10px] font-bold text-muted-foreground ml-1 uppercase tracking-tighter">/ day</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {onEdit && (
                  <Button size="icon" variant="ghost" onClick={() => onEdit(item.id)} className="rounded-full h-10 w-10 hover:bg-primary/10">
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
                {onRemove && (
                  <Button size="icon" variant="ghost" onClick={() => onRemove(item.id)} className="rounded-full h-10 w-10 text-destructive hover:bg-destructive/10">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {availabilityMessage && (
              <div className="bg-primary/5 rounded-2xl p-3 flex items-center justify-between border border-primary/10">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-primary">
                  <CalendarClock className="h-3.5 w-3.5" />
                  {availabilityMessage}
                </div>
                <ChevronRight className="h-3 w-3 text-primary opacity-30" />
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="p-0 border-t border-primary/5">
          <Link href={`/items/${item.id}`} className="w-full flex items-center justify-center py-4 text-xs font-black uppercase tracking-[0.2em] text-foreground hover:bg-primary hover:text-white transition-all duration-300">
            Quick View <Eye className="ml-3 h-4 w-4" />
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
