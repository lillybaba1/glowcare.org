
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Upload, Trash2 } from 'lucide-react';
import Image from 'next/image';
import type { Product } from '@/lib/types';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { categories } from '@/lib/data';
import { db, storage } from '@/lib/firebase';
import { ref as dbRef, push, set, update } from 'firebase/database';
import { ref as storageRef, uploadString, getDownloadURL, deleteObject } from 'firebase/storage';

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Product name must be at least 2 characters.',
  }),
  description: z.string().min(10, {
    message: 'Description must be at least 10 characters.',
  }),
  price: z.coerce.number().positive({
    message: 'Price must be a positive number.',
  }),
  imageUrls: z.array(z.string()).min(1, {
    message: 'Please upload at least one product image.',
  }),
  category: z.string().min(1, { message: 'Please select a category.' }),
  stock: z.coerce.number().int().nonnegative({ message: 'Stock must be 0 or more.' }).default(0),
  featured: z.boolean().default(false),
});

type ProductFormValues = z.infer<typeof formSchema>;

interface AddProductFormProps {
  productToEdit?: Product;
}

export default function AddProductForm({ productToEdit }: AddProductFormProps) {
  const isEditMode = !!productToEdit;
  const [isLoading, setIsLoading] = useState(false);
  const [previews, setPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      imageUrls: [],
      category: '',
      stock: 0,
      featured: false,
    },
  });

  useEffect(() => {
    if (isEditMode && productToEdit) {
      form.reset({
        ...productToEdit,
        stock: productToEdit.stock ?? 0,
      });
      setPreviews(productToEdit.imageUrls || []);
    }
  }, [isEditMode, productToEdit, form]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const currentUrls = previews;
      
      const filePromises = Array.from(files).map(file => {
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      });

      Promise.all(filePromises).then(newDataUris => {
        const updatedUrls = [...currentUrls, ...newDataUris];
        form.setValue('imageUrls', updatedUrls, { shouldValidate: true });
        setPreviews(updatedUrls);
      });
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    const updatedUrls = previews.filter((_, index) => index !== indexToRemove);
    setPreviews(updatedUrls);
    form.setValue('imageUrls', updatedUrls, { shouldValidate: true });
  };

  async function onSubmit(values: ProductFormValues) {
    setIsLoading(true);
    try {
      const initialUrls = isEditMode && productToEdit ? productToEdit.imageUrls : [];
      const finalUrlOrDataUris = values.imageUrls;

      // 1. URLs to delete from storage
      const urlsToDelete = (initialUrls || []).filter(url => !finalUrlOrDataUris.includes(url));
      for (const urlToDelete of urlsToDelete) {
        if (urlToDelete.includes('firebasestorage.googleapis.com')) {
          const oldImageRef = storageRef(storage, urlToDelete);
          await deleteObject(oldImageRef).catch(err => console.warn("Failed to delete old image:", err));
        }
      }

      // 2. Upload new images and collect all final URLs
      const finalImageUrls = await Promise.all(
        finalUrlOrDataUris.map(async (urlOrDataUri) => {
          if (urlOrDataUri.startsWith('data:image/')) {
            const newImageRef = storageRef(storage, `products/${Date.now()}-${Math.random().toString(36).substring(2)}`);
            const uploadResult = await uploadString(newImageRef, urlOrDataUri, 'data_url');
            return getDownloadURL(uploadResult.ref);
          }
          return urlOrDataUri; // It's an existing URL
        })
      );

      const productData = {
        ...values,
        imageUrls: finalImageUrls,
      };

      // 3. Save product data to Realtime Database
      if (isEditMode) {
        const productRef = dbRef(db, `products/${productToEdit.id}`);
        await update(productRef, productData);
        toast({
          title: 'Product Updated!',
          description: `${values.name} has been successfully updated.`,
        });
      } else {
        const newProductRef = push(dbRef(db, 'products'));
        await set(newProductRef, productData);
        toast({
          title: 'Product Added!',
          description: `${values.name} has been successfully added.`,
        });
      }
      
      router.push('/admin/products');

    } catch (error: any) {
      console.error("Error saving product:", error);
      let description = 'An unknown error occurred. Please try again.';

      if (error.code === 'PERMISSION_DENIED' || (error.message && error.message.toLowerCase().includes('permission denied'))) {
          description = 'Permission denied. Your Firebase Database rules are likely blocking this action. Please ensure your rules allow admins to write to the "products" collection.';
      } else if (error.message) {
          description = error.message;
      }

      toast({
        variant: 'destructive',
        title: 'Uh oh! Product could not be saved.',
        description: description,
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. CeraVe Foaming Cleanser" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe the product..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price (GMD)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="e.g. 850" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
           <FormField
            control={form.control}
            name="stock"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stock Quantity</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="e.g. 50" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="imageUrls"
          render={() => (
            <FormItem>
              <FormLabel>Product Images</FormLabel>
              <FormControl>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
                  {previews.map((src, index) => (
                    <div key={src + index} className="relative group aspect-square">
                      <Image
                        src={src}
                        alt={`Product preview ${index + 1}`}
                        fill
                        className="rounded-md object-cover"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                        onClick={() => handleRemoveImage(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <div
                    className="aspect-square w-full bg-muted rounded-md flex items-center justify-center text-muted-foreground border-2 border-dashed border-border cursor-pointer hover:bg-accent transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="text-center p-2">
                        <Upload className="mx-auto h-8 w-8"/>
                        <span className="text-sm mt-2 block">Add Images</span>
                    </div>
                  </div>
                </div>
              </FormControl>
              <FormDescription>
                Click to add one or more images. The first image will be the main display image.
              </FormDescription>
              <Input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
              />
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="featured"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Featured Product</FormLabel>
                <FormDescription>
                  Featured products will be displayed on the home page.
                </FormDescription>
              </div>
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEditMode ? 'Update Product' : 'Add Product'}
        </Button>
      </form>
    </Form>
  );
}
