import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, addDoc, updateDoc, doc, getDoc, getDocs, where, writeBatch } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useTranslation } from 'react-i18next';

import RegisterVisitorForm from './RegisterVisitorForm';
import ActiveVisitorsList from './ActiveVisitorsList';
import RecentVisitorsList from './RecentVisitorsList';
import Modal from './Modal'; // Importa el componente Modal.
import styles from './VisitorManagementPage.module.css';

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

// Interfaz para definir la estructura de un objeto de visitante frecuente.
interface FrequentVisitor {
  id: string;
  name: string;
  rut: string;
  apartment: string;
  lastUsedPatente: string | null;
}

// Componente para la gestión de visitantes.
const VisitorManagementPage: React.FC = () => {
  // Estados para los visitantes, visitantes frecuentes, pestaña activa y modal.
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [frequentVisitors, setFrequentVisitors] = useState<FrequentVisitor[]>([]);
  const [activeTab, setActiveTab] = useState<'active' | 'recent'>('active'); // Cambia la pestaña inicial.
  const [isModalOpen, setIsModalOpen] = useState(false); // Estado para la visibilidad del modal.
  const { t } = useTranslation();

  // Efecto para obtener los visitantes y visitantes frecuentes de Firestore.
  useEffect(() => {
    // Obtiene los visitantes.
    const qVisitors = query(collection(db, 'visitors'));
    const unsubscribeVisitors = onSnapshot(qVisitors, (snapshot) => {
      const visitorsData: Visitor[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data() as Omit<Visitor, 'id'>
      }));
      setVisitors(visitorsData);
    });

    // Obtiene los visitantes frecuentes.
    const qFrequentVisitors = query(collection(db, 'frequent_visitors'));
    const unsubscribeFrequentVisitors = onSnapshot(qFrequentVisitors, (snapshot) => {
      const frequentVisitorsData: FrequentVisitor[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data() as Omit<FrequentVisitor, 'id'>
      }));
      setFrequentVisitors(frequentVisitorsData);
    });

    return () => {
      unsubscribeVisitors();
      unsubscribeFrequentVisitors();
    };
  }, []);

  // Maneja la adición de un nuevo visitante.
  const handleAddVisitor = async (newVisitor: { name: string; rut: string; apartment: string; entryTime: number; licensePlate: string | null; parkingSpotId: string | null }, isFrequent: boolean) => {
    try {
      const activeVisitors = visitors.filter(v => v.status === 'En el edificio');
      const isAlreadyIn = activeVisitors.some(v => v.rut === newVisitor.rut);

      if (isAlreadyIn) {
        alert(t('visitor_already_in_building'));
        return;
      }

      const visitorToAdd = {
        ...newVisitor,
        exitTime: null,
        status: 'En el edificio',
      };
      await addDoc(collection(db, 'visitors'), visitorToAdd);

      if (isFrequent) {
        const q = query(collection(db, 'frequent_visitors'), where('rut', '==', newVisitor.rut));
        const querySnapshot = await getDocs(q);
        const batch = writeBatch(db);

        if (!querySnapshot.empty) {
          // Actualiza un visitante frecuente existente.
          const docRef = querySnapshot.docs[0].ref;
          batch.update(docRef, {
            name: newVisitor.name,
            apartment: newVisitor.apartment,
            lastUsedPatente: newVisitor.licensePlate || null,
          });
        } else {
          // Agrega un nuevo visitante frecuente.
          const newDocRef = doc(collection(db, 'frequent_visitors'));
          batch.set(newDocRef, {
            name: newVisitor.name,
            rut: newVisitor.rut,
            apartment: newVisitor.apartment,
            lastUsedPatente: newVisitor.licensePlate || null,
          });
        }
        await batch.commit();
      }
      setIsModalOpen(false); // Cierra el modal después de agregar el visitante.
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  };

  // Maneja la marcación de la salida de un visitante.
  const handleMarkExit = async (visitorId: string) => {
    try {
      const visitorRef = doc(db, 'visitors', visitorId);
      const visitorDoc = await getDoc(visitorRef); // Obtiene los datos más recientes del visitante.

      if (visitorDoc.exists()) {
        const visitorData = visitorDoc.data() as Visitor;

        await updateDoc(visitorRef, {
          exitTime: Date.now(),
          status: 'Salió',
        });

        if (visitorData.parkingSpotId) {
          const parkingRef = doc(db, 'estacionamientos', visitorData.parkingSpotId);
          await updateDoc(parkingRef, {
            status: 'disponible',
            assignedToVisitId: null,
          });
        }
      }
    } catch (e) {
      console.error("Error updating document: ", e);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{t('visitor_management_title')}</h1>
      <button className={styles.newVisitButton} onClick={() => setIsModalOpen(true)}>
        <span className={styles.plusIcon}>+</span> {t('new_visit_button')}
      </button>
      <div className={styles.tabs}>
        <button
          className={`${styles.tabButton} ${activeTab === 'active' ? styles.active : ''}`}
          onClick={() => setActiveTab('active')}
        >
          {t('active_visitors_tab')}
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === 'recent' ? styles.active : ''}`}
          onClick={() => setActiveTab('recent')}
        >
          {t('visit_history_tab')}
        </button>
      </div>

      <div className={styles.content}>
        {activeTab === 'active' && (
          <ActiveVisitorsList visitors={visitors} onMarkExit={handleMarkExit} />
        )}
        {activeTab === 'recent' && (
          <RecentVisitorsList visitors={visitors} />
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <RegisterVisitorForm onAddVisitor={handleAddVisitor} frequentVisitors={frequentVisitors} />
      </Modal>
    </div>
  );
};

export default VisitorManagementPage;
