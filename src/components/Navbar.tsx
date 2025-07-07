import React from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styles from './Navbar.module.css';

// Interfaz para definir las propiedades del componente Navbar.
interface NavbarProps {
  onLogout: () => void;
}

// Componente para la barra de navegación.
const Navbar: React.FC<NavbarProps> = ({ onLogout }) => {
  const { t, i18n } = useTranslation();
  const location = useLocation();

  // Cambia el idioma de la aplicación.
  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.navbarBrand}>
        <Link to="/">Oh Client My Client!</Link>
      </div>
      {location.pathname !== '/admin' && (
        <div className={styles.navbarCenterLinks}>
          <NavLink to="/visitas" className={({ isActive }) => isActive ? styles.activeLink : styles.navLink}>
            {t('visitors')}
          </NavLink>
          <NavLink to="/encomiendas" className={({ isActive }) => isActive ? styles.activeLink : styles.navLink}>
            {t('deliveries')}
          </NavLink>
        </div>
      )}
      <div className={styles.navbarRightButtons}>
        <button onClick={() => changeLanguage(i18n.language === 'es' ? 'en' : 'es')} className={styles.languageButton}>
          {t(i18n.language === 'es' ? 'english' : 'spanish')}
        </button>
        {location.pathname !== '/admin' && (
          <button onClick={onLogout} className={styles.logoutButton}>
            {t('logout')}
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
