
import type { Product, Category, Order, OrderStatus, PaymentStatus } from './types';
import { db } from './firebase';
import { ref, get, child, update, set, query, orderByChild, equalTo } from 'firebase/database';


export const defaultCategories: Category[] = [
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
 * Seeds the database with default categories if they don't exist.
 */
export async function seedInitialCategories() {
    const categoriesRef = ref(db, 'categories');
    const snapshot = await get(categoriesRef);
    if (!snapshot.exists()) {
        const categoriesToSeed: { [key: string]: Category } = {};
        defaultCategories.forEach(cat => {
            categoriesToSeed[cat.id] = cat;
        });
        await set(ref(db, 'categories'), categoriesToSeed);
    }
}

/**
 * Retrieves all product categories, fetching from DB and falling back to defaults.
 * @returns An array of all categories.
 */
export async function getCategories(): Promise<Category[]> {
    try {
        const snapshot = await get(ref(db, 'categories'));
        if (snapshot.exists()) {
            const dbCategoriesObj = snapshot.val();
            const dbCategories: Category[] = Object.values(dbCategoriesObj);
            
            // Merge with defaults, ensuring imageUrl is always a valid string.
            return defaultCategories.map(defaultCat => {
                const dbCat = dbCategories.find(c => c.id === defaultCat.id);
                // Prioritize DB image, but fallback to default if it's missing or invalid
                const imageUrl = dbCat?.imageUrl || defaultCat.imageUrl;
                return { ...defaultCat, ...dbCat, imageUrl };
            });
        }
        return defaultCategories; // Return defaults if node doesn't exist
    } catch (error) {
        console.error("Error fetching categories:", error);
        return defaultCategories; // Fallback on error
    }
}

/**
 * Updates a category's image URL in the database.
 * @param categoryId The ID of the category to update.
 * @param imageUrl The new image URL.
 */
export async function updateCategoryImage(categoryId: string, imageUrl: string): Promise<void> {
    const updates: { [key: string]: any } = {};
    updates[`categories/${categoryId}/imageUrl`] = imageUrl;
    return update(ref(db), updates);
}


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
    console.error("Error fetching products:", error);
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
    console.error("Error fetching product by ID:", error);
    return undefined;
  }
}

/**
 * Retrieves a single order by its ID from a user-specific path.
 * @param id The ID of the order to retrieve.
 * @param userId The ID of the user who owns the order.
 * @returns The order if found, otherwise undefined.
 */
export async function getOrderById(id: string, userId: string): Promise<Order | undefined> {
  try {
    const snapshot = await get(child(ref(db), `orders/${userId}/${id}`));
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
 * @param userId The ID of the user who owns the order.
 * @param statuses An object with the new orderStatus and/or paymentStatus.
 */
export async function updateOrderStatus(
  orderId: string,
  userId: string,
  statuses: { orderStatus?: OrderStatus; paymentStatus?: PaymentStatus }
) {
  try {
    const orderRef = ref(db, `orders/${userId}/${orderId}`);
    return await update(orderRef, statuses);
  } catch (error) {
    console.error("Error updating order status:", error);
    throw new Error("Could not update order status. Please check permissions.");
  }
}

/**
 * Retrieves the hero FOREGROUND image URL from settings.
 * @returns The hero image URL string if it exists, otherwise null.
 */
export async function getHeroImageUrl(): Promise<string | null> {
  try {
    const snapshot = await get(ref(db, 'settings/heroImageUrl'));
    if (snapshot.exists() && snapshot.val()) {
      return snapshot.val();
    }
    return null;
  } catch (error) {
    console.error("Error fetching hero image URL:", error);
    return null;
  }
}

/**
 * Retrieves the hero BACKGROUND image URL from settings.
 * @returns The hero background image URL string if it exists, otherwise null.
 */
export async function getHeroBackgroundImageUrl(): Promise<string | null> {
  try {
    const snapshot = await get(ref(db, 'settings/heroBackgroundImageUrl'));
    if (snapshot.exists() && snapshot.val()) {
      return snapshot.val();
    }
    return null;
  } catch (error) {
    console.error("Error fetching hero background image URL:", error);
    return null;
  }
}


/**
 * Retrieves the hero background color from settings.
 * @returns The hero background color string (hex code) if it exists, otherwise null.
 */
export async function getHeroBackgroundColor(): Promise<string | null> {
  try {
    const snapshot = await get(ref(db, 'settings/heroBackgroundColor'));
    if (snapshot.exists()) {
      return snapshot.val();
    }
    return null;
  } catch (error) {
    console.error("Error fetching hero background color:", error);
    return null;
  }
}

/**
 * Retrieves the WhatsApp number from settings.
 * @returns The WhatsApp number string if it exists, otherwise null.
 */
export async function getWhatsappNumber(): Promise<string | null> {
  try {
    const snapshot = await get(ref(db, 'settings/whatsappNumber'));
    if (snapshot.exists() && snapshot.val()) {
      return snapshot.val();
    }
    return null;
  } catch (error) {
    console.error("Error fetching WhatsApp number:", error);
    return null;
  }
}

/**
 * Retrieves the social media URLs from settings.
 * @returns An object with facebook, instagram, and twitter URLs.
 */
export async function getSocialMediaUrls(): Promise<{ facebook: string; instagram: string; twitter: string; }> {
  const defaults = {
    facebook: 'https://facebook.com',
    instagram: 'https://instagram.com',
    twitter: 'https://twitter.com',
  };
  try {
    const snapshot = await get(ref(db, 'settings/socialUrls'));
    if (snapshot.exists() && snapshot.val()) {
      return { ...defaults, ...snapshot.val() };
    }
    return defaults;
  } catch (error) {
    console.error("Error fetching social media URLs:", error);
    return defaults;
  }
}

/**
 * Retrieves the content for a specific static page from settings.
 * @param pageName The name of the page (e.g., 'contact', 'privacy').
 * @returns The page content string if it exists, otherwise an empty string.
 */
export async function getPageContent(pageName: string): Promise<string> {
  try {
    const snapshot = await get(ref(db, `settings/pages/${pageName}`));
    if (snapshot.exists() && snapshot.val()) {
      return snapshot.val();
    }
  } catch (error) {
    console.error(`Error fetching content for page "${pageName}":`, error);
  }
  
  // Return an empty string if not found or on error
  return '';
}
