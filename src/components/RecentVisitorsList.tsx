import React from 'react';
import styles from './RecentVisitorsList.module.css';

interface Visitor {
  id: string;
  name: string;
  rut: string;
  apartment: string;
  entryTime: number;
  exitTime: number | null;
  status: 'En el edificio' | 'Salió';
}

interface RecentVisitorsListProps {
  visitors: Visitor[];
}

const RecentVisitorsList: React.FC<RecentVisitorsListProps> = ({ visitors }) => {
  const sortedVisitors = [...visitors].sort((a, b) => b.entryTime - a.entryTime);

  const formatTime = (timestamp: number | null) => {
    return timestamp ? new Date(timestamp).toLocaleString() : 'N/A';
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Historial de Visitas</h2>
      {sortedVisitors.length === 0 ? (
        <p className={styles.noVisitors}>No hay visitas registradas aún.</p>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>RUT</th>
                <th>Apartamento</th>
                <th>Hora de Entrada</th>
                <th>Hora de Salida</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {sortedVisitors.map(visitor => (
                <tr key={visitor.id}>
                  <td>{visitor.name}</td>
                  <td>{visitor.rut}</td>
                  <td>{visitor.apartment}</td>
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
