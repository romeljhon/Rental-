
"use client";
import { NewItemForm } from '@/components/items/NewItemForm';
import type { RentalItem, UserProfile } from '@/types';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Loader2 } from "lucide-react";
import { useParams } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { authService, itemsService } from '@/services';

export default function EditItemPage() {
  const params = useParams();
  const id = params.id as string;
  const [item, setItem] = useState<RentalItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeUser, setActiveUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    const userProfile = authService.getCurrentUser();
    setActiveUser(userProfile);
  }, []);

  useEffect(() => {
    if (id && activeUser) {
      const fetchItemForEditing = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const fetchedItem = await itemsService.getById(id);
          if (fetchedItem) {
            if (fetchedItem.owner.id === activeUser.id) {
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
      fetchItemForEditing();
    } else if (!id) {
      setIsLoading(false);
      setError("Item ID is missing.");
    }
    // If activeUser is not yet loaded, or id is missing, appropriate states are set.
  }, [id, activeUser]);

  if (isLoading || !activeUser) { // Wait for activeUser and item loading
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
          <AlertTitle>{error === "Item not found." ? "Item Not Found" : "Access Denied"}</AlertTitle>
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!item) { // Should be covered by error state if not found, but good fallback.
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center">
        <Alert variant="destructive" className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Item Not Found</AlertTitle>
          <AlertDescription>
            Could not load item details for editing. It might have been removed.
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
