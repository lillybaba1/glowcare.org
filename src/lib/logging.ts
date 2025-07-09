
'use server';
import { db } from './firebase';
import { ref, push, set } from 'firebase/database';

export type AdminEventType = 'NEW_ORDER' | 'ID_VERIFICATION_FAILED' | 'NEW_USER_REGISTRATION';

/**
 * Logs a significant event to the database for admin review.
 * This is a server action and is intended to be called from client components.
 * The associated Firebase rule should allow writes from any authenticated user.
 * @param type The type of event.
 * @param message A human-readable message describing the event.
 * @param data Optional additional data related to the event.
 */
export async function logAdminEvent(
  type: AdminEventType,
  message: string,
  data: object = {}
) {
  try {
    const eventsLogRef = ref(db, 'events_log');
    const newEventRef = push(eventsLogRef);
    await set(newEventRef, {
      type,
      message,
      data,
      createdAt: Date.now(),
    });
  } catch (error) {
    // We don't want to break the user flow if logging fails.
    // Log the error to the server console for debugging.
    console.error('Failed to log admin event:', error);
  }
}
