export interface PacketeEntry {
  id?: string;              // ID del documento en Firestore

  conserjeId: string;       // UID del conserje que registró el packete
  conserjeName: string;     // Nombre del conserje

  recipientName: string;    // Nombre del destinatario
  trackingCode: string;     // Código o número de seguimiento
  apartment: string;        // Departamento / casa del destinatario

  carrier?: string;         // Empresa o repartidor (Opcional)
  storageLocation?: string; // Dónde se guardó el packete (bodega, casillero, etc.)

  receivedTime: Date;       // Cuándo llegó el packete
  pickedUpTime?: Date;      // Cuándo fue retirado (si ya se retiró)

  notes?: string;           // Notas adicionales

  createdAt: Date;          // Fecha de creación del registro
  updatedAt: Date;          // Última actualización
}
