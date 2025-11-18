import { Injectable, inject } from '@angular/core';
import { 
  Firestore, 
  collection, 
  doc, 
  getDoc, 
  getDocs,
  updateDoc,
  deleteDoc,  // <- Agrega esto
  query,
  where,
  orderBy
} from '@angular/fire/firestore';
import { 
  Storage,
  ref,
  uploadBytes,
  getDownloadURL
} from '@angular/fire/storage';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private firestore: Firestore = inject(Firestore);
  private storage: Storage = inject(Storage);

  constructor() {}

  // Obtener usuario por ID
  async getUserById(uid: string): Promise<User | null> {
    const userDoc = await getDoc(doc(this.firestore, `users/${uid}`));
    return userDoc.exists() ? userDoc.data() as User : null;
  }

  // Obtener todos los residentes
  async getAllResidents(): Promise<User[]> {
    const q = query(
      collection(this.firestore, 'users'),
      where('role', '==', 'resident'),
      orderBy('displayName')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as User);
  }

  // Obtener todos los conserjes
  async getAllConserjes(): Promise<User[]> {
    const q = query(
      collection(this.firestore, 'users'),
      where('role', '==', 'conserje'),
      orderBy('displayName')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as User);
  }

  // Obtener todos los usuarios (para el conserje)
// Obtener todos los usuarios (para el conserje)
async getAllUsers(): Promise<User[]> {
  try {
    const usersRef = collection(this.firestore, 'users');
    const q = query(usersRef, orderBy('displayName'));
    const snapshot = await getDocs(q);
    
    const users: User[] = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      users.push({
        uid: data['uid'] || doc.id,
        email: data['email'] || '',
        displayName: data['displayName'] || '',
        photoURL: data['photoURL'] || '',
        role: data['role'] || 'resident',
        phoneNumber: data['phoneNumber'] || '',
        address: data['address'] || '',
        apartmentNumber: data['apartmentNumber'] || '',
        createdAt: data['createdAt']?.toDate() || new Date(),
        updatedAt: data['updatedAt']?.toDate() || new Date(),
        isOnline: data['isOnline'] || false,
        lastSeen: data['lastSeen']?.toDate() || new Date()
      } as User);
    });
    
    console.log('getAllUsers - Usuarios obtenidos:', users.length);
    return users;
  } catch (error) {
    console.error('Error en getAllUsers:', error);
    return [];
  }
}

  // Actualizar perfil de usuario
  async updateUserProfile(uid: string, data: Partial<User>): Promise<void> {
    const userRef = doc(this.firestore, `users/${uid}`);
    await updateDoc(userRef, {
      ...data,
      updatedAt: new Date()
    });
  }

// Subir foto de perfil
async uploadProfilePhoto(uid: string, file: File): Promise<string> {
  try {
    const storageRef = ref(this.storage, `profile-photos/${uid}`);
    
    // Subir archivo
    const uploadResult = await uploadBytes(storageRef, file);
    
    // Obtener URL de descarga
    const downloadURL = await getDownloadURL(uploadResult.ref);
    
    // Actualizar URL en Firestore
    await this.updateUserProfile(uid, { photoURL: downloadURL });
    
    return downloadURL;
  } catch (error) {
    console.error('Error subiendo foto de perfil:', error);
    throw error;
  }
}
  
// Eliminar usuario (solo para testing)
async deleteUser(uid: string): Promise<void> {
  try {
    const userRef = doc(this.firestore, `users/${uid}`);
    await deleteDoc(userRef);
    console.log('Usuario eliminado de Firestore');
  } catch (error) {
    console.error('Error eliminando usuario:', error);
    throw error;
  }
}


  
}