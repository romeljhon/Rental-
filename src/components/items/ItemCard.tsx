
import Image from 'next/image';
import Link from 'next/link';
import { DollarSign, MapPin, Tag, Star, Eye, Edit, Trash2 } from 'lucide-react';
import type { RentalItem } from '@/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ItemCardProps {
  item: RentalItem;
  onEdit?: (itemId: string) => void;
  onRemove?: (itemId: string) => void;
}

export function ItemCard({ item, onEdit, onRemove }: ItemCardProps) {
  return (
    <Card className="flex flex-col h-full overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-lg">
      <CardHeader className="p-0 relative">
        <Link href={`/items/${item.id}`} passHref>
          <div className="aspect-video overflow-hidden">
            <Image
              src={item.imageUrl || `https://placehold.co/600x400.png`}
              alt={item.name}
              width={600}
              height={400}
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
              data-ai-hint={`${item.category} ${item.name}`}
            />
          </div>
        </Link>
        {item.rating && (
          <Badge variant="secondary" className="absolute top-2 right-2 flex items-center gap-1 bg-background/80 backdrop-blur-sm">
            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
            {item.rating.toFixed(1)}
          </Badge>
        )}
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <div className="flex items-center justify-between mb-1">
          <Badge variant="outline" className="text-xs">{item.category}</Badge>
           <Badge variant={item.availabilityStatus === 'Available' ? 'default' : 'destructive'} className="capitalize bg-opacity-80">
            {item.availabilityStatus}
          </Badge>
        </div>
        <CardTitle className="text-lg font-headline mb-1 leading-tight">
          <Link href={`/items/${item.id}`} className="hover:text-primary transition-colors">
            {item.name}
          </Link>
        </CardTitle>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-2 h-10">{item.description}</p>
        
        {item.location && (
          <div className="flex items-center text-xs text-muted-foreground mb-1">
            <MapPin className="w-3 h-3 mr-1.5" />
            {item.location}
          </div>
        )}
      </CardContent>
      <CardFooter className="p-4 flex items-center justify-between border-t">
        <div className="flex items-center font-semibold text-primary">
          <DollarSign className="w-4 h-4 mr-1" />
          {item.pricePerDay} <span className="text-xs text-muted-foreground ml-1">/ day</span>
        </div>
        <div className="flex items-center gap-1">
          <Link href={`/items/${item.id}`} passHref>
            <Button size="sm" variant="outline" className="group" aria-label={`View details for ${item.name}`}>
              <Eye className="w-4 h-4 sm:mr-2" /> <span className="hidden sm:inline">View</span>
            </Button>
          </Link>
          {onEdit && (
            <Button 
              size="icon" 
              variant="ghost" 
              onClick={() => onEdit(item.id)} 
              aria-label={`Edit ${item.name}`}
              className="h-9 w-9 hover:bg-secondary/80"
            >
              <Edit className="w-4 h-4" />
            </Button>
          )}
          {onRemove && (
            <Button 
              size="icon" 
              variant="ghost" 
              onClick={() => onRemove(item.id)} 
              aria-label={`Remove ${item.name}`}
              className="h-9 w-9 text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
