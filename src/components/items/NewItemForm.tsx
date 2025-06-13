
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Loader2, UploadCloud, Smartphone, Car, Home, Wrench, Shirt, Bike, Package, Truck, ListChecks } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateListingDescription, type GenerateListingDescriptionInput } from '@/ai/flows/generate-listing-description';
import type { RentalCategory, RentalItem, UserProfile } from '@/types';
import { addItem, updateItem } from '@/lib/item-storage'; // Updated import
import { getActiveUserProfile } from '@/lib/auth';

const categories: RentalCategory[] = [
  { id: 'electronics', name: 'Electronics', icon: Smartphone },
  { id: 'vehicles', name: 'Vehicles', icon: Car },
  { id: 'property', name: 'Property', icon: Home },
  { id: 'tools', name: 'Tools', icon: Wrench },
  { id: 'apparel', name: 'Apparel', icon: Shirt },
  { id: 'sports', name: 'Sports & Outdoors', icon: Bike },
  { id: 'other', name: 'Other', icon: Package },
];

const deliveryMethods = [
  { id: 'pick-up', value: 'Pick Up', label: 'Pick Up Only', icon: Package },
  { id: 'delivery', value: 'Delivery Only', label: 'Delivery Only', icon: Truck },
  { id: 'both', value: 'Both', label: 'Pick Up & Delivery', icon: ListChecks },
] as const;

type DeliveryMethodValue = typeof deliveryMethods[number]['value'];

