'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { addProductToMemory } from '@/lib/data';

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

  // Save the product to our in-memory "database"
  addProductToMemory(validationResult.data);

  // Redirect to the products page to see the new product.
  // This ensures data consistency for our in-memory store.
  redirect('/admin/products');
}
