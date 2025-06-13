
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ItemCard } from '@/components/items/ItemCard';
import type { RentalItem, UserProfile } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { UserCircle, PackageOpen, ArrowLeft, MessageSquare } from 'lucide-react';

const mockGlobalUsers: UserProfile[] = [
  { id: 'user1', name: 'John Doe', avatarUrl: 'https://placehold.co/120x120.png' },
  { id: 'user2', name: 'Jane Smith', avatarUrl: 'https://placehold.co/120x120.png' },
  { id: 'user3', name: 'Sam Wilson', avatarUrl: 'https://placehold.co/120x120.png' },
];

const mockGlobalItems: RentalItem[] = [
  { id: '1', name: 'Professional DSLR Camera', description: 'High-quality Canon DSLR, perfect for events and professional photography.', category: 'Electronics', pricePerDay: 50, imageUrl: 'https://placehold.co/600x400.png', availabilityStatus: 'Available', owner: mockGlobalUsers[0], location: 'New York, NY', rating: 4.8, reviewsCount: 25, features: ['24MP Sensor', '4K Video'], deliveryMethod: 'Pick Up' },
  { id: '2', name: 'Mountain Bike - Full Suspension', description: 'Explore trails with this durable full-suspension mountain bike.', category: 'Sports & Outdoors', pricePerDay: 35, imageUrl: 'https://placehold.co/600x400.png', availabilityStatus: 'Available', owner: mockGlobalUsers[0], location: 'Denver, CO', rating: 4.5, reviewsCount: 15, features: ['29-inch wheels', 'Hydraulic brakes'], deliveryMethod: 'Pick Up' },
  { id: '3', name: 'Vintage Leather Jacket', description: 'Stylish vintage leather jacket, medium size.', category: 'Apparel', pricePerDay: 20, imageUrl: 'https://placehold.co/600x400.png', availabilityStatus: 'Rented', owner: mockGlobalUsers[0], location: 'Los Angeles, CA', rating: 4.2, reviewsCount: 8, deliveryMethod: 'Delivery' },
  { id: 'j1', name: 'Portable Projector HD', description: 'Great for movie nights. Bright and clear picture.', category: 'Electronics', pricePerDay: 40, imageUrl: 'https://placehold.co/600x400.png', availabilityStatus: 'Available', owner: mockGlobalUsers[1], location: 'Chicago, IL', rating: 4.6, reviewsCount: 12, features: ['1080p Resolution', 'Built-in Speaker'], deliveryMethod: 'Pick Up' },
  { id: 'j2', name: 'Camping Tent for 4 People', description: 'Spacious and waterproof, ideal for family camping trips.', category: 'Sports & Outdoors', pricePerDay: 25, imageUrl: 'https://placehold.co/600x400.png', availabilityStatus: 'Available', owner: mockGlobalUsers[1], location: 'Chicago, IL', rating: 4.3, reviewsCount: 7, features: ['Sleeps 4', 'Waterproof', 'Easy Setup'], deliveryMethod: 'Delivery' },
  { id: 's1', name: 'Electric Guitar & Amp Set', description: 'Beginner friendly electric guitar with a small practice amplifier.', category: 'Musical Instruments', pricePerDay: 30, imageUrl: 'https://placehold.co/600x400.png', availabilityStatus: 'Available', owner: mockGlobalUsers[2], location: 'Austin, TX', rating: 4.0, reviewsCount: 5, features: ['Includes Cable', 'Practice Amp'], deliveryMethod: 'Pick Up' },
  { id: 's2', name: 'Professional 4K Drone', description: 'Capture stunning aerial footage with this 4K drone. Long flight time.', category: 'Electronics', pricePerDay: 70, imageUrl: 'https://placehold.co/600x400.png', availabilityStatus: 'Rented', owner: mockGlobalUsers[2], location: 'Austin, TX', rating: 4.9, reviewsCount: 10, deliveryMethod: 'Delivery' },
  { id: 'j3', name: 'Paddleboard (SUP)', description: 'Inflatable stand-up paddleboard, comes with pump and paddle.', category: 'Sports & Outdoors', pricePerDay: 30, imageUrl: 'https://placehold.co/600x400.png', availabilityStatus: 'Available', owner: mockGlobalUsers[1], location: 'Miami, FL', rating: 4.7, reviewsCount: 9, features: ['Inflatable', 'Carry Bag', 'Pump included'], deliveryMethod: 'Pick Up' },
];

async function getUserData(userId: string) {
  await new Promise(resolve => setTimeout(resolve, 200));
  const user = mockGlobalUsers.find(u => u.id === userId);
  if (!user) return null;

  const items = mockGlobalItems.filter(item => item.owner.id === userId && item.availabilityStatus === 'Available');
  return { user, items };
}

export default async function UserProfilePage({ params }: { params: { userId: string } }) {
  const userData = await getUserData(params.userId);

  if (!userData) {
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
              <CardTitle className="text-3xl font-headline text-primary mb-1">{user.name}</CardTitle>
              <p className="text-muted-foreground">Member since {new Date().getFullYear() - Math.floor(Math.random() * 3 + 1)}</p> 
              <p className="text-muted-foreground">{user.location || "Location not specified"}</p>
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
