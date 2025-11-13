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
  orderBy,
  where,
  onSnapshot
} from '@angular/fire/firestore';
import { 
  Storage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from '@angular/fire/storage';
import { Observable } from 'rxjs';
import { Anuncio } from '../models/anuncio.model';

@Injectable({
  providedIn: 'root'
})
export class AnuncioService {
  private firestore: Firestore = inject(Firestore);
  private storage: Storage = inject(Storage);

  constructor() {}

  // Crear anuncio
  async createAnuncio(anuncio: Omit<Anuncio, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(this.firestore, 'anuncios'), {
      ...anuncio,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return docRef.id;
  }

  // Obtener todos los anuncios
  async getAllAnuncios(): Promise<Anuncio[]> {
    const q = query(
      collection(this.firestore, 'anuncios'),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data()['createdAt']?.toDate() || new Date(),
      updatedAt: doc.data()['updatedAt']?.toDate() || new Date()
    } as Anuncio));
  }

  // Obtener anuncios en tiempo real
  getAnunciosRealtime(): Observable<Anuncio[]> {
    return new Observable(observer => {
      const q = query(
        collection(this.firestore, 'anuncios'),
        orderBy('createdAt', 'desc')
      );

      const unsubscribe = onSnapshot(q, snapshot => {
        const anuncios: Anuncio[] = [];
        snapshot.forEach(doc => {
          const data = doc.data();
          anuncios.push({
            id: doc.id,
            ...data,
            createdAt: data['createdAt']?.toDate() || new Date(),
            updatedAt: data['updatedAt']?.toDate() || new Date()
          } as Anuncio);
        });
        observer.next(anuncios);
      });

      return () => unsubscribe();
    });
  }

  // Obtener anuncios por usuario
  async getAnunciosByUser(userId: string): Promise<Anuncio[]> {
    const q = query(
      collection(this.firestore, 'anuncios'),
      where('authorId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data()['createdAt']?.toDate() || new Date(),
      updatedAt: doc.data()['updatedAt']?.toDate() || new Date()
    } as Anuncio));
  }

  // Actualizar anuncio
  async updateAnuncio(id: string, data: Partial<Anuncio>): Promise<void> {
    const anuncioRef = doc(this.firestore, `anuncios/${id}`);
    await updateDoc(anuncioRef, {
      ...data,
      updatedAt: new Date()
    });
  }

  // Eliminar anuncio
  async deleteAnuncio(id: string): Promise<void> {
    // Obtener anuncio para eliminar imagen si existe
    const anuncioDoc = await getDoc(doc(this.firestore, `anuncios/${id}`));
    if (anuncioDoc.exists()) {
      const anuncio = anuncioDoc.data() as Anuncio;
      if (anuncio.imageUrl) {
        try {
          const imageRef = ref(this.storage, anuncio.imageUrl);
          await deleteObject(imageRef);
        } catch (error) {
          console.error('Error al eliminar imagen:', error);
        }
      }
    }

    // Eliminar documento
    await deleteDoc(doc(this.firestore, `anuncios/${id}`));
  }

  // Subir imagen de anuncio
  async uploadAnuncioImage(file: File): Promise<string> {
    const timestamp = Date.now();
    const storageRef = ref(this.storage, `anuncios/${timestamp}_${file.name}`);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  }
}