// src/firebaseConfig.ts
// Importaciones necesarias de Firebase.
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Configuración de Firebase para el proyecto.
const firebaseConfig = {
  apiKey: "AIzaSyDjsWbBQno0LyVFz8KYznQ3UiCqTsPxrWM",
  authDomain: "admincontrol-37268.firebaseapp.com",
  projectId: "admincontrol-37268",
  storageBucket: "admincontrol-37268.firebasestorage.app",
  messagingSenderId: "973118210194",
  appId: "1:973118210194:web:2fd48c81f96bd7bdd7264b",
  measurementId: "G-Y14BHLXBFY"
};

// Inicialización de la aplicación de Firebase.
const app = initializeApp(firebaseConfig);
// Inicialización de Analytics.
const analytics = getAnalytics(app);
// Inicialización de Firestore.
const db = getFirestore(app);

// Exportación de las instancias de Firebase para su uso en otras partes de la aplicación.
export { app, db, analytics };
