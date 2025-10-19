// src/lib/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBjvU60DVPzad8YeejTLovwSuruKL7FG34",
  authDomain: "echomind-pro-launch.firebaseapp.com",
  projectId: "echomind-pro-launch",
  storageBucket: "echomind-pro-launch.firebasestorage.app",
  messagingSenderId: "643933689359",
  appId: "1:643933689359:web:ff44d8beb1947a1404357a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

export default app;
