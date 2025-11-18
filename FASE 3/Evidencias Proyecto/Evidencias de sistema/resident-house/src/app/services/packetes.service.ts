import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  doc,
  updateDoc,
  deleteDoc
} from '@angular/fire/firestore';
import { Timestamp } from 'firebase/firestore';   // 👈 IMPORTANTE
import { PacketeEntry } from '../models/packete.model';

@Injectable({
  providedIn: 'root'
})
export class PacketesService {
  private firestore: Firestore = inject(Firestore);
  private packetesCollection = collection(this.firestore, 'packetes');

  constructor() {}

  // Obtener todos los packetes
  async getAllPacketes(): Promise<PacketeEntry[]> {
    const q = query(this.packetesCollection, orderBy('receivedTime', 'desc'));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(docSnap => {
      const data = docSnap.data() as any;

      const receivedTime =
        data.receivedTime instanceof Timestamp
          ? data.receivedTime.toDate()
          : data.receivedTime;

      const pickedUpTime =
        data.pickedUpTime instanceof Timestamp
          ? data.pickedUpTime.toDate()
          : data.pickedUpTime;

      return {
        id: docSnap.id,
        ...data,
        receivedTime,
        pickedUpTime
      } as PacketeEntry;
    });
  }

  // Crear nuevo packete
  async createPackete(pack: Omit<PacketeEntry, 'id'>): Promise<string> {
    const docRef = await addDoc(this.packetesCollection, pack);
    return docRef.id;
  }

  // Registrar retiro del packete
  async registerPickup(id: string): Promise<void> {
    const packeteRef = doc(this.firestore, 'packetes', id);
    await updateDoc(packeteRef, {
      pickedUpTime: new Date(),
      updatedAt: new Date()
    });
  }

  // Eliminar packete
  async deletePackete(id: string): Promise<void> {
    const packeteRef = doc(this.firestore, 'packetes', id);
    await deleteDoc(packeteRef);
  }
}
