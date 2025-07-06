import React, { useState } from 'react';
import styles from './RecentVisitorsList.module.css';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();

  const sortedVisitors = [...visitors].sort((a, b) => b.entryTime - a.entryTime);

  const filteredVisitors = sortedVisitors.filter(visitor =>
    visitor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    visitor.rut.toLowerCase().includes(searchTerm.toLowerCase()) ||
    visitor.apartment.toLowerCase().includes(searchTerm.toLowerCase())
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
      <h2 className={styles.title}>{t('recent_visitors_title')}</h2>
      <input
        type="text"
        placeholder={t('search_visitor_placeholder')}
        className={styles.searchInput}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      {filteredVisitors.length === 0 ? (
        <p className={styles.noVisitors}>{t('no_visitors_registered')}</p>
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
                <th>{t('exit_time_table_header')}</th>
                <th>{t('status_table_header')}</th>
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
                  <td>{formatTime(visitor.exitTime)}</td>
                  <td>
                    <span className={`${styles.statusBadge} ${visitor.status === 'En el edificio' ? styles.active : styles.exited}`}>
                      {visitor.status === 'En el edificio' ? t('status_in_building') : t('status_exited')}
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
