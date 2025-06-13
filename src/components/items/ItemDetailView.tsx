
"use client";
import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { AvailabilityCalendar } from '@/components/shared/AvailabilityCalendar';
import type { RentalItem, UserProfile } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, MapPin, Star, MessageSquare, CheckCircle, Tag, Users, CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { DateRange } from 'react-day-picker';
import { Separator } from '@/components/ui/separator';

interface ItemDetailViewProps {
  item: RentalItem;
}

export function ItemDetailView({ item }: ItemDetailViewProps) {
  const { toast } = useToast();
  const [selectedRange, setSelectedRange] = useState<DateRange | undefined>(undefined);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const allImages = [item.imageUrl, ...(item.images || [])].filter(Boolean) as string[];

  const handleDateSelect = (range: DateRange | undefined) => {
    setSelectedRange(range);
  };

  const handleRequestToRent = () => {
    if (!selectedRange || !selectedRange.from || !selectedRange.to) {
      toast({
        title: 'Select Dates',
        description: 'Please select a rental period before requesting.',
        variant: 'destructive',
      });
      return;
    }
    // Mock request logic
    console.log('Rental requested for:', item.name, 'from', selectedRange.from, 'to', selectedRange.to);
    toast({
      title: 'Rental Requested (Mock)',
      description: `Your request for ${item.name} has been submitted.`,
    });
  };
  
  const nextImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % allImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex - 1 + allImages.length) % allImages.length);
  };


  return (
    <div className="grid md:grid-cols-3 gap-8">
      {/* Image Gallery and Details */}
      <div className="md:col-span-2 space-y-6">
        <Card className="overflow-hidden shadow-xl">
          <CardHeader className="p-0 relative aspect-[16/10] bg-muted">
            {allImages.length > 0 ? (
              <>
              <Image
                src={allImages[currentImageIndex]}
                alt={item.name}
                layout="fill"
                objectFit="contain" // 'cover' or 'contain'
                className="transition-opacity duration-300"
                data-ai-hint={`${item.category} ${item.name} detail view`}
              />
              {allImages.length > 1 && (
                <>
                  <Button variant="ghost" size="icon" className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white" onClick={prevImage}>
                    <ChevronLeft className="h-6 w-6" />
                  </Button>
                  <Button variant="ghost" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white" onClick={nextImage}>
                    <ChevronRight className="h-6 w-6" />
                  </Button>
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-1.5">
                    {allImages.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`h-2 w-2 rounded-full ${index === currentImageIndex ? 'bg-primary' : 'bg-gray-300 hover:bg-gray-400'
                          } transition-colors`}
                        aria-label={`View image ${index + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <MapPin className="w-16 h-16 text-gray-300" /> {/* Placeholder icon */}
              </div>
            )}
          </CardHeader>
        </Card>

        <Card className="shadow-xl">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
              <CardTitle className="text-3xl font-headline mb-2 sm:mb-0">{item.name}</CardTitle>
              <Badge variant={item.availabilityStatus === 'Available' ? 'default' : 'destructive'} className="text-sm capitalize py-1 px-3 self-start sm:self-center">
                {item.availabilityStatus}
              </Badge>
            </div>
            <div className="flex flex-wrap gap-2 text-sm text-muted-foreground mb-3">
              <span className="flex items-center"><Tag className="w-4 h-4 mr-1.5 text-primary" /> {item.category}</span>
              {item.location && <span className="flex items-center"><MapPin className="w-4 h-4 mr-1.5 text-primary" /> {item.location}</span>}
              {item.rating && <span className="flex items-center"><Star className="w-4 h-4 mr-1.5 text-yellow-400 fill-yellow-400" /> {item.rating.toFixed(1)} ({item.reviewsCount} reviews)</span>}
            </div>
             <Separator className="my-3"/>
            <CardDescription className="text-base leading-relaxed whitespace-pre-line">{item.description}</CardDescription>
          </CardHeader>
          
          {item.features && item.features.length > 0 && (
            <CardContent>
              <h3 className="text-lg font-semibold mb-2 font-headline">Features</h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 list-none pl-0">
                {item.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-sm text-foreground">
                    <CheckCircle className="w-4 h-4 mr-2 text-primary flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
          )}
        </Card>
        
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="font-headline text-xl">About the Owner</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center space-x-4">
            <Image 
              src={item.owner.avatarUrl || 'https://placehold.co/100x100.png'} 
              alt={item.owner.name} 
              width={60} 
              height={60} 
              className="rounded-full"
              data-ai-hint="profile person" 
            />
            <div>
              <p className="font-semibold text-lg">{item.owner.name}</p>
              <p className="text-sm text-muted-foreground">Joined {new Date().getFullYear() -1} {/* Mock join date */}</p> 
            </div>
            <Link href="/messages" passHref className="ml-auto">
              <Button variant="outline" size="sm">
                <MessageSquare className="w-4 h-4 mr-2" /> Contact Owner
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Booking Section */}
      <div className="md:col-span-1 space-y-6">
        <Card className="sticky top-20 shadow-xl"> {/* Sticky for booking panel */}
          <CardHeader>
            <CardTitle className="font-headline text-2xl">Rent This Item</CardTitle>
            <div className="text-3xl font-bold text-primary flex items-center mt-1">
              <DollarSign className="w-7 h-7 mr-1" />
              {item.pricePerDay.toFixed(2)}
              <span className="text-sm text-muted-foreground font-normal ml-1">/ day</span>
            </div>
          </CardHeader>
          <CardContent>
            {item.availabilityStatus === 'Available' ? (
              <>
                <AvailabilityCalendar 
                  onDateSelect={handleDateSelect} 
                  pricePerDay={item.pricePerDay}
                  // bookedDates={[new Date(2024, 6, 20), new Date(2024, 6, 21)]} // Example booked dates
                />
                <Button 
                  onClick={handleRequestToRent} 
                  className="w-full mt-6 bg-accent hover:bg-accent/90 text-accent-foreground" 
                  size="lg"
                  disabled={!selectedRange?.from || !selectedRange?.to}
                >
                  <CalendarDays className="w-5 h-5 mr-2" />
                  Request to Rent
                </Button>
              </>
            ) : (
              <div className="p-4 text-center bg-muted rounded-md">
                <p className="font-semibold text-lg text-destructive">Currently Unavailable</p>
                <p className="text-sm text-muted-foreground">This item is not available for rent at the moment.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
