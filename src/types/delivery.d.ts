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
