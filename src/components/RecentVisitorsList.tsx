import React, { useState } from 'react';
import styles from './RecentVisitorsList.module.css';

interface Visitor {
  id: string;
  name: string;
  rut: string;
  apartment: string;
  entryTime: number;
  exitTime: number | null;
  status: 'En el edificio' | 'Salió';
  licensePlate: string | null;
  parkingSpotId: string | null;
}

interface RecentVisitorsListProps {
  visitors: Visitor[];
}

const RecentVisitorsList: React.FC<RecentVisitorsListProps> = ({ visitors }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const sortedVisitors = [...visitors].sort((a, b) => b.entryTime - a.entryTime);

  const filteredVisitors = sortedVisitors.filter(visitor =>
    visitor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    visitor.rut.toLowerCase().includes(searchTerm.toLowerCase()) ||
    visitor.apartment.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatTime = (timestamp: number | null) => {
    return timestamp ? new Date(timestamp).toLocaleString() : 'N/A';
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Historial de Visitas</h2>
      <input
        type="text"
        placeholder="Buscar por nombre, RUT o apartamento..."
        className={styles.searchInput}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      {filteredVisitors.length === 0 ? (
        <p className={styles.noVisitors}>No hay visitas registradas aún.</p>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>RUT</th>
                <th>Apartamento</th>
                <th>Patente</th>
                <th>Estacionamiento</th>
                <th>Hora de Entrada</th>
                <th>Hora de Salida</th>
              </tr>
            </thead>
            <tbody>
              {filteredVisitors.map(visitor => (
                <tr key={visitor.id}>
                  <td>{visitor.name}</td>
                  <td>{visitor.rut}</td>
                  <td>{visitor.apartment}</td>
                  <td>{visitor.licensePlate || 'N/A'}</td>
                  <td>{formatTime(visitor.entryTime)}</td>
                  <td>{formatTime(visitor.exitTime)}</td>
                  <td>
                    <span className={`${styles.statusBadge} ${visitor.status === 'En el edificio' ? styles.active : styles.exited}`}>
                      {visitor.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RecentVisitorsList;
