import React, { useState } from 'react';
import styles from './ActiveVisitorsList.module.css';
import { useTranslation } from 'react-i18next';

// Interfaz para definir la estructura de un objeto de visitante.
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

// Interfaz para definir las propiedades del componente ActiveVisitorsList.
interface ActiveVisitorsListProps {
  visitors: Visitor[];
  onMarkExit: (visitorId: string) => void;
}

// Componente para mostrar la lista de visitantes activos.
const ActiveVisitorsList: React.FC<ActiveVisitorsListProps> = ({ visitors, onMarkExit }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const { t } = useTranslation();

  // Filtra los visitantes para mostrar solo los que están activos.
  const activeVisitors = visitors.filter(v => v.status === 'En el edificio');

  // Filtra los visitantes activos según el término de búsqueda.
  const filteredVisitors = activeVisitors.filter(visitor =>
    visitor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    visitor.rut.toLowerCase().includes(searchTerm.toLowerCase()) ||
    visitor.apartment.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Formatea la fecha y hora de entrada/salida.
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // El mes es en base 0.
    const year = date.getFullYear();
    const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `${day}/${month}/${year} ${time}`;
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>{t('active_visitors_title')}</h2>
      <input
        type="text"
        placeholder={t('search_visitor_placeholder')}
        className={styles.searchInput}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      {filteredVisitors.length === 0 ? (
        <p className={styles.noVisitors}>{t('no_active_visitors')}</p>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>{t('name_table_header')}</th>
                <th>{t('rut_table_header')}</th>
                <th>{t('apartment_table_header')}</th>
                <th>{t('license_plate_table_header')}</th>
                <th>{t('parking_spot_table_header')}</th>
                <th>{t('entry_time_table_header')}</th>
                <th>{t('status_table_header')}</th>
                <th>{t('actions_table_header')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredVisitors.map(visitor => (
                <tr key={visitor.id}>
                  <td>{visitor.name}</td>
                  <td>{visitor.rut}</td>
                  <td>{visitor.apartment}</td>
                  <td>{visitor.licensePlate || 'N/A'}</td>
                  <td>{visitor.parkingSpotId || 'N/A'}</td>
                  <td>{formatTime(visitor.entryTime)}</td>
                  <td>
                    <span className={`${styles.statusBadge} ${visitor.status === 'En el edificio' ? styles.active : styles.exited}`}>
                      {visitor.status === 'En el edificio' ? t('status_in_building') : t('status_exited')}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => onMarkExit(visitor.id)}
                      className={styles.exitButton}
                    >
                      {t('mark_exit_button')}
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
