import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import App from './App.tsx'
import './index.css'
import './i18n';
import { app } from './firebaseConfig';
import { getAuth } from 'firebase/auth';
import { BrowserRouter as Router } from 'react-router-dom';

// Inicializa Firebase Auth con la instancia de la aplicación para asegurar que la configuración se cargue temprano
getAuth(app);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router>
      <App />
    </Router>
  </StrictMode>,
)
