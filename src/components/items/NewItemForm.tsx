
"use client";

import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Loader2, UploadCloud, Smartphone, Car, Home, Wrench, Shirt, Bike, Package } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateListingDescription, type GenerateListingDescriptionInput } from '@/ai/flows/generate-listing-description';
import type { RentalCategory, RentalItem } from '@/types';

const categories: RentalCategory[] = [
  { id: 'electronics', name: 'Electronics', icon: Smartphone },
  { id: 'vehicles', name: 'Vehicles', icon: Car },
  { id: 'property', name: 'Property', icon: Home },
  { id: 'tools', name: 'Tools', icon: Wrench },
  { id: 'apparel', name: 'Apparel', icon: Shirt },
  { id: 'sports', name: 'Sports & Outdoors', icon: Bike },
  { id: 'other', name: 'Other', icon: Package },
];

const formSchema = z.object({
  itemName: z.string().min(3, { message: 'Item name must be at least 3 characters long.' }),
  category: z.string().min(1, { message: 'Please select a category.' }),
  aiKeywords: z.string().optional(),
  aiDetails: z.string().optional(),
  description: z.string().min(10, { message: 'Description must be at least 10 characters long.' }),
  pricePerDay: z.coerce.number().min(0.01, { message: 'Price must be a positive number.' }),
  images: z.any().optional(), 
});

type NewItemFormValues = z.infer<typeof formSchema>;

interface NewItemFormProps {
  initialData?: RentalItem; 
}

async function handleGenerateAIDescription(data: GenerateListingDescriptionInput) {
  try {
    const result = await generateListingDescription(data);
    return { success: true, description: result.description };
  } catch (error) {
    console.error("Error generating description with AI:", error);
    return { success: false, error: (error instanceof Error ? error.message : String(error)) };
  }
}


