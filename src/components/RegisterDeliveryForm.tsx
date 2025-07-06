import React, { useState } from 'react';
import styles from './RegisterDeliveryForm.module.css';
import { useTranslation } from 'react-i18next';

interface RegisterDeliveryFormProps {
  onAddDelivery: (delivery: { apartment: string; recipientName: string; courier: string }) => void;
}

const RegisterDeliveryForm: React.FC<RegisterDeliveryFormProps> = ({ onAddDelivery }) => {
  const [apartment, setApartment] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [courier, setCourier] = useState('');
  const [otherCourier, setOtherCourier] = useState('');
  const { t } = useTranslation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apartment || !recipientName || (!courier && !otherCourier)) {
      alert(t('fill_required_fields'));
      return;
    }

    const finalCourier = courier === t('other') ? otherCourier : courier;

    onAddDelivery({ apartment, recipientName, courier: finalCourier });
    setApartment('');
    setRecipientName('');
    setCourier('');
    setOtherCourier('');
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h2 className={styles.formTitle}>{t('register_new_delivery_title')}</h2>
      <div className={styles.formGroup}>
        <label htmlFor="apartment">{t('apartment_label')}</label>
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
        <label htmlFor="recipientName">{t('recipient_name_label')}</label>
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
        <label htmlFor="courier">{t('courier_label')}</label>
        <select
          id="courier"
          value={courier}
          onChange={(e) => setCourier(e.target.value)}
          className={styles.select}
          required
        >
          <option value="">{t('select_courier')}</option>
          <option value="Mercado Libre">{t('mercadolibre')}</option>
          <option value="Chilexpress">{t('chilexpress')}</option>
          <option value="Blue Express">{t('blue_express')}</option>
          <option value="Correos de Chile">{t('correos_de_chile')}</option>
          <option value={t('other')}>{t('other')}</option>
        </select>
      </div>
      {courier === t('other') && (
        <div className={styles.formGroup}>
          <label htmlFor="otherCourier">{t('specify_other_courier')}</label>
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
      <button type="submit" className={styles.submitButton}>{t('register_button_delivery')}</button>
    </form>
  );
};

export default RegisterDeliveryForm;
