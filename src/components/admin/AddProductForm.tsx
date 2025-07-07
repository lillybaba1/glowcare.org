
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Upload } from 'lucide-react';
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
  imageUrl: z.string().min(1, { // Can be a data URI or a regular URL now
    message: 'Please upload a product image.',
  }),
  category: z.string().min(1, { message: 'Please select a category.' }),
  featured: z.boolean().default(false),
});

type ProductFormValues = z.infer<typeof formSchema>;

interface AddProductFormProps {
  productToEdit?: Product;
}

export default function AddProductForm({ productToEdit }: AddProductFormProps) {
  const isEditMode = !!productToEdit;
  const [isLoading, setIsLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      imageUrl: '',
      category: '',
      featured: false,
    },
  });

  useEffect(() => {
    if (isEditMode && productToEdit) {
      form.reset(productToEdit);
      setPreview(productToEdit.imageUrl);
    }
  }, [isEditMode, productToEdit, form]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        form.setValue('imageUrl', result, { shouldValidate: true });
        setPreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  async function onSubmit(values: ProductFormValues) {
    setIsLoading(true);
    try {
      let finalImageUrl = productToEdit?.imageUrl || '';
      const isNewImage = values.imageUrl.startsWith('data:image/');

      // 1. Handle image upload if a new image was provided
      if (isNewImage) {
          // A. Delete old image if in edit mode and an old image exists
          if (isEditMode && productToEdit.imageUrl.includes('firebasestorage.googleapis.com')) {
              try {
                  const oldImageRef = storageRef(storage, productToEdit.imageUrl);
                  await deleteObject(oldImageRef);
              } catch (error) {
                  console.warn("Could not delete old image, it might not exist or there was an error:", error);
              }
          }

          // B. Upload new image
          const newImageRef = storageRef(storage, `products/${Date.now()}-${Math.random().toString(36).substring(2)}`);
          const uploadResult = await uploadString(newImageRef, values.imageUrl, 'data_url');
          finalImageUrl = await getDownloadURL(uploadResult.ref);
      }
      
      const productData = {
        ...values,
        imageUrl: finalImageUrl,
      };

      // 2. Save product data to Realtime Database
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
      router.refresh(); // Force a refresh to show the new/updated product

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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
          name="imageUrl"
          render={() => (
            <FormItem>
              <FormLabel>Product Image</FormLabel>
              <FormControl>
                <div className="flex items-center gap-4">
                  {preview ? (
                    <Image
                      src={preview}
                      alt="Product preview"
                      width={80}
                      height={80}
                      className="rounded-md object-cover aspect-square"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-muted rounded-md flex items-center justify-center text-muted-foreground">
                      <Upload />
                    </div>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {preview ? 'Change Image' : 'Upload Image'}
                  </Button>
                  <Input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                  />
                </div>
              </FormControl>
              <FormDescription>
                Upload an image for the product from your device.
              </FormDescription>
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
