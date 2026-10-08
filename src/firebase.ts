import { initializeApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
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

// Initialize Firebase App
export const app = initializeApp(firebaseConfig);
export const db: Firestore = getFirestore(app);
export const auth = getAuth(app);
