'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { db, storage } from '@/lib/firebase';
import { ref as dbRef, push, set } from 'firebase/database';
import { ref as storageRef, uploadString, getDownloadURL } from 'firebase/storage';

const productFormSchema = z.object({
  name: z.string().min(2),
  description: z.string().min(10),
  price: z.coerce.number().positive(),
  imageUrl: z.string().refine((val) => val.startsWith('data:image/'), {
    message: 'Please upload a product image.',
  }),
  category: z.string().min(1),
  featured: z.boolean().default(false),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;

export async function addProduct(data: ProductFormValues) {
  const validationResult = productFormSchema.safeParse(data);

  if (!validationResult.success) {
    return {
      success: false,
      message: 'Invalid product data provided.',
      errors: validationResult.error.flatten().fieldErrors,
    };
  }

  try {
    const { imageUrl, ...productData } = validationResult.data;

    // 1. Upload image to Firebase Storage
    const imageRef = storageRef(storage, `products/${Date.now()}-${Math.random().toString(36).substring(2)}`);
    const uploadResult = await uploadString(imageRef, imageUrl, 'data_url');
    const downloadURL = await getDownloadURL(uploadResult.ref);

    // 2. Save product to Realtime Database
    const newProductRef = push(dbRef(db, 'products'));
    await set(newProductRef, {
      ...productData,
      imageUrl: downloadURL,
    });

  } catch (error) {
    console.error("Error adding product:", error);
    // This return is for the form to handle the error state
    return {
        success: false,
        message: 'An unexpected error occurred while adding the product.',
        errors: null,
    };
  }
  
  // 3. Redirect on success
  redirect('/admin/products');
}
