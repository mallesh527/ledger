import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, onSnapshot, setDoc } from 'firebase/firestore';
import type { AppState } from './types';

// Read Firebase configuration from environment variables or use fallback demo config
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDemoKeyForLedgerAppSync12345",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "ledger-app-sync.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "ledger-app-sync",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "ledger-app-sync.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789012",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789012:web:demo123456789"
};

// Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app);

/**
 * Realtime sync listener for a given Sync Key (Ledger ID)
 */
export function subscribeToLedger(
  syncKey: string,
  onData: (state: AppState) => void,
  onError?: (err: Error) => void
) {
  const docRef = doc(db, 'ledgers', syncKey);

  const unsubscribe = onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data && Array.isArray(data.people) && Array.isArray(data.transactions)) {
          onData({
            people: data.people,
            transactions: data.transactions,
          });
        }
      }
    },
    (error) => {
      console.warn('Firebase snapshot subscription error (falling back to local storage):', error.message);
      if (onError) onError(error);
    }
  );

  return unsubscribe;
}

/**
 * Save / Push entire ledger state to Firestore cloud
 */
export async function pushLedgerToCloud(syncKey: string, state: AppState) {
  try {
    const docRef = doc(db, 'ledgers', syncKey);
    await setDoc(
      docRef,
      {
        people: state.people,
        transactions: state.transactions,
        updatedAt: Date.now(),
      },
      { merge: true }
    );
  } catch (error) {
    console.error('Error syncing ledger to Firebase cloud:', error);
  }
}
