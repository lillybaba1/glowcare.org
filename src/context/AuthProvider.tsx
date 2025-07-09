
'use client';

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { ref, get, set } from 'firebase/database';
import { auth, db } from '@/lib/firebase';
import { Loader2 } from 'lucide-react';
import type { AppUser } from '@/lib/types';

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  const isAdmin = !!appUser?.isAdmin;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        // User is logged in, fetch their role from the database.
        const userRef = ref(db, 'users/' + user.uid);
        try {
          let snapshot = await get(userRef);
          
          // Self-healing: If user exists in Auth but not DB, create their record.
          // This also fixes cases where the admin flag was missing.
          if (!snapshot.exists() || (user.email === 'heiligegeist01@gmail.com' && !snapshot.val().isAdmin)) {
            const newUserRecord: AppUser = {
              email: user.email || '',
              isAdmin: user.email === 'heiligegeist01@gmail.com',
            };
            await set(userRef, newUserRecord);
            // Re-fetch the snapshot after creating/updating it
            snapshot = await get(userRef);
          }
          setAppUser(snapshot.val());
        } catch (error) {
          console.error("Failed to fetch or create user data:", error);
          setAppUser(null);
        } finally {
          // Ensure loading is set to false only after all async operations are complete.
          setLoading(false);
        }
      } else {
        // User is signed out
        setAppUser(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const value = { user, isAdmin, loading };

  if (loading) {
      return (
          <div className="flex h-screen items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin" />
          </div>
      );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
