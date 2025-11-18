export interface BitacoraEntry {
  id?: string;
  conserjeId: string;
  conserjeeName: string;
  visitorName: string;
  visitorId?: string; // Cédula o documento
  visitorPhone?: string;
  visitingApartment?: string;
  visitingResident?: string;
  entryTime: Date;
  exitTime?: Date;
  notes?: string;
  vehiclePlate?: string;
  createdAt: Date;
  updatedAt: Date;
}