export function NewItemForm({ initialData }: NewItemFormProps) {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  
  const isEditMode = !!initialData;

  const defaultValues = {
    itemName: initialData?.name || '',
    category: categories.find(c => c.name === initialData?.category)?.id || '',
    aiKeywords: '',
    aiDetails: '',
    description: initialData?.description || '',
    pricePerDay: initialData?.pricePerDay || 0,
  };

  const form = useForm<NewItemFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues,
  });

  // Reset form if initialData changes (e.g. navigating between edit pages)
  useEffect(() => {
    if (initialData) {
      form.reset({
        itemName: initialData.name || '',
        category: categories.find(c => c.name === initialData.category)?.id || '',
        description: initialData.description || '',
        pricePerDay: initialData.pricePerDay || 0,
        aiKeywords: '', // AI fields are not pre-filled for edit in this iteration
        aiDetails: '',
        // images: undefined // Images are not pre-filled for edit in this iteration
      });
      // Pre-fill image previews if initialData.imageUrl exists (primary only for now)
      if (initialData.imageUrl) {
        setImagePreviews([initialData.imageUrl]);
      } else {
        setImagePreviews([]);
      }
    } else {
      form.reset(defaultValues); // Reset to empty if no initialData (new item form)
      setImagePreviews([]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData, form.reset]);


  const { control, handleSubmit, setValue, watch, formState: { errors } } = form;
  const watchedAiKeywords = watch('aiKeywords');
  const watchedAiDetails = watch('aiDetails');

  const onAIDescriptionGenerate = async () => {
    if (!watchedAiKeywords && !watchedAiDetails) {
      toast({
        title: 'Input Required',
        description: 'Please provide some keywords or details for the AI.',
        variant: 'destructive',
      });
      return;
    }
    setIsGenerating(true);
    const result = await handleGenerateAIDescription({
      keywords: watchedAiKeywords || '',
      details: watchedAiDetails || '',
    });
    setIsGenerating(false);

    if (result.success && result.description) {
      setValue('description', result.description, { shouldValidate: true });
      toast({
        title: 'Description Generated!',
        description: 'AI has crafted a description for your item.',
      });
    } else {
      toast({
        title: 'Error Generating Description',
        description: result.error || 'An unknown error occurred.',
        variant: 'destructive',
      });
    }
  };

  const onSubmit = (data: NewItemFormValues) => {
    console.log('Form submitted:', data);
    if (isEditMode) {
      toast({
        title: 'Item Updated (Mock)!',
        description: `${data.itemName} has been successfully updated.`,
      });
    } else {
      toast({
        title: 'Item Listed (Mock)!',
        description: `${data.itemName} has been successfully listed.`,
      });
    }
    // In a real app, you might redirect or clear form differently for edit vs new
    if (!isEditMode) {
      form.reset();
      setImagePreviews([]);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newPreviews = Array.from(files).map(file => URL.createObjectURL(file));
      // For edit mode, you might want to replace or add to existing images.
      // For now, it will replace previews if new files are selected.
      setImagePreviews(newPreviews.slice(0, 5));
      // form.setValue('images', files); // Actual file handling
    }
  };

  return (
    <Card className="max-w-2xl mx-auto shadow-xl">
      <CardHeader>
        <CardTitle className="text-3xl font-headline text-primary">
          {isEditMode ? `Edit Item: ${initialData?.name}` : 'List Your Item'}
        </CardTitle>
        <CardDescription>
          {isEditMode ? 'Update the details for your item.' : 'Fill in the details below to rent out your item. Use our AI assistant to help craft the perfect description!'}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="itemName">Item Name</Label>
            <Input id="itemName" {...form.register('itemName')} placeholder="e.g., Canon EOS R5 Camera" />
            {errors.itemName && <p className="text-sm text-destructive">{errors.itemName.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Controller
              name="category"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>
                        <div className="flex items-center">
                          <cat.icon className="w-4 h-4 mr-2 text-muted-foreground" />
                          {cat.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.category && <p className="text-sm text-destructive">{errors.category.message}</p>}
          </div>

          {!isEditMode && ( // AI Assistant only for new items for now
            <Card className="bg-secondary/50 p-4">
              <CardHeader className="p-0 mb-2">
                <CardTitle className="text-lg flex items-center gap-2 font-headline"><Sparkles className="w-5 h-5 text-accent" />AI Listing Assistant</CardTitle>
                <CardDescription className="text-xs">Provide some keywords and details, and let AI write a compelling description.</CardDescription>
              </CardHeader>
              <CardContent className="p-0 space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="aiKeywords">Keywords for AI</Label>
                  <Input id="aiKeywords" {...form.register('aiKeywords')} placeholder="e.g., durable, lightweight, 4K video, beginner-friendly" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="aiDetails">Specific Details for AI</Label>
                  <Textarea id="aiDetails" {...form.register('aiDetails')} placeholder="e.g., Barely used, comes with original packaging and all accessories. Small scratch on the side (see photos)." rows={3}/>
                </div>
                <Button type="button" onClick={onAIDescriptionGenerate} disabled={isGenerating} variant="outline" className="w-full sm:w-auto">
                  {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                  Generate Description
                </Button>
              </CardContent>
            </Card>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" {...form.register('description')} placeholder="Describe your item in detail..." rows={5}/>
            {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="pricePerDay">Price Per Day ($)</Label>
            <Input id="pricePerDay" type="number" step="0.01" {...form.register('pricePerDay')} placeholder="e.g., 25.00" />
            {errors.pricePerDay && <p className="text-sm text-destructive">{errors.pricePerDay.message}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="images">Upload Images (Max 5)</Label>
            <div className="flex items-center justify-center w-full">
                <label htmlFor="images-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <UploadCloud className="w-8 h-8 mb-2 text-muted-foreground" />
                        <p className="mb-1 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                        <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 10MB</p>
                    </div>
                    <Input id="images-upload" type="file" className="hidden" multiple accept="image/*" onChange={handleImageUpload} />
                </label>
            </div>
            {imagePreviews.length > 0 && (
              <div className="mt-2 grid grid-cols-3 sm:grid-cols-5 gap-2">
                {imagePreviews.map((src, index) => (
                  <div key={index} className="relative aspect-square rounded-md overflow-hidden border">
                    <img src={src} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
            {errors.images && <p className="text-sm text-destructive">{(errors.images as any).message}</p>}
          </div>

        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" size="lg">
            {isEditMode ? 'Update Item' : 'List My Item'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

