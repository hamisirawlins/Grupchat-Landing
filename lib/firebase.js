import { initializeApp, getApp } from 'firebase/app';
import { connectAuthEmulator, getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
let app;
try {
  app = initializeApp(firebaseConfig);
} catch (error) {
  // If Firebase is already initialized, get the existing app
  if (error.code === 'app/duplicate-app') {
    app = getApp();
  } else {
    console.error('Firebase initialization error:', error);
    throw error;
  }
}

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Local runs against the Auth emulator (KB 10 P0.5, KB 40): NEXT_PUBLIC_USE_EMULATOR=1.
// Never set in a deployment.
if (process.env.NEXT_PUBLIC_USE_EMULATOR === '1' && typeof window !== 'undefined' && !auth.emulatorConfig) {
  connectAuthEmulator(auth, process.env.NEXT_PUBLIC_AUTH_EMULATOR_URL || 'http://127.0.0.1:9099', { disableWarnings: true });
}
export const storage = getStorage(app);

export default app;
