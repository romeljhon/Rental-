
"use client"; // Make this a Client Component

import React, { useState, useEffect } from 'react';
import { ItemDetailView } from '@/components/items/ItemDetailView';
import type { RentalItem } from '@/types';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Loader2 } from "lucide-react";
import { itemsService } from '@/services';
import { useParams } from 'next/navigation';

export default function ItemDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [item, setItem] = useState<RentalItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      const loadItem = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const fetchedItem = await itemsService.getById(id);
          if (fetchedItem) {
            setItem(fetchedItem);
          } else {
            setError("Item not found.");
          }
        } catch (e) {
          console.error("Failed to fetch item:", e);
          setError("Failed to load item data.");
        } finally {
          setIsLoading(false);
        }
      };
      loadItem();
    } else {
      setError("Item ID is missing.");
      setIsLoading(false);
    }
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg text-muted-foreground">Loading item details...</p>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center">
        <Alert variant="destructive" className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>{error === "Item not found." || !item ? "Item Not Found" : "Error"}</AlertTitle>
          <AlertDescription>
            {error || "The rental item you are looking for does not exist or may have been removed."}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div>
      <ItemDetailView item={item} />
    </div>
  );
}
