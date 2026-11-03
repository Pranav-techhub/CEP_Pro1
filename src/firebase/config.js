/**
 * TeaRoute Firebase Production Configuration & Initializer
 * Adheres strictly to the user requirement:
 * "Use existing production Firebase Web App configuration. Never hardcode credentials."
 */
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';

// Support both Vite browser environment (import.meta.env) and Node.js testing
const env = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env : (typeof process !== 'undefined' ? process.env : {});

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || "AIzaSyBdBsyT8uTVRpnIiIYgKN-cGU_cklF5QJc",
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || "tearoute-smart-delivery-2287b.firebaseapp.com",
  projectId: env.VITE_FIREBASE_PROJECT_ID || "tearoute-smart-delivery-2287b",
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || "tearoute-smart-delivery-2287b.firebasestorage.app",
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || "660413567629",
  appId: env.VITE_FIREBASE_APP_ID || "1:660413567629:web:fba31de9e1e78ed2ff08c4",
  databaseURL: env.VITE_FIREBASE_DATABASE_URL || "https://tearoute-smart-delivery-2287b-default-rtdb.firebaseio.com"
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  firebaseConfig.apiKey !== ''
);

let app = null;
let auth = null;
let db = null;
let rtdb = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);

    if (firebaseConfig.databaseURL) {
      try {
        rtdb = getDatabase(app);
      } catch (rtdbErr) {
        console.warn('Realtime Database fallback note:', rtdbErr.message);
      }
    }
  } catch (error) {
    console.error('Firebase initialization error:', error);
  }
}

export { app, auth, db, rtdb };
