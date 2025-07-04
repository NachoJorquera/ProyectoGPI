import React, { useState } from 'react';
import styles from './ActiveVisitorsList.module.css';

interface Visitor {
  id: string;
  name: string;
  rut: string;
  apartment: string;
  entryTime: number;
  exitTime: number | null;
  status: 'En el edificio' | 'Salió';
}

interface ActiveVisitorsListProps {
  visitors: Visitor[];
  onMarkExit: (visitorId: string) => void;
}

const ActiveVisitorsList: React.FC<ActiveVisitorsListProps> = ({ visitors, onMarkExit }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const activeVisitors = visitors.filter(v => v.status === 'En el edificio');

  const filteredVisitors = activeVisitors.filter(visitor =>
    visitor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    visitor.rut.toLowerCase().includes(searchTerm.toLowerCase()) ||
    visitor.apartment.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Visitantes Activos</h2>
      <input
        type="text"
        placeholder="Buscar por nombre, RUT o apartamento..."
        className={styles.searchInput}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      {filteredVisitors.length === 0 ? (
        <p className={styles.noVisitors}>No hay visitantes activos en este momento.</p>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>RUT</th>
                <th>Apartamento</th>
                <th>Hora de Entrada</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredVisitors.map(visitor => (
                <tr key={visitor.id}>
                  <td>{visitor.name}</td>
                  <td>{visitor.rut}</td>
                  <td>{visitor.apartment}</td>
                  <td>{formatTime(visitor.entryTime)}</td>
                  <td>
                    <span className={`${styles.statusBadge} ${visitor.status === 'En el edificio' ? styles.active : styles.exited}`}>
                      {visitor.status}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => onMarkExit(visitor.id)}
                      className={styles.exitButton}
                    >
                      Marcar Salida
                    </button>
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

export default ActiveVisitorsList;
