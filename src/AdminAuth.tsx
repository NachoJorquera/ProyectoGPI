import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { db, app } from './firebaseConfig';
import styles from './AdminAuth.module.css';


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

const AdminAuth: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (isRegistering) {
      if (password !== confirmPassword) {
        setError('Las contraseñas no coinciden.');
        return;
      }
      if (password.length < 6) {
        setError('La contraseña debe tener un mínimo de 6 caracteres.');
        return;
      }
    }

    const auth = getAuth(app);
    try {
      if (isRegistering) {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password,
        );
        await setDoc(doc(db, 'authorizedAdmins', userCredential.user.uid), {
          name: name,
          email: email,
        });
        alert('Registro exitoso. Ahora puedes iniciar sesión.');
        setIsRegistering(false);
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setName('');
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        navigate('/');
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError('Error: Revisa tu email y contraseña.');
      } else {
        setError('Ocurrió un error desconocido.');
      }
    }
  };

  const renderLoginForm = () => (
    <>
      {/* NOTA: Es mejor usar una imagen para el logo */}
      <h2 className={styles.logoTitle}>Inicio Sesión</h2>
      <form onSubmit={handleAuth} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={styles.input}
            placeholder="Ingresa tu email"
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="password">Contraseña:</label>
          <div className={styles.passwordWrapper}>
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={styles.input}
              placeholder="Ingresa tu contraseña"
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
          Ingresar
        </button>
        <button
          type="button"
          onClick={() => {
            setIsRegistering(true);
            setError(null);
          }}
          className={styles.toggleButton}
        >
          Registrarse
        </button>
      </form>
    </>
  );

  const renderRegisterForm = () => (
    <>
      <h2 className={styles.logoTitle}>Oh Client My Client</h2>
      <form onSubmit={handleAuth} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="name">Nombre completo:</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className={styles.input}
            placeholder="Pedrito Perez"
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={styles.input}
            placeholder="Ingresa tu email"
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="password">Contraseña:</label>
          <div className={styles.passwordWrapper}>
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={styles.input}
              placeholder="Ingresa tu contraseña"
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
          <label htmlFor="confirmPassword">Confirma tu contraseña:</label>
          <div className={styles.passwordWrapper}>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className={styles.input}
              placeholder="Confirma tu contraseña"
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
          Registrarse
        </button>
        <button
          type="button"
          onClick={() => {
            setIsRegistering(false);
            setError(null);
          }}
          className={styles.toggleButton}
        >
          Si ya tienes una cuenta ingresa aquí
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