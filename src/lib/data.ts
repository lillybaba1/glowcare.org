
import type { Product, Category } from './types';
import { db } from './firebase';
import { ref, get, child } from 'firebase/database';


export const categories: Category[] = [
  {
    id: 'cat1',
    name: 'Sunscreens',
    imageUrl: 'https://placehold.co/400x400.png',
    dataAiHint: 'sunscreen bottle'
  },
  {
    id: 'cat2',
    name: 'Cleansers',
    imageUrl: 'https://placehold.co/400x400.png',
    dataAiHint: 'cleanser bottle'
  },
  {
    id: 'cat3',
    name: 'Moisturizers',
    imageUrl: 'https://placehold.co/400x400.png',
    dataAiHint: 'moisturizer jar'
  },
  {
    id: 'cat4',
    name: 'Serums',
    imageUrl: 'https://placehold.co/400x400.png',
    dataAiHint: 'serum bottle'
  },
];

/**
 * Retrieves all products from Firebase Realtime Database.
 * @returns An array of all products.
 */
export async function getProducts(): Promise<Product[]> {
  try {
    const snapshot = await get(ref(db, 'products'));
    if (snapshot.exists()) {
      const productsObject = snapshot.val();
      // Convert the object of products into an array and add the id
      const productsArray = Object.keys(productsObject).map(key => ({
        id: key,
        ...productsObject[key],
      }));
      // Reverse to show newest products first
      return productsArray.reverse();
    }
    return [];
  } catch (error) {
    return [];
  }
}

/**
 * Retrieves a single product by its ID from Firebase Realtime Database.
 * @param id The ID of the product to retrieve.
 * @returns The product if found, otherwise undefined.
 */
export async function getProductById(id: string): Promise<Product | undefined> {
  try {
    const snapshot = await get(child(ref(db), `products/${id}`));
    if (snapshot.exists()) {
      return { id, ...snapshot.val() };
    }
    return undefined;
  } catch (error) {
    return undefined;
  }
}
