import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged, signOut, type User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db, app } from './firebaseConfig';
import VisitorManagementPage from './components/VisitorManagementPage';
import AdminAuth from './components/AdminAuth';
import Navbar from './components/Navbar'; // Import the Navbar component
import './global.css';
import './App.css';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const docRef = doc(db, "authorizedAdmins", currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setIsAuthorized(true);
        } else {
          setIsAuthorized(false);
          await signOut(auth); // Sign out unauthorized users
        }
        }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div>Cargando...</div>;
  }

  const handleLogout = async () => {
    try {
      const auth = getAuth(app);
      await signOut(auth);
      navigate('/admin');
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <Router>
      <div className="App">
        <Navbar onLogout={handleLogout} /> {/* Add the Navbar component here */}
        <Routes>
          <Route path="/admin" element={<AdminAuth />} />
          <Route
            path="/"
            element={user && isAuthorized ? <VisitorManagementPage /> : <Navigate to="/admin" replace />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
