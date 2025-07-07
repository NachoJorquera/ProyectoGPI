import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { db, app } from '../firebaseConfig';
import styles from './AdminAuth.module.css';
import { useTranslation } from 'react-i18next';


// Icono de Ojo (Visible)
const EyeIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>
);

// Icono de Ojo Tachado (Oculto)
const EyeOffIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
    <line x1="1" y1="1" x2="23" y2="23"></line>
  </svg>
);

// Componente para la autenticación de administradores.
const AdminAuth: React.FC = () => {
  // Estados para el formulario de autenticación.
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Maneja la autenticación (registro o inicio de sesión).
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validaciones para el registro.
    if (isRegistering) {
      if (password !== confirmPassword) {
        setError(t('password_mismatch'));
        return;
      }
      if (password.length < 6) {
        setError(t('password_min_length'));
        return;
      }
    }

    const auth = getAuth(app);
    try {
      if (isRegistering) {
        // Crea un nuevo usuario administrador.
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password,
        );
        await setDoc(doc(db, 'authorizedAdmins', userCredential.user.uid), {
          name: name,
          email: email,
        });
        alert(t('registration_success'));
        setIsRegistering(false);
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setName('');
      } else {
        // Inicia sesión con un usuario existente.
        await signInWithEmailAndPassword(auth, email, password);
        navigate('/');
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(t('auth_error'));
      } else {
        setError(t('unknown_error'));
      }
    }
  };

  // Renderiza el formulario de inicio de sesión.
  const renderLoginForm = () => (
    <>
      {/* NOTA: Es mejor usar una imagen para el logo */}
      <h2 className={styles.logoTitle}>{t('login_title')}</h2>
      <form onSubmit={handleAuth} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="email">{t('email_label')}</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={styles.input}
            placeholder={t('email_placeholder')}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="password">{t('password_label')}</label>
          <div className={styles.passwordWrapper}>
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={styles.input}
              placeholder={t('password_placeholder')}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className={styles.togglePasswordButton}
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
        </div>
        {error && <p className={styles.error}>{error}</p>}
        <button type="submit" className={styles.button}>
          {t('login_button')}
        </button>
        <button
          type="button"
          onClick={() => {
            setIsRegistering(true);
            setError(null);
          }}
          className={styles.toggleButton}
        >
          {t('register_button')}
        </button>
      </form>
    </>
  );

  // Renderiza el formulario de registro.
  const renderRegisterForm = () => (
    <>
      <h2 className={styles.logoTitle}>{t('new_admin_title')}</h2>
      <form onSubmit={handleAuth} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="name">{t('full_name_label')}</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className={styles.input}
            placeholder={t('full_name_placeholder')}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="email">{t('email_label')}</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={styles.input}
            placeholder={t('email_placeholder')}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="password">{t('password_label')}</label>
          <div className={styles.passwordWrapper}>
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={styles.input}
              placeholder={t('password_placeholder')}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className={styles.togglePasswordButton}
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="confirmPassword">{t('confirm_password_label')}</label>
          <div className={styles.passwordWrapper}>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className={styles.input}
              placeholder={t('confirm_password_placeholder')}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className={styles.togglePasswordButton}
            >
              {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
        </div>
        {error && <p className={styles.error}>{error}</p>}
        <button type="submit" className={styles.button}>
          {t('register_button')}
        </button>
        <button
          type="button"
          onClick={() => {
            setIsRegistering(false);
            setError(null);
          }}
          className={styles.toggleButton}
        >
          {t('already_have_account')}
        </button>
      </form>
    </>
  );

  return (
    <div className={styles.container}>
      {isRegistering ? renderRegisterForm() : renderLoginForm()}
    </div>
  );
};

export default AdminAuth;