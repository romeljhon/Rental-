
"use client";
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { AvailabilityCalendar } from '@/components/shared/AvailabilityCalendar';
import type { RentalItem, UserProfile } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { MapPin, Star, MessageSquare, CheckCircle, Tag, Users, CalendarDays, ChevronLeft, ChevronRight, Package, Truck, ListChecks, CalendarClock, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { DateRange } from 'react-day-picker';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { getActiveUserId, getActiveUserProfile } from '@/lib/auth';
import { useNotifications } from '@/contexts/NotificationContext'; // Added

interface ItemDetailViewProps {
  item: RentalItem;
}

export function ItemDetailView({ item }: ItemDetailViewProps) {
  const { toast } = useToast();
  const { addNotification } = useNotifications(); // Added
  const [activeUser, setActiveUser] = useState<UserProfile | null>(null); // To store full profile
  const [selectedRange, setSelectedRange] = useState<DateRange | undefined>(undefined);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [chosenDeliveryByRenter, setChosenDeliveryByRenter] = useState<'Pick Up' | 'Delivery' | null>(null);
  const [detailedAvailabilityMessage, setDetailedAvailabilityMessage] = useState<string | null>(null);
  const [activeUserId, setActiveUserIdState] = useState<string | null>(null); // Renamed to avoid conflict

  useEffect(() => {
    const id = getActiveUserId();
    setActiveUserIdState(id);
    setActiveUser(getActiveUserProfile());
  }, []);

  useEffect(() => {
    if (item.availabilityStatus === 'Rented' && item.availableFromDate) {
      const currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);
      const dateFromItem = new Date(item.availableFromDate);
      dateFromItem.setHours(0, 0, 0, 0);

      if (currentDate >= dateFromItem) {
        setDetailedAvailabilityMessage(`Expected back on ${format(dateFromItem, 'MMM d, yyyy')}. Availability pending owner confirmation.`);
      } else {
        setDetailedAvailabilityMessage(`Currently rented. Expected back on ${format(dateFromItem, 'MMM d, yyyy')}.`);
      }
    } else {
      setDetailedAvailabilityMessage(null);
    }
  }, [item.availabilityStatus, item.availableFromDate]);


  const allImages = [item.imageUrl, ...(item.images || [])].filter(Boolean) as string[];

  const handleDateSelect = (range: DateRange | undefined) => {
    setSelectedRange(range);
  };

  const handleRequestToRent = () => {
    if (!activeUser) {
        toast({ title: 'Error', description: 'Could not identify active user.', variant: 'destructive'});
        return;
    }
    if (!selectedRange || !selectedRange.from || !selectedRange.to) {
      toast({
        title: 'Select Dates',
        description: 'Please select a rental period before requesting.',
        variant: 'destructive',
      });
      return;
    }
    if (item.deliveryMethod === 'Both' && !chosenDeliveryByRenter) {
      toast({
        title: 'Select Delivery Method',
        description: 'Please choose a delivery or pick-up option.',
        variant: 'destructive',
      });
      return;
    }

    let requestDetails = `Your request for ${item.name} has been submitted.`;
    if (chosenDeliveryByRenter) {
      requestDetails += ` Chosen delivery: ${chosenDeliveryByRenter}.`;
    }

    // Add notification for the item owner
    addNotification({
        targetUserId: item.owner.id,
        eventType: 'new_request',
        title: 'New Rental Request!',
        message: `${activeUser.name} wants to rent your item: ${item.name}.`,
        link: `/requests`, // Link to owner's requests page
        relatedItemId: item.id,
        relatedUser: {id: activeUser.id, name: activeUser.name}
    });

    console.log('Rental requested for:', item.name, 'from', selectedRange.from, 'to', selectedRange.to, 'delivery:', chosenDeliveryByRenter || item.deliveryMethod);
    toast({
      title: 'Rental Requested (Mock)',
      description: requestDetails,
    });
  };
  
  const nextImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % allImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex - 1 + allImages.length) % allImages.length);
  };

  const renderDeliveryMethodInfo = () => {
    if (!item.deliveryMethod) return null;
    let icon, text;

    switch (item.deliveryMethod) {
      case 'Pick Up':
        icon = <Package className="w-4 h-4 mr-1.5 text-primary" />;
        text = "Pick Up Only";
        break;
      case 'Delivery':
        icon = <Truck className="w-4 h-4 mr-1.5 text-primary" />;
        text = "Delivery Only";
        break;
      case 'Both':
        icon = <ListChecks className="w-4 h-4 mr-1.5 text-primary" />;
        text = "Pick Up or Delivery";
        break;
      default:
        return null;
    }
    return <span className="flex items-center">{icon} {text}</span>;
  };

  const isOwnerViewing = activeUserId === item.owner.id;

  const isRequestButtonDisabled = 
    isOwnerViewing || 
    !selectedRange?.from || 
    !selectedRange?.to ||
    (item.availabilityStatus !== 'Available') ||
    (item.deliveryMethod === 'Both' && !chosenDeliveryByRenter);


  return (
    <div className="grid md:grid-cols-3 gap-8">
      <div className="md:col-span-2 space-y-6">
        <Card className="overflow-hidden shadow-xl">
          <CardHeader className="p-0 relative aspect-[16/10] bg-muted">
            {allImages.length > 0 ? (
              <>
              <Image
                src={allImages[currentImageIndex]}
                alt={item.name}
                layout="fill"
                objectFit="contain"
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
                <MapPin className="w-16 h-16 text-gray-300" /> 
              </div>
            )}
          </CardHeader>
        </Card>

        <Card className="shadow-xl">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-2">
              <CardTitle className="text-3xl font-headline mb-2 sm:mb-0">{item.name}</CardTitle>
              <div className="text-right self-start sm:self-center">
                <Badge variant={item.availabilityStatus === 'Available' ? 'default' : 'destructive'} className="text-sm capitalize py-1 px-3">
                  {item.availabilityStatus}
                </Badge>
                {item.availabilityStatus === 'Rented' && detailedAvailabilityMessage && (
                  <p className="text-xs text-muted-foreground mt-1 flex items-center justify-end gap-1">
                    <CalendarClock className="w-3.5 h-3.5" />
                    {detailedAvailabilityMessage}
                  </p>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground mb-3">
              <span className="flex items-center"><Tag className="w-4 h-4 mr-1.5 text-primary" /> {item.category}</span>
              {item.location && <span className="flex items-center"><MapPin className="w-4 h-4 mr-1.5 text-primary" /> {item.location}</span>}
              {item.rating && <span className="flex items-center"><Star className="w-4 h-4 mr-1.5 text-yellow-400 fill-yellow-400" /> {item.rating.toFixed(1)} ({item.reviewsCount} reviews)</span>}
              {renderDeliveryMethodInfo()}
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
          <CardContent className="flex items-center justify-between space-x-4">
            <Link href={`/users/${item.owner.id}`} passHref>
              <div className="flex items-center space-x-4 group cursor-pointer">
                <Image 
                  src={item.owner.avatarUrl || 'https://placehold.co/100x100.png'} 
                  alt={item.owner.name} 
                  width={60} 
                  height={60} 
                  className="rounded-full group-hover:ring-2 group-hover:ring-primary transition-all"
                  data-ai-hint="profile person" 
                />
                <div>
                  <p className="font-semibold text-lg group-hover:text-primary transition-colors">{item.owner.name}</p>
                  <p className="text-sm text-muted-foreground">Joined {new Date().getFullYear() -1}</p> 
                </div>
              </div>
            </Link>
            <Link href={`/messages?with=${item.owner.id}&contextItemId=${item.id}`} passHref>
              <Button variant="outline" size="sm" disabled={isOwnerViewing}>
                <MessageSquare className="w-4 h-4 mr-2" /> Contact Owner
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="md:col-span-1 space-y-6">
        <Card className="sticky top-20 shadow-xl"> 
          <CardHeader>
            <CardTitle className="font-headline text-2xl">Rent This Item</CardTitle>
            <div className="text-3xl font-bold text-primary flex items-center mt-1">
              <span className="mr-1">₱</span>
              {item.pricePerDay.toFixed(2)}
              <span className="text-sm text-muted-foreground font-normal ml-1">/ day</span>
            </div>
          </CardHeader>
          <CardContent>
            {isOwnerViewing ? (
              <div className="p-4 text-center bg-muted rounded-md">
                <Info className="w-6 h-6 mx-auto mb-2 text-primary" />
                <p className="font-semibold text-lg text-foreground">This is your item.</p>
                <p className="text-sm text-muted-foreground">You cannot rent an item you own.</p>
              </div>
            ) : item.availabilityStatus === 'Available' ? (
              <>
                <AvailabilityCalendar 
                  onDateSelect={handleDateSelect} 
                  pricePerDay={item.pricePerDay}
                />
                {item.deliveryMethod === 'Both' && (
                  <div className="mt-4 space-y-2">
                    <Label className="font-semibold">Choose Delivery Option:</Label>
                    <RadioGroup 
                      value={chosenDeliveryByRenter || ""} 
                      onValueChange={(value) => setChosenDeliveryByRenter(value as 'Pick Up' | 'Delivery')}
                      className="flex flex-col gap-2"
                    >
                      <Label htmlFor="delivery-pickup-choice" className="flex items-center space-x-2 p-3 border rounded-md hover:bg-muted cursor-pointer [&:has([data-state=checked])]:border-primary">
                        <RadioGroupItem value="Pick Up" id="delivery-pickup-choice" />
                        <Package className="w-5 h-5 text-primary" /> 
                        <span>Pick Up</span>
                      </Label>
                      <Label htmlFor="delivery-delivery-choice" className="flex items-center space-x-2 p-3 border rounded-md hover:bg-muted cursor-pointer [&:has([data-state=checked])]:border-primary">
                        <RadioGroupItem value="Delivery" id="delivery-delivery-choice" />
                        <Truck className="w-5 h-5 text-primary" />
                        <span>Delivery</span>
                      </Label>
                    </RadioGroup>
                  </div>
                )}
                <Button 
                  onClick={handleRequestToRent} 
                  className="w-full mt-6 bg-accent hover:bg-accent/90 text-accent-foreground" 
                  size="lg"
                  disabled={isRequestButtonDisabled}
                >
                  <CalendarDays className="w-5 h-5 mr-2" />
                  Request to Rent
                </Button>
              </>
            ) : (
              <div className="p-4 text-center bg-muted rounded-md">
                <p className="font-semibold text-lg text-destructive">
                  Currently {item.availabilityStatus}
                  {item.availabilityStatus === 'Rented' && detailedAvailabilityMessage && (
                    <span className="block text-sm text-muted-foreground font-normal mt-1">
                       {detailedAvailabilityMessage}
                    </span>
                  )}
                </p>
                {item.availabilityStatus !== 'Rented' && item.availabilityStatus !== 'Available' && (
                  <p className="text-sm text-muted-foreground">This item is not available for rent at the moment.</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
