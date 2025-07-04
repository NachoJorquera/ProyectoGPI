import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { app } from './firebaseConfig'; // Import the Firebase app instance
import { getAuth } from 'firebase/auth'; // Import getAuth

// Initialize Firebase Auth with the app instance to ensure configuration is loaded early
getAuth(app);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
