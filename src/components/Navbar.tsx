import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import styles from './Navbar.module.css';

interface NavbarProps {
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onLogout }) => {
  const [language, setLanguage] = useState<'es' | 'en'>('es');

  const toggleLanguage = () => {
    setLanguage(prevLang => (prevLang === 'es' ? 'en' : 'es'));
    // Here you would typically update a context or global state for language
    // and trigger re-renders of components that use translated text.
    console.log(`Language changed to: ${language === 'es' ? 'en' : 'es'}`);
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.navbarBrand}>
        <Link to="/">Oh Client My Client!</Link>
      </div>
      <div className={styles.navbarCenterLinks}>
        <NavLink to="/visitas" className={({ isActive }) => isActive ? styles.activeLink : styles.navLink}>
          Visitas
        </NavLink>
        <NavLink to="/encomiendas" className={({ isActive }) => isActive ? styles.activeLink : styles.navLink}>
          Encomiendas
        </NavLink>
      </div>
      <div className={styles.navbarRightButtons}>
        <button onClick={toggleLanguage} className={styles.languageButton}>
          {language === 'es' ? 'English' : 'Español'}
        </button>
        <button onClick={onLogout} className={styles.logoutButton}>
          Cerrar Sesión
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
