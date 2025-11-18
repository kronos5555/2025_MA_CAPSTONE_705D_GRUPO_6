import { Injectable, inject } from '@angular/core';
import { 
  Firestore, 
  collection, 
  doc, 
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  onSnapshot
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { BitacoraEntry } from '../models/bitacora.model';

@Injectable({
  providedIn: 'root'
})
export class BitacoraService {
  private firestore: Firestore = inject(Firestore);

  constructor() {}

  // Crear entrada en bitácora
  async createEntry(entry: Omit<BitacoraEntry, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(this.firestore, 'bitacora'), {
      ...entry,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return docRef.id;
  }

  // Obtener todas las entradas
  async getAllEntries(): Promise<BitacoraEntry[]> {
    const q = query(
      collection(this.firestore, 'bitacora'),
      orderBy('entryTime', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      entryTime: doc.data()['entryTime']?.toDate() || new Date(),
      exitTime: doc.data()['exitTime']?.toDate() || null,
      createdAt: doc.data()['createdAt']?.toDate() || new Date(),
      updatedAt: doc.data()['updatedAt']?.toDate() || new Date()
    } as BitacoraEntry));
  }

  // Obtener entradas en tiempo real
  getEntriesRealtime(): Observable<BitacoraEntry[]> {
    return new Observable(observer => {
      const q = query(
        collection(this.firestore, 'bitacora'),
        orderBy('entryTime', 'desc'),
        limit(50)
      );

      const unsubscribe = onSnapshot(q, snapshot => {
        const entries: BitacoraEntry[] = [];
        snapshot.forEach(doc => {
          const data = doc.data();
          entries.push({
            id: doc.id,
            ...data,
            entryTime: data['entryTime']?.toDate() || new Date(),
            exitTime: data['exitTime']?.toDate() || null,
            createdAt: data['createdAt']?.toDate() || new Date(),
            updatedAt: data['updatedAt']?.toDate() || new Date()
          } as BitacoraEntry);
        });
        observer.next(entries);
      });

      return () => unsubscribe();
    });
  }

  // Obtener entradas por conserje
  async getEntriesByConserje(conserjeId: string): Promise<BitacoraEntry[]> {
    const q = query(
      collection(this.firestore, 'bitacora'),
      where('conserjeId', '==', conserjeId),
      orderBy('entryTime', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      entryTime: doc.data()['entryTime']?.toDate() || new Date(),
      exitTime: doc.data()['exitTime']?.toDate() || null,
      createdAt: doc.data()['createdAt']?.toDate() || new Date(),
      updatedAt: doc.data()['updatedAt']?.toDate() || new Date()
    } as BitacoraEntry));
  }

  // Obtener entradas de hoy
  async getTodayEntries(): Promise<BitacoraEntry[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const q = query(
      collection(this.firestore, 'bitacora'),
      where('entryTime', '>=', today),
      orderBy('entryTime', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      entryTime: doc.data()['entryTime']?.toDate() || new Date(),
      exitTime: doc.data()['exitTime']?.toDate() || null,
      createdAt: doc.data()['createdAt']?.toDate() || new Date(),
      updatedAt: doc.data()['updatedAt']?.toDate() || new Date()
    } as BitacoraEntry));
  }

  // Actualizar entrada (por ejemplo, registrar salida)
  async updateEntry(id: string, data: Partial<BitacoraEntry>): Promise<void> {
    const entryRef = doc(this.firestore, `bitacora/${id}`);
    await updateDoc(entryRef, {
      ...data,
      updatedAt: new Date()
    });
  }

  // Registrar salida del visitante
  async registerExit(id: string): Promise<void> {
    await this.updateEntry(id, {
      exitTime: new Date()
    });
  }

  // Eliminar entrada
  async deleteEntry(id: string): Promise<void> {
    await deleteDoc(doc(this.firestore, `bitacora/${id}`));
  }

  // Buscar entradas por nombre de visitante
  async searchByVisitorName(name: string): Promise<BitacoraEntry[]> {
    const allEntries = await this.getAllEntries();
    return allEntries.filter(entry => 
      entry.visitorName.toLowerCase().includes(name.toLowerCase())
    );
  }

  // Buscar entradas por apartamento
  async searchByApartment(apartment: string): Promise<BitacoraEntry[]> {
    const q = query(
      collection(this.firestore, 'bitacora'),
      where('visitingApartment', '==', apartment),
      orderBy('entryTime', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      entryTime: doc.data()['entryTime']?.toDate() || new Date(),
      exitTime: doc.data()['exitTime']?.toDate() || null,
      createdAt: doc.data()['createdAt']?.toDate() || new Date(),
      updatedAt: doc.data()['updatedAt']?.toDate() || new Date()
    } as BitacoraEntry));
  }
}