import React, { useState } from 'react';
import styles from './DeliveryHistoryList.module.css';
import { useTranslation } from 'react-i18next';

// Interfaz para definir la estructura de un objeto de encomienda.
interface Delivery {
  id: string;
  apartment: string;
  recipientName: string;
  courier: string;
  status: 'Pendiente de retiro' | 'Retirado';
  arrivalTimestamp: number;
  pickupTimestamp: number | null;
  retrievedBy: string | null;
}

// Interfaz para definir las propiedades del componente DeliveryHistoryList.
interface DeliveryHistoryListProps {
  deliveries: Delivery[];
}

// Componente para mostrar el historial de encomiendas.
const DeliveryHistoryList: React.FC<DeliveryHistoryListProps> = ({ deliveries }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const { t } = useTranslation();

  // Ordena las encomiendas por fecha de llegada.
  const sortedDeliveries = [...deliveries].sort((a, b) => b.arrivalTimestamp - a.arrivalTimestamp);

  // Filtra las encomiendas según el término de búsqueda.
  const filteredDeliveries = sortedDeliveries.filter(delivery =>
    delivery.apartment.toLowerCase().includes(searchTerm.toLowerCase()) ||
    delivery.recipientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    delivery.courier.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Formatea la fecha y hora.
  const formatTime = (timestamp: number | null) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // El mes es en base 0.
    const year = date.getFullYear();
    const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `${day}/${month}/${year} ${time}`;
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>{t('delivery_history_list_title')}</h2>
      <input
        type="text"
        placeholder={t('search_delivery_history_placeholder')}
        className={styles.searchInput}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      {filteredDeliveries.length === 0 ? (
        <p className={styles.noDeliveries}>{t('no_deliveries_registered')}</p>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>{t('apartment_table_header_delivery')}</th>
                <th>{t('recipient_table_header')}</th>
                <th>{t('sender_table_header')}</th>
                <th>{t('arrival_table_header')}</th>
                <th>{t('status_table_header_delivery')}</th>
                <th>{t('picked_up_by_table_header')}</th>
                <th>{t('delivery_date_table_header')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredDeliveries.map(delivery => (
                <tr key={delivery.id}>
                  <td>{delivery.apartment}</td>
                  <td>{delivery.recipientName}</td>
                  <td>{delivery.courier}</td>
                  <td>{formatTime(delivery.arrivalTimestamp)}</td>
                  <td>
                    <span className={`${styles.statusBadge} ${delivery.status === 'Pendiente de retiro' ? styles.pending : styles.retirado}`}>
                      {delivery.status === 'Pendiente de retiro' ? t('status_pending_pickup') : t('status_picked_up')}
                    </span>
                  </td>
                  <td>{delivery.retrievedBy || 'N/A'}</td>
                  <td>{formatTime(delivery.pickupTimestamp)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DeliveryHistoryList;
