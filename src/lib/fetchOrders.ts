
import type { Order } from './types';
import { db } from './firebase';
import { ref, get, query, orderByChild, equalTo } from 'firebase/database';


/**
 * Fetches all orders from the database. Intended for admin use only.
 * Firebase rules should restrict this to admins.
 * @returns A promise that resolves to an array of all orders.
 */
export async function fetchAdminOrders(): Promise<Order[]> {
  try {
    const ordersRef = ref(db, 'orders');
    const snapshot = await get(ordersRef);
    if (snapshot.exists()) {
      const ordersObject = snapshot.val();
      const ordersArray = Object.keys(ordersObject).map(key => ({
        id: key,
        ...ordersObject[key],
      }));
      return ordersArray.reverse(); // Show newest first
    }
    return [];
  } catch (error) {
    console.error("Error fetching admin orders:", error);
    // This error will be caught by the calling component.
    // It's likely a permission_denied error if a non-admin calls this.
    throw new Error("Failed to fetch all orders. You may not have permission.");
  }
}

/**
 * Fetches all orders for a specific user using a secure query.
 * @param userId The UID of the user whose orders are to be fetched.
 * @returns A promise that resolves to an array of the user's orders.
 */
export async function fetchUserOrders(userId: string): Promise<Order[]> {
  if (!userId) {
    return [];
  }
  try {
    const ordersRef = ref(db, 'orders');
    // This query is required by Firebase rules for non-admin users to read orders.
    const userOrdersQuery = query(ordersRef, orderByChild('customer/userId'), equalTo(userId));
    const snapshot = await get(userOrdersQuery);

    if (snapshot.exists()) {
      const ordersObject = snapshot.val();
      const ordersArray = Object.keys(ordersObject).map(key => ({
        id: key,
        ...ordersObject[key],
      }));
      return ordersArray.reverse(); // Show newest first
    }
    return [];
  } catch (error) {
    console.error("Error fetching user orders:", error);
    // This will be caught by the calling component to show a toast message.
    throw new Error("Could not fetch your orders. Please try again later.");
  }
}
