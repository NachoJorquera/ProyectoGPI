// seed.ts
import { collection, doc, setDoc } from "firebase/firestore";
// Asegúrate de que la ruta a tu configuración de Firebase sea correcta
import { db } from "./src/firebaseConfig";

// 1. Definimos la interfaz para la seguridad de tipos
interface ParkingSpot {
  id: string;
  status: "disponible" | "ocupado";
  type: "visita" | "residente";
  floor: number;
  assignedToVisitId: string | null;
  notes?: string; // El campo 'notes' es opcional
}

// 2. Creamos la lista de estacionamientos con el tipo que definimos
const parkingSpots: ParkingSpot[] = [
  // --- Estacionamientos de Visita (Nivel -1) ---
  {
    id: "V-01",
    status: "disponible",
    type: "visita",
    floor: -1,
    assignedToVisitId: null,
  },
  {
    id: "V-02",
    status: "disponible",
    type: "visita",
    floor: -1,
    assignedToVisitId: null,
  },
  {
    id: "V-03",
    status: "disponible",
    type: "visita",
    floor: -1,
    assignedToVisitId: null,
  },
  {
    id: "V-04",
    status: "disponible",
    type: "visita",
    floor: -1,
    assignedToVisitId: null,
  },
  {
    id: "V-05",
    status: "disponible",
    type: "visita",
    floor: -1,
    assignedToVisitId: null,
  },
  {
    id: "V-06",
    status: "disponible",
    type: "visita",
    floor: -1,
    assignedToVisitId: null,
    notes: "Acceso para discapacitados, cerca del ascensor",
  },

  // --- Estacionamientos de Residentes (Nivel -1) ---
  { id: "R-101", status: "ocupado", type: "residente", floor: -1, assignedToVisitId: null },
  { id: "R-102", status: "ocupado", type: "residente", floor: -1, assignedToVisitId: null },
  { id: "R-103", status: "ocupado", type: "residente", floor: -1, assignedToVisitId: null },

  // --- Estacionamientos de Residentes (Nivel -2) ---
  { id: "R-201", status: "ocupado", type: "residente", floor: -2, assignedToVisitId: null },
  { id: "R-202", status: "ocupado", type: "residente", floor: -2, assignedToVisitId: null },
  { id: "R-203", status: "disponible", type: "residente", floor: -2, assignedToVisitId: null },
];

// 3. La función asíncrona que realiza la siembra
async function seedDatabase() {
  const parkingCollection = collection(db, "estacionamientos");
  console.log("Iniciando siembra de datos de estacionamientos...");

  const promises = parkingSpots.map(async (spot) => {
    // Usamos el 'id' del estacionamiento como el ID del documento para evitar duplicados
    const docRef = doc(parkingCollection, spot.id);
    try {
      await setDoc(docRef, spot);
      console.log(`✅ Documento ${spot.id} creado/actualizado exitosamente.`);
    } catch (error) {
      console.error(`❌ Error creando documento ${spot.id}:`, error);
    }
  });

  await Promise.all(promises);
  console.log("🚀 ¡Siembra de datos completada!");
}

// 4. Ejecutamos la función
seedDatabase();