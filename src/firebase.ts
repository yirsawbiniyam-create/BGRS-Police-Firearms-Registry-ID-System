import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  initializeFirestore, 
  getFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager,
  Firestore 
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

export const firebaseConfig = {
  apiKey: "AIzaSyCpd5LW_sIXI1zSqMdhYRT3ZE2bGaxSXI4",
  authDomain: "fregistry-id-system.firebaseapp.com",
  projectId: "fregistry-id-system",
  storageBucket: "fregistry-id-system.firebasestorage.app",
  messagingSenderId: "508405206781",
  appId: "1:508405206781:web:eddcd80043477257013894",
  measurementId: "G-RH806FH2HF"
};

// Initialize Firebase App safely
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firestore with IndexedDB persistent local cache
// Enables instant sub-second retrieval of stored registrations, photos, logos, and flags
let firestoreInstance: Firestore;
try {
  firestoreInstance = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager()
    })
  });
} catch {
  // Fallback if already initialized or private browsing restrictions
  firestoreInstance = getFirestore(app);
}

export const db: Firestore = firestoreInstance;
export const auth = getAuth(app);

