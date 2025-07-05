import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

import RegisterDeliveryForm from './RegisterDeliveryForm';
import PendingDeliveriesList from './PendingDeliveriesList';
import DeliveryHistoryList from './DeliveryHistoryList';
import Modal from './Modal';
import styles from './DeliveryManagementPage.module.css';

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

const DeliveryManagementPage: React.FC = () => {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [activeTab, setActiveTab] = useState<'register' | 'pending' | 'history'>('pending');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const qDeliveries = query(collection(db, 'deliveries'));
    const unsubscribeDeliveries = onSnapshot(qDeliveries, (snapshot) => {
      const deliveriesData: Delivery[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data() as Omit<Delivery, 'id'>
      }));
      setDeliveries(deliveriesData);
    });

    return () => {
      unsubscribeDeliveries();
    };
  }, []);

  const handleAddDelivery = async (deliveryData: { apartment: string; recipientName: string; courier: string }) => {
    try {
      const deliveryToAdd = {
        ...deliveryData,
        status: 'Pendiente de retiro',
        arrivalTimestamp: Date.now(),
        pickupTimestamp: null,
        retrievedBy: null,
      };
      await addDoc(collection(db, 'deliveries'), deliveryToAdd);
      setIsModalOpen(false);
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  };

  const handleMarkAsPickedUp = async (deliveryId: string, retrievedByName: string) => {
    try {
      const deliveryRef = doc(db, 'deliveries', deliveryId);
      await updateDoc(deliveryRef, {
        status: 'Retirado',
        pickupTimestamp: Date.now(),
        retrievedBy: retrievedByName,
      });
    } catch (e) {
      console.error("Error updating document: ", e);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Gestión de Encomiendas</h1>
      <button className={styles.newDeliveryButton} onClick={() => {
        setIsModalOpen(true);
      }}>
        <span className={styles.plusIcon}>+</span> Nueva Encomienda
      </button>
      <div className={styles.tabs}>
        <button
          className={`${styles.tabButton} ${activeTab === 'pending' ? styles.active : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          Encomiendas Pendientes
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === 'history' ? styles.active : ''}`}
          onClick={() => setActiveTab('history')}
        >
          Historial de Encomiendas
        </button>
      </div>

      <div className={styles.content}>
        {activeTab === 'pending' && (
          <PendingDeliveriesList deliveries={deliveries} onMarkAsPickedUp={handleMarkAsPickedUp} />
        )}
        {activeTab === 'history' && (
          <DeliveryHistoryList deliveries={deliveries} />
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <RegisterDeliveryForm onAddDelivery={handleAddDelivery} />
      </Modal>
    </div>
  );
};

export default DeliveryManagementPage;
