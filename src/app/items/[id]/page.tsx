
import { ItemDetailView } from '@/components/items/ItemDetailView';
import type { RentalItem } from '@/types';
// import { notFound } from 'next/navigation'; // Keep if you want to use Next.js notFound for hard 404
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { getItemById as fetchItemById } from '@/lib/item-storage'; // Updated import

// This page remains a server component for fetching initial data.
// ItemDetailView can be a client component if it needs interactivity beyond props.

export default async function ItemDetailPage({ params }: { params: { id: string } }) {
  const item = await fetchItemById(params.id);

  if (!item) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center">
            <Alert variant="destructive" className="max-w-md">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Item Not Found</AlertTitle>
                <AlertDescription>
                The rental item you are looking for does not exist or may have been removed.
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
