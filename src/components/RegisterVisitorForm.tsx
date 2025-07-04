import React, { useState, useEffect } from 'react';
import styles from './RegisterVisitorForm.module.css';
import { db } from '../firebaseConfig';
import { collection, doc, updateDoc, onSnapshot } from 'firebase/firestore';

interface ParkingSpot {
  id: string;
  status: "disponible" | "ocupado";
  type: "visita" | "residente";
  floor: number;
  assignedToVisitId: string | null;
  notes?: string;
}

interface RegisterVisitorFormProps {
  onAddVisitor: (visitor: { name: string; rut: string; apartment: string; entryTime: number; licensePlate: string | null; parkingSpotId: string | null }, isFrequent: boolean) => void;
  frequentVisitors: { id: string; name: string; rut: string; }[];
}

const RegisterVisitorForm: React.FC<RegisterVisitorFormProps> = ({ onAddVisitor, frequentVisitors }) => {
  const [name, setName] = useState('');
  const [rut, setRut] = useState('');
  const [rutError, setRutError] = useState<string | null>(null);
  const [apartment, setApartment] = useState('');
  const [isFrequent, setIsFrequent] = useState(false);
  const [licensePlate, setLicensePlate] = useState('');
  const [availableParkingSpots, setAvailableParkingSpots] = useState<ParkingSpot[]>([]);
  const [selectedParkingSpot, setSelectedParkingSpot] = useState<string>('');
  const [filteredFrequentVisitors, setFilteredFrequentVisitors] = useState<{ id: string; name: string; rut: string; }[]>([]);
  

  const cleanRut = (inputRut: string) => {
    let cleaned = inputRut.replace(/[^0-9kK]/g, '').toUpperCase();
    if (cleaned.endsWith('11')) {
      cleaned = cleaned.slice(0, -2) + 'K';
    }
    return cleaned;
  };

  const validateRut = (inputRut: string): boolean => {
    const cleanedRut = cleanRut(inputRut);
    if (!/^[0-9]+[0-9K]$/.test(cleanedRut)) {
      return false;
    }

    const rutBody = cleanedRut.slice(0, -1);
    const dv = cleanedRut.slice(-1);

    if (rutBody.length < 7) {
      return false;
    }

    let sum = 0;
    let multiplier = 2;

    for (let i = rutBody.length - 1; i >= 0; i--) {
      sum += parseInt(rutBody[i], 10) * multiplier;
      multiplier++;
      if (multiplier > 7) {
        multiplier = 2;
      }
    }

    const calculatedDv = 11 - (sum % 11);
    let expectedDv = '';

    if (calculatedDv === 11) {
      expectedDv = '0';
    } else if (calculatedDv === 10) {
      expectedDv = 'K';
    } else {
      expectedDv = calculatedDv.toString();
    }

    return expectedDv === dv;
  };

  useEffect(() => {
    const parkingCollection = collection(db, 'estacionamientos');
    const unsubscribe = onSnapshot(parkingCollection, (snapshot) => {
      const parkingList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ParkingSpot[];
      setAvailableParkingSpots(parkingList.filter(spot => spot.type === 'visita' && spot.status === 'disponible'));
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (rut.length > 0) {
      setFilteredFrequentVisitors(
        frequentVisitors.filter(fv => fv.rut.includes(rut) || fv.name.toLowerCase().includes(name.toLowerCase()))
      );
    } else {
      setFilteredFrequentVisitors([]);
    }
  }, [rut, name, frequentVisitors]);

  const handleFrequentVisitorSelect = (selectedRut: string) => {
    const selectedVisitor = frequentVisitors.find(fv => fv.rut === selectedRut);
    if (selectedVisitor) {
      setName(selectedVisitor.name);
      setRut(selectedVisitor.rut);
      setFilteredFrequentVisitors([]); // Clear suggestions after selection
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !rut || !apartment) {
      alert('Por favor, complete todos los campos.');
      return;
    }

    const cleanedRut = cleanRut(rut);

    if (!validateRut(cleanedRut)) {
      setRutError('RUT inválido. Por favor, ingrese un RUT válido.');
      return;
    }

    setRutError(null);

    let parkingSpotIdToAssign: string | null = null;
    if (selectedParkingSpot) {
      try {
        const parkingRef = doc(db, 'estacionamientos', selectedParkingSpot);
        await updateDoc(parkingRef, {
          status: 'ocupado',
          assignedToVisitId: rut, // Assuming RUT can be used as a temporary visit ID
        });
        parkingSpotIdToAssign = selectedParkingSpot;
      } catch (error) {
        console.error("Error al actualizar el estacionamiento:", error);
        alert("Error al asignar el estacionamiento. Por favor, intente de nuevo.");
        return;
      }
    }

    onAddVisitor({ name, rut: cleanedRut, apartment, entryTime: Date.now(), licensePlate: licensePlate || null, parkingSpotId: parkingSpotIdToAssign }, isFrequent);
    setName('');
    setRut('');
    setApartment('');
    setIsFrequent(false);
    setLicensePlate('');
    setSelectedParkingSpot('');
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h2 className={styles.formTitle}>Registrar Nuevo Visitante</h2>
      <div className={styles.formGroup}>
        <label htmlFor="rut">RUT:</label>
        <div className={styles.inputContainer}>
          <input
            type="text"
            id="rut"
            value={rut}
            onChange={(e) => {
              setRut(e.target.value);
              const foundVisitor = frequentVisitors.find(fv => fv.rut === cleanRut(e.target.value));
              if (foundVisitor) {
                setName(foundVisitor.name);
              } else {
                setName('');
              }
            }}
            className={styles.input}
            list="frequent-visitors-ruts"
          />
        </div>
        {rutError && <p className={styles.error}>{rutError}</p>}
        <datalist id="frequent-visitors-ruts">
          {filteredFrequentVisitors.map(fv => (
            <option key={fv.id} value={fv.rut} />
          ))}
        </datalist>
        {filteredFrequentVisitors.length > 0 && (
          <ul className={styles.suggestionsList}>
            {filteredFrequentVisitors.map(fv => (
              <li key={fv.id} onClick={() => handleFrequentVisitorSelect(fv.rut)}>
                {fv.name} ({fv.rut})
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className={styles.formGroup}>
        <label htmlFor="name">Nombre Completo:</label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={styles.input}
          list="frequent-visitors-names"
        />
        <datalist id="frequent-visitors-names">
          {filteredFrequentVisitors.map(fv => (
            <option key={fv.id} value={fv.name} />
          ))}
        </datalist>
      </div>
      <div className={styles.formGroup}>
        <label htmlFor="apartment">Apartamento a Visitar:</label>
        <input
          type="text"
          id="apartment"
          value={apartment}
          onChange={(e) => setApartment(e.target.value)}
          className={styles.input}
        />
      </div>
      <div className={styles.formGroup}>
        <label htmlFor="licensePlate">Patente del Vehículo (opcional):</label>
        <input
          type="text"
          id="licensePlate"
          value={licensePlate}
          onChange={(e) => setLicensePlate(e.target.value)}
          className={styles.input}
          placeholder="Ej: AB123CD"
        />
      </div>
      <div className={styles.formGroup}>
        <label htmlFor="parkingSpot">Estacionamiento de Visita (opcional):</label>
        <select
          id="parkingSpot"
          value={selectedParkingSpot}
          onChange={(e) => setSelectedParkingSpot(e.target.value)}
          className={styles.input}
        >
          <option value="">Seleccione un estacionamiento</option>
          {availableParkingSpots.map(spot => (
            <option key={spot.id} value={spot.id}>
              {spot.id} (Piso: {spot.floor})
            </option>
          ))}
        </select>
      </div>
      <div className={styles.checkboxGroup}>
        <input
          type="checkbox"
          id="isFrequent"
          checked={isFrequent}
          onChange={(e) => setIsFrequent(e.target.checked)}
          className={styles.checkbox}
        />
        <label htmlFor="isFrequent">Marcar como visitante frecuente</label>
      </div>
      <button type="submit" className={styles.submitButton}>Registrar Visita</button>
    </form>
  );
};

export default RegisterVisitorForm;
