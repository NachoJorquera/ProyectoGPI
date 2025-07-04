import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, addDoc, updateDoc, doc, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';

import RegisterVisitorForm from './RegisterVisitorForm';
import ActiveVisitorsList from './ActiveVisitorsList';
import RecentVisitorsList from './RecentVisitorsList';
import styles from './VisitorManagementPage.module.css';

interface Visitor {
  id: string;
  name: string;
  rut: string;
  apartment: string;
  entryTime: number;
  exitTime: number | null;
  status: 'En el edificio' | 'Salió';
}

interface FrequentVisitor {
  id: string;
  name: string;
  rut: string;
}

const VisitorManagementPage: React.FC = () => {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [frequentVisitors, setFrequentVisitors] = useState<FrequentVisitor[]>([]);
  const [activeTab, setActiveTab] = useState<'register' | 'active' | 'recent'>('register');
  

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

  const handleAddVisitor = async (newVisitor: { name: string; rut: string; apartment: string; entryTime: number }, isFrequent: boolean) => {
    try {
      const visitorToAdd = {
        ...newVisitor,
        exitTime: null,
        status: 'En el edificio',
      };
      await addDoc(collection(db, 'visitors'), visitorToAdd);

      if (isFrequent) {
        // Check if frequent visitor already exists by RUT
        const q = query(collection(db, 'frequent_visitors'));
        const querySnapshot = await getDocs(q);
        const existingFrequentVisitor = querySnapshot.docs.find(doc => doc.data().rut === newVisitor.rut);

        if (!existingFrequentVisitor) {
          await addDoc(collection(db, 'frequent_visitors'), { name: newVisitor.name, rut: newVisitor.rut });
        }
      }
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  };

  const handleMarkExit = async (visitorId: string) => {
    try {
      const visitorRef = doc(db, 'visitors', visitorId);
      await updateDoc(visitorRef, {
        exitTime: Date.now(),
        status: 'Salió',
      });
    } catch (e) {
      console.error("Error updating document: ", e);
    }
  };

  

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Gestión de Visitantes</h1>
      <div className={styles.tabs}>
        <button
          className={`${styles.tabButton} ${activeTab === 'register' ? styles.active : ''}`}
          onClick={() => setActiveTab('register')}
        >
          Registrar Visita
        </button>
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
        {activeTab === 'register' && (
          <RegisterVisitorForm onAddVisitor={handleAddVisitor} frequentVisitors={frequentVisitors} />
        )}
        {activeTab === 'active' && (
          <ActiveVisitorsList visitors={visitors} onMarkExit={handleMarkExit} />
        )}
        {activeTab === 'recent' && (
          <RecentVisitorsList visitors={visitors} />
        )}
      </div>
    </div>
  );
};

export default VisitorManagementPage;
