/**
 * Firebase Client SDK Configuration (Client-side Only)
 * Architecture rule: 100% Client-Side Firebase SDK, Zero SSR API routes.
 * Scoped path: users/{uid}/venues/{venueId}/bookings/{bookingId}
 */

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { 
  getFirestore, 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager,
  Firestore 
} from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBEoutI2ZfEDyj8T9v_naoYkBMKHESDHkk",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "its-my-booking.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "its-my-booking",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "its-my-booking.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "696716675539",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:696716675539:web:802229d84f9b7b19794726"
};

export const isFirebaseConfigured = true;

let app: FirebaseApp | undefined;
let db: Firestore | undefined;
let auth: Auth | undefined;

if (typeof window !== 'undefined') {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
    try {
      db = initializeFirestore(app, {
        localCache: persistentLocalCache({
          tabManager: persistentMultipleTabManager()
        })
      });
    } catch {
      db = getFirestore(app);
    }
    auth = getAuth(app);
  } else {
    app = getApp();
    db = getFirestore(app);
    auth = getAuth(app);
  }
}

export { app, db, auth, firebaseConfig };
