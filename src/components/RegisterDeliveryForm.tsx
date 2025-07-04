import React, { useState } from 'react';
import styles from './RegisterDeliveryForm.module.css';

interface RegisterDeliveryFormProps {
  onAddDelivery: (delivery: { apartment: string; recipientName: string; courier: string }) => void;
}

const RegisterDeliveryForm: React.FC<RegisterDeliveryFormProps> = ({ onAddDelivery }) => {
  const [apartment, setApartment] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [courier, setCourier] = useState('');
  const [otherCourier, setOtherCourier] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apartment || !recipientName || (!courier && !otherCourier)) {
      alert('Por favor, complete todos los campos obligatorios.');
      return;
    }

    const finalCourier = courier === 'Otro...' ? otherCourier : courier;

    onAddDelivery({ apartment, recipientName, courier: finalCourier });
    setApartment('');
    setRecipientName('');
    setCourier('');
    setOtherCourier('');
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h2 className={styles.formTitle}>Registrar Nueva Encomienda</h2>
      <div className={styles.formGroup}>
        <label htmlFor="apartment">Departamento:</label>
        <input
          type="text"
          id="apartment"
          value={apartment}
          onChange={(e) => setApartment(e.target.value)}
          className={styles.input}
          required
        />
      </div>
      <div className={styles.formGroup}>
        <label htmlFor="recipientName">Destinatario:</label>
        <input
          type="text"
          id="recipientName"
          value={recipientName}
          onChange={(e) => setRecipientName(e.target.value)}
          className={styles.input}
          required
        />
      </div>
      <div className={styles.formGroup}>
        <label htmlFor="courier">Remitente / Courier:</label>
        <select
          id="courier"
          value={courier}
          onChange={(e) => setCourier(e.target.value)}
          className={styles.input}
          required
        >
          <option value="">Seleccione un courier</option>
          <option value="Mercado Libre">Mercado Libre</option>
          <option value="Chilexpress">Chilexpress</option>
          <option value="Blue Express">Blue Express</option>
          <option value="Correos de Chile">Correos de Chile</option>
          <option value="Otro...">Otro...</option>
        </select>
      </div>
      {courier === 'Otro...' && (
        <div className={styles.formGroup}>
          <label htmlFor="otherCourier">Especificar Otro Remitente:</label>
          <input
            type="text"
            id="otherCourier"
            value={otherCourier}
            onChange={(e) => setOtherCourier(e.target.value)}
            className={styles.input}
            required
          />
        </div>
      )}
      <button type="submit" className={styles.submitButton}>Registrar</button>
    </form>
  );
};

export default RegisterDeliveryForm;
