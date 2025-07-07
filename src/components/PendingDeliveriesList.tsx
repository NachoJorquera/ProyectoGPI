import React, { useState } from 'react';
import styles from './PendingDeliveriesList.module.css';
import Modal from './Modal';
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

// Interfaz para definir las propiedades del componente PendingDeliveriesList.
interface PendingDeliveriesListProps {
  deliveries: Delivery[];
  onMarkAsPickedUp: (deliveryId: string, retrievedByName: string) => void;
}

// Componente para mostrar la lista de encomiendas pendientes.
const PendingDeliveriesList: React.FC<PendingDeliveriesListProps> = ({ deliveries, onMarkAsPickedUp }) => {
  // Estados para el término de búsqueda, el modal y el nombre de quien retira.
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDeliveryId, setSelectedDeliveryId] = useState<string | null>(null);
  const [retrievedByName, setRetrievedByName] = useState('');
  const { t } = useTranslation();

  // Filtra las encomiendas para mostrar solo las pendientes.
  const pendingDeliveries = deliveries.filter(d => d.status === 'Pendiente de retiro');

  // Filtra las encomiendas pendientes según el término de búsqueda.
  const filteredDeliveries = pendingDeliveries.filter(delivery =>
    delivery.apartment.toLowerCase().includes(searchTerm.toLowerCase()) ||
    delivery.recipientName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Formatea la fecha y hora.
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // El mes es en base 0.
    const year = date.getFullYear();
    const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `${day}/${month}/${year} ${time}`;
  };

  // Maneja el clic en el botón de marcar como retirado.
  const handleMarkPickupClick = (deliveryId: string) => {
    setSelectedDeliveryId(deliveryId);
    setIsModalOpen(true);
  };

  // Confirma el retiro de la encomienda.
  const handleConfirmPickup = () => {
    if (selectedDeliveryId && retrievedByName) {
      onMarkAsPickedUp(selectedDeliveryId, retrievedByName);
      setIsModalOpen(false);
      setSelectedDeliveryId(null);
      setRetrievedByName('');
    } else {
      alert(t('enter_retriever_name'));
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>{t('pending_deliveries_title')}</h2>
      <input
        type="text"
        placeholder={t('search_delivery_placeholder')}
        className={styles.searchInput}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      {filteredDeliveries.length === 0 ? (
        <p className={styles.noDeliveries}>{t('no_pending_deliveries')}</p>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>{t('apartment_table_header_delivery')}</th>
                <th>{t('recipient_table_header')}</th>
                <th>{t('sender_table_header')}</th>
                <th>{t('arrival_date_table_header')}</th>
                <th>{t('status_table_header_delivery')}</th>
                <th>{t('actions_table_header')}</th>
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
                    <span className={`${styles.statusBadge} ${styles.pending}`}>
                      {delivery.status === 'Pendiente de retiro' ? t('status_pending_pickup') : t('status_picked_up')}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => handleMarkPickupClick(delivery.id)}
                      className={styles.pickupButton}
                    >
                      {t('deliver_button')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <h2>{t('confirm_delivery_title')}</h2>
        <div className={styles.formGroup}>
          <label htmlFor="retrievedBy">{t('retrieved_by_label')}</label>
          <input
            type="text"
            id="retrievedBy"
            value={retrievedByName}
            onChange={(e) => setRetrievedByName(e.target.value)}
            className={styles.input}
            required
          />
        </div>
        <button onClick={handleConfirmPickup} className={styles.confirmButton}>{t('confirm_button')}</button>
      </Modal>
    </div>
  );
};

export default PendingDeliveriesList;
