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
import { Sparkles, Loader2, Smartphone, Car, Home, Wrench, Shirt, Bike, Package, Truck, ListChecks, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateListingDescription, type GenerateListingDescriptionInput } from '@/ai/flows/generate-listing-description';
import type { RentalCategory, RentalItem } from '@/types';
import { itemsService, authService } from '@/services';
import { useRouter } from 'next/navigation';
import { ImageUpload } from '@/components/upload/ImageUpload';
import Link from 'next/link';

const categories: RentalCategory[] = [
  { id: '1', name: 'Electronics', icon: Smartphone },
  { id: '2', name: 'Vehicles', icon: Car },
  { id: '3', name: 'Property', icon: Home },
  { id: '4', name: 'Tools', icon: Wrench },
  { id: '5', name: 'Apparel', icon: Shirt },
  { id: '6', name: 'Sports & Outdoors', icon: Bike },
  { id: '7', name: 'Other', icon: Package },
];

const deliveryMethods = [
  { id: 'pick-up', value: 'Pick Up', label: 'Pick Up Only', icon: Package },
  { id: 'delivery', value: 'Delivery', label: 'Delivery Only', icon: Truck },
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
  securityDeposit: z.coerce.number().min(0, { message: 'Deposit must be 0 or more.' }),
  deliveryMethod: z.enum(['Pick Up', 'Delivery', 'Both'], { required_error: 'Please select a delivery method.' }),
  features: z.string().optional(),
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
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // We'll store uploaded file objects here for the API, and preview URLs for display
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  // Use a string to track the main image URL if we are in edit mode and didn't upload a new one
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(initialData?.imageUrl || null);

  const isEditMode = !!initialData;
  const user = authService.getCurrentUser();

  const defaultValues: NewItemFormValues = {
    itemName: initialData?.name || '',
    category: initialData?.category ? (categories.find(c => c.name === initialData.category)?.id || categories.find(c => c.name === 'Other')?.id || '7') : '',
    aiKeywords: '',
    aiDetails: '',
    description: initialData?.description || '',
    pricePerDay: initialData?.pricePerDay || 0,
    securityDeposit: initialData?.securityDeposit || 0,
    deliveryMethod: initialData?.deliveryMethod || 'Pick Up',
    features: initialData?.features?.join(', ') || '',
  };

  const form = useForm<NewItemFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues,
  });

  useEffect(() => {
    if (initialData) {
      const categoryId = categories.find(c => c.name === initialData.category)?.id || '7'; // Default to "Other"

      form.reset({
        itemName: initialData.name || '',
        category: categoryId,
        description: initialData.description || '',
        pricePerDay: initialData.pricePerDay || 0,
        securityDeposit: initialData.securityDeposit || 0,
        deliveryMethod: initialData.deliveryMethod as DeliveryMethodValue || 'Pick Up',
        aiKeywords: '',
        aiDetails: '',
        features: initialData.features?.join(', ') || '',
      });
      setExistingImageUrl(initialData.imageUrl);
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
    if (!user) {
      toast({ title: 'Error', description: 'You must be logged in to list an item.', variant: 'destructive' });
      router.push('/login');
      return;
    }

    if (!isEditMode && uploadedFiles.length === 0) {
      toast({ title: 'Image Required', description: 'Please upload at least one image of your item.', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);

    try {
      // Find category ID/name mapping
      const categoryId = parseInt(data.category);

      const featuresList = data.features ? data.features.split(',').map(f => f.trim()).filter(f => f) : [];

      // Base item data
      const itemData: any = {
        name: data.itemName,
        description: data.description,
        price_per_day: data.pricePerDay,
        category: categoryId,
        location: 'Manila, Philippines', // Default location as user location isn't in UserProfile yet
        delivery_method: data.deliveryMethod,
        owner_id: String(user.id), // Pass as string
      };

      let savedItem: RentalItem;

      if (isEditMode && initialData) {
        // Update item
        savedItem = await itemsService.update(initialData.id, itemData);

        // If there are new files, upload them
        if (uploadedFiles.length > 0) {
          await itemsService.uploadImage(savedItem.id, uploadedFiles[0]);
        }

        toast({
          title: 'Item Updated!',
          description: `${data.itemName} has been successfully updated.`,
        });
      } else {
        // Create new item
        // We first create the item to get an ID
        savedItem = await itemsService.create(itemData);

        // Then upload the image if we have one
        if (uploadedFiles.length > 0) {
          await itemsService.uploadImage(savedItem.id, uploadedFiles[0]);
        }

        toast({
          title: 'Item Listed!',
          description: `${data.itemName} has been successfully listed.`,
        });
      }

      // Redirect to the item page or my items
      router.push('/my-items');

    } catch (error: any) {
      console.error("Error submitting item:", error);
      toast({
        title: 'Submission Error',
        description: error.message || 'Failed to save item. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="mb-6">
        <Button variant="ghost" asChild className="pl-0 hover:pl-0 hover:bg-transparent">
          <Link href="/my-items" className="flex items-center text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to My Items
          </Link>
        </Button>
      </div>

      <Card className="shadow-xl border-primary/10 rounded-[2rem] overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-primary/80 to-primary/20" />
        <CardHeader className="bg-muted/30 pb-8">
          <CardTitle className="text-3xl font-black font-headline text-foreground tracking-tight">
            {isEditMode ? `Edit Item: ${initialData?.name}` : 'List Your Item'}
          </CardTitle>
          <CardDescription className="text-base">
            {isEditMode ? 'Update the details for your item.' : 'Fill in the details below to rent out your item.'}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-8 pt-8">
            <div className="space-y-4">
              <h3 className="text-lg font-black uppercase tracking-widest text-primary border-b border-primary/10 pb-2">
                Basic Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="itemName" className="font-bold">Item Name</Label>
                  <Input
                    id="itemName"
                    {...form.register('itemName')}
                    placeholder="e.g., Canon EOS R5 Camera"
                    disabled={isSubmitting}
                    className="h-12 rounded-xl"
                  />
                  {errors.itemName && <p className="text-sm text-destructive font-medium">{errors.itemName.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category" className="font-bold">Category</Label>
                  <Controller
                    name="category"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value} disabled={isSubmitting}>
                        <SelectTrigger id="category" className="h-12 rounded-xl">
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
                  {errors.category && <p className="text-sm text-destructive font-medium">{errors.category.message}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pricePerDay" className="font-bold">Price Per Day (₱)</Label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-muted-foreground">₱</span>
                  <Input
                    id="pricePerDay"
                    type="number"
                    step="0.01"
                    {...form.register('pricePerDay')}
                    placeholder="0.00"
                    disabled={isSubmitting}
                    className="pl-8 h-12 rounded-xl font-mono"
                  />
                </div>
                {errors.pricePerDay && <p className="text-sm text-destructive font-medium">{errors.pricePerDay.message}</p>}
              </div>

              <div className="space-y-2">
                <Label className="font-bold">Delivery Method</Label>
                <Controller
                  name="deliveryMethod"
                  control={control}
                  render={({ field }) => (
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="grid grid-cols-1 sm:grid-cols-3 gap-4"
                      disabled={isSubmitting}
                    >
                      {deliveryMethods.map((method) => {
                        const MethodIcon = method.icon;
                        const isSelected = field.value === method.value;
                        return (
                          <Label
                            key={method.id}
                            htmlFor={`delivery-${method.id}`}
                            className={`flex flex-col items-center justify-center space-y-2 rounded-2xl border-2 p-4 cursor-pointer transition-all ${isSelected
                              ? 'border-primary bg-primary/5 text-primary'
                              : 'border-muted hover:border-primary/50 bg-card'
                              }`}
                          >
                            <RadioGroupItem value={method.value} id={`delivery-${method.id}`} className="sr-only" />
                            <MethodIcon className={`h-6 w-6 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                            <span className="font-bold text-sm text-center">{method.label}</span>
                          </Label>
                        );
                      })}
                    </RadioGroup>
                  )}
                />
                {errors.deliveryMethod && <p className="text-sm text-destructive font-medium">{errors.deliveryMethod.message}</p>}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-black uppercase tracking-widest text-primary border-b border-primary/10 pb-2">
                Visuals & Description
              </h3>

              <div className="space-y-2">
                <Label htmlFor="images" className="font-bold">Item Images</Label>
                <ImageUpload
                  value={uploadedFiles.length > 0 ? '' : (existingImageUrl || '')}
                  onChange={(url) => {
                    // Only handle URL clear here, file selection is handled by onFilesSelected
                    if (!url) {
                      setUploadedFiles([]);
                      setExistingImageUrl(null);
                    }
                  }}
                  onFilesSelected={(files) => {
                    if (files && files.length > 0) {
                      setUploadedFiles([files[0]]);
                    }
                  }}
                  disabled={isSubmitting}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Upload a high-quality image of your item. Used for the listing card and details page.
                </p>
              </div>

              {!isEditMode && (
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-900/50">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg">
                      <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                      <h4 className="font-bold text-indigo-900 dark:text-indigo-100">AI Listing Assistant</h4>
                      <p className="text-xs text-indigo-700 dark:text-indigo-300">Let AI write a compelling description for you</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-1">
                      <Label htmlFor="aiKeywords" className="text-xs uppercase font-bold text-indigo-900/60 dark:text-indigo-100/60">Keywords</Label>
                      <Input
                        id="aiKeywords"
                        {...form.register('aiKeywords')}
                        placeholder="e.g., durable, 4K, lightweight"
                        disabled={isGenerating || isSubmitting}
                        className="bg-white/50 dark:bg-black/20 border-indigo-200 dark:border-indigo-800"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="aiDetails" className="text-xs uppercase font-bold text-indigo-900/60 dark:text-indigo-100/60">Specific Details</Label>
                      <Input
                        id="aiDetails"
                        {...form.register('aiDetails')}
                        placeholder="e.g., Includes carry bag and extra battery"
                        disabled={isGenerating || isSubmitting}
                        className="bg-white/50 dark:bg-black/20 border-indigo-200 dark:border-indigo-800"
                      />
                    </div>
                  </div>

                  <Button
                    type="button"
                    onClick={onAIDescriptionGenerate}
                    disabled={isGenerating || isSubmitting}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 dark:shadow-none rounded-xl"
                  >
                    {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                    Generate Description
                  </Button>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="description" className="font-bold">Description</Label>
                <Textarea
                  id="description"
                  {...form.register('description')}
                  placeholder="Describe your item in detail..."
                  rows={5}
                  disabled={isSubmitting}
                  className="min-h-[150px] rounded-xl resize-none p-4 leading-relaxed"
                />
                {errors.description && <p className="text-sm text-destructive font-medium">{errors.description.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="features" className="font-bold">Features (comma-separated)</Label>
                <Input
                  id="features"
                  {...form.register('features')}
                  placeholder="e.g., 24MP Sensor, 4K Video, Carry Bag"
                  disabled={isSubmitting}
                  className="h-12 rounded-xl"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-muted/30 p-8">
            <Button
              type="submit"
              className="w-full h-14 text-lg font-black uppercase tracking-widest rounded-xl shadow-xl hover:shadow-2xl transition-all"
              disabled={isSubmitting || isGenerating}
            >
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {isEditMode ? 'Update Item' : 'List Item Now'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
