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
import { PacketeEntry } from '../models/packete.model';

@Injectable({
  providedIn: 'root'
})
export class PacketesService {

  private firestore: Firestore = inject(Firestore);
  private packetesCollection = collection(this.firestore, 'packetes');

  constructor() {}

  async getAllPacketes(): Promise<PacketeEntry[]> {
    const q = query(this.packetesCollection, orderBy('receivedTime', 'desc'));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...(docSnap.data() as any)
    }));
  }

  async createPackete(pack: Omit<PacketeEntry, 'id'>): Promise<string> {
    const docRef = await addDoc(this.packetesCollection, pack);
    return docRef.id;
  }

  async registerPickup(id: string): Promise<void> {
    const ref = doc(this.firestore, 'packetes', id);
    await updateDoc(ref, {
      pickedUpTime: new Date(),
      updatedAt: new Date()
    });
  }

  async deletePackete(id: string): Promise<void> {
    const ref = doc(this.firestore, 'packetes', id);
    await deleteDoc(ref);
  }
}
