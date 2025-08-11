import { initializeApp, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBPBPL-VN54pnr5VW0IuEngjQfc-RPeSFw",
  authDomain: "grupchat-prod-3ab64.firebaseapp.com",
  projectId: "grupchat-prod-3ab64",
  storageBucket: "grupchat-prod-3ab64.firebasestorage.app",
  messagingSenderId: "706409278280",
  appId: "1:706409278280:web:ed42ccb6e4a1081b25e17d",
  measurementId: "G-Y8S2BQ4N81"
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

export default app;
