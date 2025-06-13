
"use client"; 
import { NewItemForm } from '@/components/items/NewItemForm';
import type { RentalItem, UserProfile } from '@/types';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Loader2 } from "lucide-react";
import { useParams } from 'next/navigation';
import React, { useState, useEffect } from 'react';

const mockUser: UserProfile = { id: 'user1', name: 'John Doe', avatarUrl: 'https://placehold.co/100x100.png' };

const getFutureDate = (days: number): Date => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
};

const mockItems: RentalItem[] = [
  { id: '1', name: 'Professional DSLR Camera', description: 'High-quality Canon DSLR, perfect for events and professional photography. Comes with two lenses: a versatile 18-55mm for general use and a 50mm f/1.8 prime lens for stunning portraits with beautiful bokeh. Features a 24MP APS-C sensor, 4K video recording capabilities, and a user-friendly interface suitable for both beginners and experienced photographers. Battery life allows for approximately 500 shots. Includes camera body, two lenses, battery, charger, and carrying case.', category: 'Electronics', pricePerDay: 50, imageUrl: 'https://placehold.co/800x500.png', images: ['https://placehold.co/800x500.png', 'https://placehold.co/800x500.png'], availabilityStatus: 'Available', owner: mockUser, location: 'New York, NY', rating: 4.8, reviewsCount: 25, features: ['24MP Sensor', '4K Video', '18-55mm Lens', '50mm f/1.8 Lens', 'Carry Bag Included'], deliveryMethod: 'Pick Up' },
  { id: '2', name: 'Mountain Bike - Full Suspension', description: 'Explore challenging trails with this durable full-suspension mountain bike. It features a lightweight aluminum frame, 29-inch wheels for smooth rolling over obstacles, and hydraulic disc brakes for reliable stopping power in all conditions. The 12-speed drivetrain offers a wide range of gears for climbing and descending. Suitable for intermediate to advanced riders.', category: 'Sports & Outdoors', pricePerDay: 35, imageUrl: 'https://placehold.co/800x500.png', availabilityStatus: 'Available', owner: mockUser, location: 'Denver, CO', rating: 4.5, reviewsCount: 15, features: ['29-inch wheels', 'Hydraulic disc brakes', '12-speed drivetrain', 'Aluminum frame', 'Helmet included'], deliveryMethod: 'Delivery' },
  { id: '3', name: 'Vintage Leather Jacket', description: 'Authentic vintage leather jacket from the 1980s. Men\'s medium size. Classic biker style with a comfortable inner lining. Shows some signs of wear, adding to its character. Perfect for themed parties or a stylish everyday look.', category: 'Apparel', pricePerDay: 20, imageUrl: 'https://placehold.co/800x500.png', availabilityStatus: 'Rented', availableFromDate: getFutureDate(7), owner: mockUser, location: 'Los Angeles, CA', rating: 4.2, reviewsCount: 8, features: ['Genuine Leather', 'Men\'s Medium', 'Biker Style'], deliveryMethod: 'Both' },
  { id: '4', name: 'Portable Bluetooth Speaker', description: 'Loud and clear portable speaker with 12-hour battery life. Waterproof.', category: 'Electronics', pricePerDay: 15, imageUrl: 'https://placehold.co/600x400.png', availabilityStatus: 'Available', owner: mockUser, location: 'Chicago, IL', rating: 4.9, reviewsCount: 42, deliveryMethod: 'Delivery' },
];

async function getItemById(id: string): Promise<RentalItem | null> {
  await new Promise(resolve => setTimeout(resolve, 300)); 
  const item = mockItems.find(item => item.id === id);
  return item || null;
}

export default function EditItemPage() {
  const params = useParams();
  const id = params.id as string;
  const [item, setItem] = useState<RentalItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      const fetchItem = async () => {
        setIsLoading(true);
        try {
          const fetchedItem = await getItemById(id);
          if (fetchedItem) {
            if (fetchedItem.owner.id === mockUser.id) {
              setItem(fetchedItem);
            } else {
              setError("You are not authorized to edit this item.");
            }
          } else {
            setError("Item not found.");
          }
        } catch (e) {
          console.error("Failed to fetch item for editing:", e);
          setError("Failed to load item data.");
        } finally {
          setIsLoading(false);
        }
      };
      fetchItem();
    } else {
      setIsLoading(false);
      setError("Item ID is missing.");
    }
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg text-muted-foreground">Loading item for editing...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center">
        <Alert variant="destructive" className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>{error === "Item not found." ? "Item Not Found" : "Error"}</AlertTitle>
          <AlertDescription>
            {error === "Item not found."
              ? "The rental item you are trying to edit does not exist or may have been removed."
              : error}
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  if (!item) { 
    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center">
            <Alert variant="destructive" className="max-w-md">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Item Not Found</AlertTitle>
                <AlertDescription>
                Could not load item details for editing.
                </AlertDescription>
            </Alert>
        </div>
    );
  }

  return (
    <div>
      <NewItemForm initialData={item} />
    </div>
  );
}
