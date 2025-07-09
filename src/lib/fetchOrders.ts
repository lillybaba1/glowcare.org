
import type { Order } from './types';
import { db } from './firebase';
import { ref, get } from 'firebase/database';


/**
 * Fetches all orders from the database. Intended for admin use only.
 * This function iterates through all user-nested orders.
 * @returns A promise that resolves to an array of all orders.
 */
export async function fetchAdminOrders(): Promise<Order[]> {
  try {
    const ordersRef = ref(db, 'orders');
    const snapshot = await get(ordersRef);
    if (snapshot.exists()) {
      const allUsersOrders = snapshot.val(); // This is { userId1: { orderIdA: {...} }, userId2: ... }
      const allOrders: Order[] = [];
      
      Object.keys(allUsersOrders).forEach(userId => {
        const userOrders = allUsersOrders[userId];
        if (userOrders) {
          Object.keys(userOrders).forEach(orderId => {
              allOrders.push({
                  id: orderId,
                  ...userOrders[orderId],
                  // Ensure the customer object has the userId, which is crucial for routing
                  customer: { ...userOrders[orderId].customer, userId: userId }
              });
          });
        }
      });
      
      return allOrders.sort((a, b) => b.createdAt - a.createdAt);
    }
    return [];
  } catch (error) {
    console.error("Error fetching admin orders:", error);
    throw new Error("Failed to fetch all orders. You may not have permission.");
  }
}

/**
 * Fetches all orders for a specific user from their designated path.
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
    throw new Error("Could not fetch your orders. Please try again later.");
  }
}
