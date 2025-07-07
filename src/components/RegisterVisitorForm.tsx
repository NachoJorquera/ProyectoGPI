import React, { useState, useEffect } from 'react';
import styles from './RegisterVisitorForm.module.css';
import { db } from '../firebaseConfig';
import { collection, doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { useTranslation } from 'react-i18next';

// Interfaz para definir la estructura de un objeto de estacionamiento.
interface ParkingSpot {
  id: string;
  status: "disponible" | "ocupado";
  type: "visita" | "residente";
  floor: number;
  assignedToVisitId: string | null;
  notes?: string;
}

// Interfaz para definir la estructura de un objeto de visitante frecuente.
interface FrequentVisitor {
  id: string;
  name: string;
  rut: string;
  apartment: string;
  lastUsedPatente: string | null;
}

// Interfaz para definir las propiedades del componente RegisterVisitorForm.
interface RegisterVisitorFormProps {
  onAddVisitor: (visitor: { name: string; rut: string; apartment: string; entryTime: number; licensePlate: string | null; parkingSpotId: string | null }, isFrequent: boolean) => void;
  frequentVisitors: FrequentVisitor[];
}

// Componente para registrar un nuevo visitante.
const RegisterVisitorForm: React.FC<RegisterVisitorFormProps> = ({ onAddVisitor, frequentVisitors }) => {
  // Estados para los campos del formulario.
  const [name, setName] = useState('');
  const [rut, setRut] = useState('');
  const [rutError, setRutError] = useState<string | null>(null);
  const [apartment, setApartment] = useState('');
  const [isFrequent, setIsFrequent] = useState(false);
  const [licensePlate, setLicensePlate] = useState('');
  const [availableParkingSpots, setAvailableParkingSpots] = useState<ParkingSpot[]>([]);
  const [selectedParkingSpot, setSelectedParkingSpot] = useState<string>('');
  const [filteredFrequentVisitors, setFilteredFrequentVisitors] = useState<FrequentVisitor[]>([]);
  const [lastUsedPatente, setLastUsedPatente] = useState<string | null>(null);
  const { t } = useTranslation();

  // Limpia y formatea el RUT.
  const cleanRut = (inputRut: string) => {
    let cleaned = inputRut.replace(/[^0-9kK]/g, '').toUpperCase();
    if (cleaned.endsWith('11')) {
      cleaned = cleaned.slice(0, -2) + 'K';
    }
    return cleaned;
  };

  // Valida el RUT.
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

  // Efecto para obtener los estacionamientos disponibles.
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

  // Efecto para filtrar los visitantes frecuentes según el RUT ingresado.
  useEffect(() => {
    if (rut.length > 0) {
      setFilteredFrequentVisitors(
        frequentVisitors.filter(fv => fv.rut.includes(rut))
      );
    } else {
      setFilteredFrequentVisitors([]);
    }
  }, [rut, frequentVisitors]);

  // Maneja la selección de un visitante frecuente.
  const handleFrequentVisitorSelect = (selectedRut: string) => {
    const selectedVisitor = frequentVisitors.find(fv => fv.rut === selectedRut);
    if (selectedVisitor) {
      setName(selectedVisitor.name);
      setRut(selectedVisitor.rut);
      setApartment(selectedVisitor.apartment);
      setLastUsedPatente(selectedVisitor.lastUsedPatente);
      setLicensePlate(''); // Limpia la patente al seleccionar un nuevo visitante.
      setFilteredFrequentVisitors([]); // Limpia las sugerencias después de la selección.
    }
  };

  // Maneja el envío del formulario.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !rut || !apartment) {
      alert(t('fill_all_fields'));
      return;
    }

    const cleanedRut = cleanRut(rut);

    if (!validateRut(cleanedRut)) {
      setRutError(t('invalid_rut'));
      return;
    }

    setRutError(null);

    let parkingSpotIdToAssign: string | null = null;
    if (selectedParkingSpot) {
      try {
        const parkingRef = doc(db, 'estacionamientos', selectedParkingSpot);
        await updateDoc(parkingRef, {
          status: 'ocupado',
          assignedToVisitId: rut, // Asume que el RUT puede ser usado como ID temporal de visita.
        });
        parkingSpotIdToAssign = selectedParkingSpot;
      } catch (error) {
        console.error("Error al actualizar el estacionamiento:", error);
        alert(t('parking_update_error'));
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
    setLastUsedPatente(null);
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h2 className={styles.formTitle}>{t('register_new_visitor_title')}</h2>
      <div className={styles.formGroup}>
        <label htmlFor="rut">{t('rut_label')}</label>
        <div className={styles.inputContainer}>
          <input
            type="text"
            id="rut"
            value={rut}
            onChange={(e) => setRut(e.target.value)}
            className={styles.input}
            autoComplete="off"
          />
        </div>
        {rutError && <p className={styles.error}>{rutError}</p>}
        {filteredFrequentVisitors.length > 0 && (
          <ul className={styles.suggestionsList}>
            {filteredFrequentVisitors.map(fv => (
              <li key={fv.id} onClick={() => handleFrequentVisitorSelect(fv.rut)}>
                {`${fv.rut} - ${fv.name}`}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className={styles.formGroup}>
        <label htmlFor="name">{t('full_name_visitor_label')}</label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={styles.input}
        />
      </div>
      <div className={styles.formGroup}>
        <label htmlFor="apartment">{t('apartment_to_visit_label')}</label>
        <input
          type="text"
          id="apartment"
          value={apartment}
          onChange={(e) => setApartment(e.target.value)}
          className={styles.input}
        />
      </div>
      <div className={styles.formGroup}>
        <label htmlFor="licensePlate">{t('license_plate_optional')}</label>
        <div className={styles.patenteContainer}>
          <input
            type="text"
            id="licensePlate"
            value={licensePlate}
            onChange={(e) => setLicensePlate(e.target.value)}
            className={styles.input}
            placeholder={t('license_plate_example')}
          />
          {lastUsedPatente && (
            <button type="button" className={styles.patenteSuggestion} onClick={() => setLicensePlate(lastUsedPatente)}>
              {t('use_patente')} {lastUsedPatente}
            </button>
          )}
        </div>
      </div>
      <div className={styles.formGroup}>
        <label htmlFor="parkingSpot">{t('parking_spot_optional')}</label>
        <select
          id="parkingSpot"
          value={selectedParkingSpot}
          onChange={(e) => setSelectedParkingSpot(e.target.value)}
          className={styles.select}
        >
          <option value="">{t('select_parking_spot')}</option>
          {availableParkingSpots.map(spot => (
            <option key={spot.id} value={spot.id}>
              {spot.id} ({t('floor')}: {spot.floor})
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
        <label htmlFor="isFrequent">{t('mark_as_frequent_visitor')}</label>
      </div>
      <button type="submit" className={styles.submitButton}>{t('register_visit_button')}</button>
    </form>
  );
};

export default RegisterVisitorForm;
