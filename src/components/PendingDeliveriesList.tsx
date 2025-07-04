import React, { useState } from 'react';
import styles from './PendingDeliveriesList.module.css';
import Modal from './Modal';

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

interface PendingDeliveriesListProps {
  deliveries: Delivery[];
  onMarkAsPickedUp: (deliveryId: string, retrievedByName: string) => void;
}

const PendingDeliveriesList: React.FC<PendingDeliveriesListProps> = ({ deliveries, onMarkAsPickedUp }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDeliveryId, setSelectedDeliveryId] = useState<string | null>(null);
  const [retrievedByName, setRetrievedByName] = useState('');

  const pendingDeliveries = deliveries.filter(d => d.status === 'Pendiente de retiro');

  const filteredDeliveries = pendingDeliveries.filter(delivery =>
    delivery.apartment.toLowerCase().includes(searchTerm.toLowerCase()) ||
    delivery.recipientName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
    const year = date.getFullYear();
    const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `${day}/${month}/${year} ${time}`;
  };

  const handleMarkPickupClick = (deliveryId: string) => {
    setSelectedDeliveryId(deliveryId);
    setIsModalOpen(true);
  };

  const handleConfirmPickup = () => {
    if (selectedDeliveryId && retrievedByName) {
      onMarkAsPickedUp(selectedDeliveryId, retrievedByName);
      setIsModalOpen(false);
      setSelectedDeliveryId(null);
      setRetrievedByName('');
    } else {
      alert('Por favor, ingrese el nombre de la persona que retira.');
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Encomiendas Pendientes</h2>
      <input
        type="text"
        placeholder="Buscar por departamento o destinatario..."
        className={styles.searchInput}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      {filteredDeliveries.length === 0 ? (
        <p className={styles.noDeliveries}>No hay encomiendas pendientes en este momento.</p>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Apartamento</th>
                <th>Destinatario</th>
                <th>Remitente</th>
                <th>Fecha de Llegada</th>
                <th>Estado</th>
                <th>Acciones</th>
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
                      {delivery.status}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => handleMarkPickupClick(delivery.id)}
                      className={styles.pickupButton}
                    >
                      Entregar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <h2>Confirmar Entrega</h2>
        <div className={styles.formGroup}>
          <label htmlFor="retrievedBy">Nombre de quien retira:</label>
          <input
            type="text"
            id="retrievedBy"
            value={retrievedByName}
            onChange={(e) => setRetrievedByName(e.target.value)}
            className={styles.input}
            required
          />
        </div>
        <button onClick={handleConfirmPickup} className={styles.confirmButton}>Confirmar</button>
      </Modal>
    </div>
  );
};

export default PendingDeliveriesList;
