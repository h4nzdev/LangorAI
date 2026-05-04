'use client';

import { doc, getDoc, setDoc, Firestore } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';

export interface UserProfile {
  displayName: string;
  avatar: string;
  level: string;
  goal: string;
  streak: number;
  totalMinutes: number;
  sessionsCount: number;
  subscription: 'basic' | 'pro';
}

/**
 * Service to manage User Profile data in Firestore.
 */
export const UserService = {
  /**
   * Fetches the user profile from Firestore.
   */
  async getProfile(db: Firestore, userId: string): Promise<UserProfile | null> {
    const docRef = doc(db, 'users', userId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
    return null;
  },

  /**
   * Saves or updates the user profile in Firestore.
   */
  saveProfile(db: Firestore, userId: string, profile: Partial<UserProfile>) {
    const docRef = doc(db, 'users', userId);
    
    setDoc(docRef, profile, { merge: true })
      .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: docRef.path,
          operation: 'update',
          requestResourceData: profile,
        } satisfies SecurityRuleContext);

        errorEmitter.emit('permission-error', permissionError);
      });
  }
};
