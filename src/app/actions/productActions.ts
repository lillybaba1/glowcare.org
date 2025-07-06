'use server';

import { z } from 'zod';

const productFormSchema = z.object({
  name: z.string().min(2),
  description: z.string().min(10),
  price: z.coerce.number().positive(),
  imageUrl: z.string().url(),
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

  // TODO: Implement database logic to save the new product.
  // For now, we will just log it to the console.
  // In a real application, you would add this product to a database
  // (e.g., Firestore, PostgreSQL, etc.) and then revalidate the
  // paths that display products (e.g., '/', '/products')
  // using Next.js' revalidatePath() function.

  const newProduct = {
    id: new Date().getTime().toString(), // temporary ID
    ...validationResult.data,
  };

  console.log('New Product Added:', newProduct);

  // Since we aren't saving to a database, the new product won't
  // actually appear on the site. This is a placeholder action.
  return {
    success: true,
    message: 'Product has been added successfully (logged to console).',
  };
}
