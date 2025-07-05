import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, addDoc, updateDoc, doc, getDoc, getDocs, where, writeBatch } from 'firebase/firestore';
import { db } from '../firebaseConfig';

import RegisterVisitorForm from './RegisterVisitorForm';
import ActiveVisitorsList from './ActiveVisitorsList';
import RecentVisitorsList from './RecentVisitorsList';
import Modal from './Modal'; // Import the Modal component
import styles from './VisitorManagementPage.module.css';

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

interface FrequentVisitor {
  id: string;
  name: string;
  rut: string;
  apartment: string;
  lastUsedPatente: string | null;
}

const VisitorManagementPage: React.FC = () => {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [frequentVisitors, setFrequentVisitors] = useState<FrequentVisitor[]>([]);
  const [activeTab, setActiveTab] = useState<'active' | 'recent'>('active'); // Changed initial tab
  const [isModalOpen, setIsModalOpen] = useState(false); // State for modal visibility

  useEffect(() => {
    // Fetch visitors
    const qVisitors = query(collection(db, 'visitors'));
    const unsubscribeVisitors = onSnapshot(qVisitors, (snapshot) => {
      const visitorsData: Visitor[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data() as Omit<Visitor, 'id'>
      }));
      setVisitors(visitorsData);
    });

    // Fetch frequent visitors
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

  const handleAddVisitor = async (newVisitor: { name: string; rut: string; apartment: string; entryTime: number; licensePlate: string | null; parkingSpotId: string | null }, isFrequent: boolean) => {
    try {
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
          // Update existing frequent visitor
          const docRef = querySnapshot.docs[0].ref;
          batch.update(docRef, {
            name: newVisitor.name,
            apartment: newVisitor.apartment,
            lastUsedPatente: newVisitor.licensePlate || null,
          });
        } else {
          // Add new frequent visitor
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
      setIsModalOpen(false); // Close modal after adding visitor
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  };

  const handleMarkExit = async (visitorId: string) => {
    try {
      const visitorRef = doc(db, 'visitors', visitorId);
      const visitorDoc = await getDoc(visitorRef); // Fetch the latest visitor data

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
      <h1 className={styles.title}>Gestión de Visitantes</h1>
      <button className={styles.newVisitButton} onClick={() => setIsModalOpen(true)}>
        <span className={styles.plusIcon}>+</span> Nueva Visita
      </button>
      <div className={styles.tabs}>
        <button
          className={`${styles.tabButton} ${activeTab === 'active' ? styles.active : ''}`}
          onClick={() => setActiveTab('active')}
        >
          Visitantes Activos
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === 'recent' ? styles.active : ''}`}
          onClick={() => setActiveTab('recent')}
        >
          Historial de Visitas
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
