
import type { Order } from './types';
import { db } from './firebase';
import { ref, get } from 'firebase/database';


/**
 * Fetches all orders from the database. Intended for admin use only.
 * Firebase rules should restrict this to admins.
 * This function iterates through all user-nested orders.
 * @returns A promise that resolves to an array of all orders.
 */
export async function fetchAdminOrders(): Promise<Order[]> {
  try {
    const ordersRef = ref(db, 'orders');
    const snapshot = await get(ordersRef);
    if (snapshot.exists()) {
      const allUsersOrders = snapshot.val();
      const allOrders: Order[] = [];
      
      // Iterate over each user's collection of orders
      for (const userId in allUsersOrders) {
        const userOrders = allUsersOrders[userId];
        // Iterate over each order for that user
        for (const orderId in userOrders) {
          allOrders.push({
            id: orderId,
            ...userOrders[orderId],
          });
        }
      }
      // Sort all collected orders by creation date, newest first
      return allOrders.sort((a, b) => b.createdAt - a.createdAt);
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
 * Fetches all orders for a specific user from their dedicated path.
 * @param userId The UID of the user whose orders are to be fetched.
 * @returns A promise that resolves to an array of the user's orders.
 */
export async function fetchUserOrders(userId: string): Promise<Order[]> {
  if (!userId) {
    return [];
  }
  try {
    const userOrdersRef = ref(db, `orders/${userId}`);
    const snapshot = await get(userOrdersRef);

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
