'use server';

import { z } from 'zod';

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

  // TODO: Implement database logic to save the new product.
  // In a real app, you would upload the base64 data URI to a file storage
  // service (like Firebase Storage), get the public URL, and save that
  // URL in your database.

  const newProduct = {
    id: new Date().getTime().toString(), // temporary ID
    ...validationResult.data,
  };

  console.log('New Product Added:', {
    ...newProduct,
    imageUrl: `Data URI starting with: ${newProduct.imageUrl.substring(0, 40)}...`,
  });

  // Since we aren't saving to a database, the new product won't
  // actually appear on the site. This is a placeholder action.
  return {
    success: true,
    message: 'Product has been added successfully (logged to console).',
  };
}
