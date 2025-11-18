export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: 'resident' | 'conserje';
  phoneNumber?: string;  // Opcional
  address?: string;  // Opcional
  apartmentNumber?: string;
  createdAt: Date;
  updatedAt: Date;
  isOnline?: boolean;
  lastSeen?: Date;
}