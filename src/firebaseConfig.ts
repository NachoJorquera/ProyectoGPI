// src/firebaseConfig.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDjsWbBQno0LyVFz8KYznQ3UiCqTsPxrWM",
  authDomain: "admincontrol-37268.firebaseapp.com",
  projectId: "admincontrol-37268",
  storageBucket: "admincontrol-37268.firebasestorage.app",
  messagingSenderId: "973118210194",
  appId: "1:973118210194:web:2fd48c81f96bd7bdd7264b",
  measurementId: "G-Y14BHLXBFY"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

export { app, db, analytics };