const formSchema = z.object({
  itemName: z.string().min(3, { message: 'Item name must be at least 3 characters long.' }),
  category: z.string().min(1, { message: 'Please select a category.' }),
  aiKeywords: z.string().optional(),
  aiDetails: z.string().optional(),
  description: z.string().min(10, { message: 'Description must be at least 10 characters long.' }),
  pricePerDay: z.coerce.number().min(0.01, { message: 'Price must be a positive number.' }),
  deliveryMethod: z.enum(['Pick Up', 'Delivery', 'Both'], { required_error: 'Please select a delivery method.' }),
  images: z.any().optional(), 
  features: z.string().optional(), // Added features field
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreviews, setImagePreviews] = useState<string[]>(initialData?.images || (initialData?.imageUrl ? [initialData.imageUrl] : []));
  
  const isEditMode = !!initialData;

  const defaultValues: NewItemFormValues = {
    itemName: initialData?.name || '',
    category: categories.find(c => c.name === initialData?.category)?.id || '',
    aiKeywords: '',
    aiDetails: '',
    description: initialData?.description || '',
    pricePerDay: initialData?.pricePerDay || 0,
    deliveryMethod: initialData?.deliveryMethod || 'Pick Up',
    features: initialData?.features?.join(', ') || '',
  };

  const form = useForm<NewItemFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues,
  });
  
  useEffect(() => {
    if (initialData) {
      form.reset({
        itemName: initialData.name || '',
        category: categories.find(c => c.name === initialData.category)?.id || '',
        description: initialData.description || '',
        pricePerDay: initialData.pricePerDay || 0,
        deliveryMethod: initialData.deliveryMethod as DeliveryMethodValue || 'Pick Up',
        aiKeywords: '', 
        aiDetails: '',
        features: initialData.features?.join(', ') || '',
      });
      setImagePreviews(initialData.images || (initialData.imageUrl ? [initialData.imageUrl] : []));
    } else {
      form.reset(defaultValues); 
      setImagePreviews([]);
    }
  }, [initialData, form]);


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

  const onSubmit = async (data: NewItemFormValues) => {
    setIsSubmitting(true);
    const activeUser = getActiveUserProfile();
    if (!activeUser) {
        toast({ title: 'Error', description: 'Could not identify active user. Please try again.', variant: 'destructive'});
        setIsSubmitting(false);
        return;
    }

    const itemCategoryName = categories.find(c => c.id === data.category)?.name || 'Other';
    const itemFeatures = data.features ? data.features.split(',').map(f => f.trim()).filter(f => f) : [];

    try {
      if (isEditMode && initialData) {
        const updatedItemData: RentalItem = {
          ...initialData,
          name: data.itemName,
          category: itemCategoryName,
          description: data.description,
          pricePerDay: data.pricePerDay,
          deliveryMethod: data.deliveryMethod,
          features: itemFeatures,
          imageUrl: imagePreviews.length > 0 ? imagePreviews[0] : initialData.imageUrl, // Keep original if no new image
          images: imagePreviews.length > 0 ? imagePreviews : initialData.images,
        };
        await updateItem(updatedItemData);
        toast({
          title: 'Item Updated!',
          description: `${data.itemName} has been successfully updated.`,
        });
      } else {
        const newItemPayload = {
          name: data.itemName,
          category: itemCategoryName,
          description: data.description,
          pricePerDay: data.pricePerDay,
          deliveryMethod: data.deliveryMethod,
          features: itemFeatures,
          imageUrl: imagePreviews.length > 0 ? imagePreviews[0] : `https://placehold.co/600x400.png?text=${encodeURIComponent(data.itemName)}`,
          images: imagePreviews,
        };
        await addItem(newItemPayload);
        toast({
          title: 'Item Listed!',
          description: `${data.itemName} has been successfully listed.`,
        });
        form.reset(defaultValues); // Reset to defaults for new item, not edit mode defaults
        setImagePreviews([]);
      }
    } catch (error) {
        console.error("Error submitting item:", error);
        toast({
            title: 'Submission Error',
            description: `Failed to ${isEditMode ? 'update' : 'list'} item. ` + (error instanceof Error ? error.message : String(error)),
            variant: 'destructive',
        });
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newPreviewsArray = Array.from(files).map(file => URL.createObjectURL(file));
      // If editing, replace. If new, add. For simplicity, just replace/set.
      setImagePreviews(newPreviewsArray.slice(0, 5)); 
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
            <Input id="itemName" {...form.register('itemName')} placeholder="e.g., Canon EOS R5 Camera" disabled={isSubmitting} />
            {errors.itemName && <p className="text-sm text-destructive">{errors.itemName.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Controller
              name="category"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value} disabled={isSubmitting}>
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

          {!isEditMode && ( 
            <Card className="bg-secondary/50 p-4">
              <CardHeader className="p-0 mb-2">
                <CardTitle className="text-lg flex items-center gap-2 font-headline"><Sparkles className="w-5 h-5 text-accent" />AI Listing Assistant</CardTitle>
                <CardDescription className="text-xs">Provide some keywords and details, and let AI write a compelling description.</CardDescription>
              </CardHeader>
              <CardContent className="p-0 space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="aiKeywords">Keywords for AI</Label>
                  <Input id="aiKeywords" {...form.register('aiKeywords')} placeholder="e.g., durable, lightweight, 4K video, beginner-friendly" disabled={isGenerating || isSubmitting} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="aiDetails">Specific Details for AI</Label>
                  <Textarea id="aiDetails" {...form.register('aiDetails')} placeholder="e.g., Barely used, comes with original packaging and all accessories." rows={3} disabled={isGenerating || isSubmitting}/>
                </div>
                <Button type="button" onClick={onAIDescriptionGenerate} disabled={isGenerating || isSubmitting} variant="outline" className="w-full sm:w-auto">
                  {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                  Generate Description
                </Button>
              </CardContent>
            </Card>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" {...form.register('description')} placeholder="Describe your item in detail..." rows={5} disabled={isSubmitting}/>
            {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="features">Features (comma-separated)</Label>
            <Input id="features" {...form.register('features')} placeholder="e.g., 24MP Sensor, 4K Video, Carry Bag" disabled={isSubmitting}/>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pricePerDay">Price Per Day (₱)</Label>
            <Input id="pricePerDay" type="number" step="0.01" {...form.register('pricePerDay')} placeholder="e.g., 1000.00" disabled={isSubmitting}/>
            {errors.pricePerDay && <p className="text-sm text-destructive">{errors.pricePerDay.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Delivery Method</Label>
            <Controller
              name="deliveryMethod"
              control={control}
              render={({ field }) => (
                <RadioGroup
                  onValueChange={field.onChange}
                  value={field.value}
                  className="flex flex-col sm:flex-row gap-4"
                  disabled={isSubmitting}
                >
                  {deliveryMethods.map((method) => {
                    const MethodIcon = method.icon;
                    return (
                      <Label
                        key={method.id}
                        htmlFor={`delivery-${method.id}`}
                        className={`flex flex-1 items-center space-x-3 rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary ${isSubmitting ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                      >
                        <RadioGroupItem value={method.value} id={`delivery-${method.id}`} disabled={isSubmitting} />
                        <MethodIcon className="h-5 w-5 text-primary" />
                        <span>{method.label}</span>
                      </Label>
                    );
                  })}
                </RadioGroup>
              )}
            />
            {errors.deliveryMethod && <p className="text-sm text-destructive">{errors.deliveryMethod.message}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="images">Upload Images (Max 5, first is primary)</Label>
            <div className="flex items-center justify-center w-full">
                <label htmlFor="images-upload" className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg bg-card hover:bg-muted transition-colors ${isSubmitting ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <UploadCloud className="w-8 h-8 mb-2 text-muted-foreground" />
                        <p className="mb-1 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                        <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 10MB</p>
                    </div>
                    <Input id="images-upload" type="file" className="hidden" multiple accept="image/*" onChange={handleImageUpload} disabled={isSubmitting} />
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
          <Button type="submit" className="w-full" size="lg" disabled={isSubmitting || isGenerating}>
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isEditMode ? 'Update Item' : 'List My Item'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

