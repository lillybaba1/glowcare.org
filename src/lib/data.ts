
import type { Product, Category, Order, OrderStatus, PaymentStatus } from './types';
import { db } from './firebase';
import { ref, get, child, update } from 'firebase/database';


export const categories: Category[] = [
  {
    id: 'cat1',
    name: 'Sunscreens',
    imageUrl: 'https://images.unsplash.com/photo-1623676714504-edd78728155e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxzdW5zY3JlZW58ZW58MHx8fHwxNzUxOTA3NDIwfDA&ixlib=rb-4.1.0&q=80&w=1080',
    dataAiHint: 'Sunscreens'
  },
  {
    id: 'cat2',
    name: 'Cleansers',
    imageUrl: 'https://images.unsplash.com/photo-1556227703-b7668d8cff99?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwyMHx8Y2xlYW5zZXJ8ZW58MHx8fHwxNzUxOTA3NDU5fDA&ixlib=rb-4.1.0&q=80&w=1080',
    dataAiHint: 'Cleansers'
  },
  {
    id: 'cat3',
    name: 'Moisturizers',
    imageUrl: 'https://images.unsplash.com/photo-1630398776959-6ff31b49df55?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwyMHx8TW9pc3R1cml6ZXJ8ZW58MHx8fHwxNzUxOTcwNzQ3fDA&ixlib=rb-4.1.0&q=80&w=1080',
    dataAiHint: 'Moisturizers'
  },
  {
    id: 'cat4',
    name: 'Serums',
    imageUrl: 'https://images.unsplash.com/photo-1643379850274-77d2e3703ef9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxOXx8U2VydW1zfGVufDB8fHx8MTc1MTk3MDgzMXww&ixlib=rb-4.1.0&q=80&w=1080',
    dataAiHint: 'Serums'
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

/**
 * Retrieves all orders from Firebase Realtime Database.
 * @returns An array of all orders.
 */
export async function getOrders(): Promise<Order[]> {
  try {
    const snapshot = await get(ref(db, 'orders'));
    if (snapshot.exists()) {
      const ordersObject = snapshot.val();
      const ordersArray = Object.keys(ordersObject).map(key => ({
        id: key,
        ...ordersObject[key],
      }));
      return ordersArray.reverse();
    }
    return [];
  } catch (error) {
    console.error("Error fetching orders:", error);
    return [];
  }
}

/**
 * Retrieves a single order by its ID from Firebase Realtime Database.
 * @param id The ID of the order to retrieve.
 * @returns The order if found, otherwise undefined.
 */
export async function getOrderById(id: string): Promise<Order | undefined> {
  try {
    const snapshot = await get(child(ref(db), `orders/${id}`));
    if (snapshot.exists()) {
      return { id, ...snapshot.val() };
    }
    return undefined;
  } catch (error) {
    console.error(`Error fetching order ${id}:`, error);
    return undefined;
  }
}

/**
 * Updates the status of an order.
 * @param orderId The ID of the order to update.
 * @param statuses An object with the new orderStatus and/or paymentStatus.
 */
export async function updateOrderStatus(
  orderId: string,
  statuses: { orderStatus?: OrderStatus; paymentStatus?: PaymentStatus }
) {
  const orderRef = ref(db, `orders/${orderId}`);
  return update(orderRef, statuses);
}
