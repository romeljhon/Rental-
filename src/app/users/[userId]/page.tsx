
import Image from 'next/image';
import Link from 'next/link';
// import { notFound } from 'next/navigation'; // Keep if using Next.js notFound
import { ItemCard } from '@/components/items/ItemCard';
import type { RentalItem, UserProfile } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { UserCircle, PackageOpen, ArrowLeft, MessageSquare } from 'lucide-react';
import { getAllItems } from '@/lib/item-storage'; // Updated import
import { ALL_MOCK_USERS } from '@/lib/auth'; // To find user profile by ID

// This page remains a server component

async function getUserData(userId: string) {
  // Simulate fetching user profile
  const user = ALL_MOCK_USERS.find(u => u.id === userId);
  if (!user) return null;

  // Fetch all items and then filter
  const allItems = await getAllItems();
  const items = allItems.filter(item => item.owner.id === userId && item.availabilityStatus === 'Available');
  return { user, items };
}

export default async function UserProfilePage({ params }: { params: { userId:string } }) {
  const userData = await getUserData(params.userId);

  if (!userData || !userData.user) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center">
            <Alert variant="destructive" className="max-w-md">
                <UserCircle className="h-4 w-4" />
                <AlertTitle>User Not Found</AlertTitle>
                <AlertDescription>
                The user profile you are looking for does not exist.
                </AlertDescription>
            </Alert>
            <Button asChild variant="outline" className="mt-6">
              <Link href="/"><ArrowLeft className="mr-2 h-4 w-4" />Back to Home</Link>
            </Button>
        </div>
    );
  }

  const { user, items } = userData;

  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            <Image
              src={user.avatarUrl || 'https://placehold.co/120x120.png'}
              alt={user.name}
              width={100}
              height={100}
              className="rounded-full border-4 border-primary/50 shadow-md"
              data-ai-hint="profile person large"
            />
            <div>
              <CardTitle className="text-3xl font-headline text-primary mb-1">{user.name.split('(')[0].trim()}</CardTitle>
              <p className="text-muted-foreground">Member since {new Date().getFullYear() - Math.floor(Math.random() * 3 + 1)}</p> 
              {/* <p className="text-muted-foreground">{user.location || "Location not specified"}</p> */}
            </div>
            <Button asChild variant="outline" className="mt-4 sm:mt-0 sm:ml-auto">
              <Link href={`/messages?with=${user.id}`}><MessageSquare className="mr-2 h-4 w-4" />Contact {user.name.split(' ')[0]}</Link>
            </Button>
          </div>
        </CardHeader>
      </Card>
      
      <section>
        <h2 className="text-2xl font-bold font-headline mb-6 text-foreground">
          Items for Rent by {user.name.split(' ')[0]}
        </h2>
        {items.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((item) => (
              <ItemCard key={item.id} item={item} /> 
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border-2 border-dashed border-muted rounded-lg">
            <PackageOpen className="mx-auto h-16 w-16 text-muted-foreground opacity-50 mb-4" />
            <h3 className="text-xl font-semibold text-muted-foreground mb-2">No Available Items</h3>
            <p className="text-foreground">{user.name.split(' ')[0]} doesn't have any items currently available for rent.</p>
          </div>
        )}
      </section>
       <div className="mt-8 text-center">
        <Button asChild variant="outline">
          <Link href="/"><ArrowLeft className="mr-2 h-4 w-4" />Back to All Listings</Link>
        </Button>
      </div>
    </div>
  );
}
