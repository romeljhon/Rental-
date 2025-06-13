
"use client";

import React, { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import type { DateRange } from 'react-day-picker';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

interface AvailabilityCalendarProps {
  onDateSelect: (range: DateRange | undefined) => void;
  // In a real app, bookedDates would come from props/API
  bookedDates?: Date[]; 
  pricePerDay: number;
}

export function AvailabilityCalendar({ onDateSelect, bookedDates = [], pricePerDay }: AvailabilityCalendarProps) {
  const [range, setRange] = useState<DateRange | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  const handleSelect = (selectedRange: DateRange | undefined) => {
    setError(null);
    if (selectedRange?.from && selectedRange?.to) {
      // Basic check for booked dates within range (simplified)
      for (const bookedDate of bookedDates) {
        if (selectedRange.from <= bookedDate && bookedDate <= selectedRange.to) {
          setError("Selected range includes booked dates. Please choose different dates.");
          setRange(undefined); // Reset range
          onDateSelect(undefined);
          return;
        }
      }
    }
    setRange(selectedRange);
    onDateSelect(selectedRange);
  };

  const calculateTotalPrice = () => {
    if (range?.from && range?.to) {
      const diffTime = Math.abs(range.to.getTime() - range.from.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // Inclusive of start and end day
      return diffDays * pricePerDay;
    }
    return 0;
  };
  
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize today to start of day

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-xl">Check Availability</CardTitle>
        <CardDescription>Select your desired rental period.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Calendar
          mode="range"
          selected={range}
          onSelect={handleSelect}
          numberOfMonths={1} // Show 1 or 2 months based on preference/space
          disabled={(date) => 
            date < today || 
            (bookedDates ? bookedDates.some(bookedDate => format(bookedDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')) : false)
          }
          className="rounded-md border p-0 [&_td]:w-10 [&_td]:h-10 [&_th]:w-10" // Custom styling for compactness
        />
        {range?.from && (
          <div className="p-3 bg-secondary/50 rounded-md text-sm">
            <p className="font-medium">Selected Dates:</p>
            <p>
              From: {format(range.from, 'PPP')}
              {range.to && ` - To: ${format(range.to, 'PPP')}`}
            </p>
            {range.to && (
               <p className="font-semibold mt-2 text-primary">
                 Total Price: ₱{calculateTotalPrice().toFixed(2)}
               </p>
            )}
          </div>
        )}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive border border-destructive/20 rounded-md text-sm">
            <AlertTriangle className="h-5 w-5" />
            <p>{error}</p>
          </div>
        )}
        {!error && range?.from && range?.to && (
           <div className="flex items-center gap-2 p-3 bg-primary/10 text-primary border border-primary/20 rounded-md text-sm">
             <CheckCircle2 className="h-5 w-5" />
             <p>Dates available! Proceed to request.</p>
           </div>
        )}
      </CardContent>
    </Card>
  );
}
