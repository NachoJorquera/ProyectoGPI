import React, { useState } from 'react';
import styles from './DeliveryHistoryList.module.css';

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

interface DeliveryHistoryListProps {
  deliveries: Delivery[];
}

const DeliveryHistoryList: React.FC<DeliveryHistoryListProps> = ({ deliveries }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const sortedDeliveries = [...deliveries].sort((a, b) => b.arrivalTimestamp - a.arrivalTimestamp);

  const filteredDeliveries = sortedDeliveries.filter(delivery =>
    delivery.apartment.toLowerCase().includes(searchTerm.toLowerCase()) ||
    delivery.recipientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    delivery.courier.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatTime = (timestamp: number | null) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
    const year = date.getFullYear();
    const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `${day}/${month}/${year} ${time}`;
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Historial de Encomiendas</h2>
      <input
        type="text"
        placeholder="Buscar por departamento, destinatario o remitente..."
        className={styles.searchInput}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      {filteredDeliveries.length === 0 ? (
        <p className={styles.noDeliveries}>No hay encomiendas registradas aún.</p>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Apartamento</th>
                <th>Destinatario</th>
                <th>Remitente</th>
                <th>Llegada</th>
                <th>Estado</th>
                <th>Retirado Por</th>
                <th>Fecha de Entrega</th>
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
                      {delivery.status}
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
