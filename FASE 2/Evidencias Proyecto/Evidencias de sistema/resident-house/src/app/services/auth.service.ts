import { Injectable, inject } from '@angular/core';
import { 
  Auth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  user,
  updateProfile
} from '@angular/fire/auth';
import { 
  Firestore, 
  doc, 
  setDoc, 
  getDoc,
  updateDoc
} from '@angular/fire/firestore';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth: Auth = inject(Auth);
  private firestore: Firestore = inject(Firestore);
  
  user$ = user(this.auth);

  constructor() {}

  // Registro de usuario
  async register(email: string, password: string, userData: Partial<User>): Promise<void> {
    try {
      console.log('Iniciando registro...');
      console.log('Email:', email);
      console.log('UserData:', userData);

      // Crear usuario en Authentication
      const credential = await createUserWithEmailAndPassword(this.auth, email, password);
      console.log('Usuario creado en Authentication:', credential.user.uid);
      
      const uid = credential.user.uid;

      // Actualizar perfil de Firebase Auth
      await updateProfile(credential.user, {
        displayName: userData.displayName
      });
      console.log('Perfil actualizado en Authentication');

      // Crear documento del usuario en Firestore
      const userDoc: User = {
        uid,
        email,
        displayName: userData.displayName || '',
        role: userData.role || 'resident',
        phoneNumber: userData.phoneNumber || '',
        address: userData.address || '',
        apartmentNumber: userData.apartmentNumber || '',
        photoURL: userData.photoURL || '',
        createdAt: new Date(),
        updatedAt: new Date(),
        isOnline: true,
        lastSeen: new Date()
      };

      console.log('Guardando en Firestore:', userDoc);

      // Guardar en Firestore
      const userRef = doc(this.firestore, 'users', uid);
      await setDoc(userRef, userDoc);
      
      console.log('Usuario guardado en Firestore correctamente');
    } catch (error) {
      console.error('Error completo en registro:', error);
      throw error;
    }
  }

  // Inicio de sesión
  async login(email: string, password: string): Promise<User> {
    try {
      const credential = await signInWithEmailAndPassword(this.auth, email, password);
      const uid = credential.user.uid;

      // Actualizar estado online
      await this.updateOnlineStatus(uid, true);

      // Obtener datos del usuario
      const userDoc = await getDoc(doc(this.firestore, 'users', uid));
      
      if (!userDoc.exists()) {
        throw new Error('Usuario no encontrado en la base de datos');
      }

      return userDoc.data() as User;
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  }

  // Cerrar sesión
  async logout(): Promise<void> {
    try {
      const currentUser = this.auth.currentUser;
      if (currentUser) {
        await this.updateOnlineStatus(currentUser.uid, false);
      }
      await signOut(this.auth);
    } catch (error) {
      console.error('Error en logout:', error);
      throw error;
    }
  }

  // Obtener datos del usuario actual
  async getCurrentUserData(): Promise<User | null> {
    const currentUser = this.auth.currentUser;
    if (!currentUser) return null;

    const userDoc = await getDoc(doc(this.firestore, 'users', currentUser.uid));
    return userDoc.exists() ? userDoc.data() as User : null;
  }

  // Actualizar estado online
  async updateOnlineStatus(uid: string, isOnline: boolean): Promise<void> {
    try {
      const userRef = doc(this.firestore, 'users', uid);
      await updateDoc(userRef, {
        isOnline,
        lastSeen: new Date()
      });
    } catch (error) {
      console.error('Error actualizando estado online:', error);
    }
  }

  // Obtener UID del usuario actual
  getCurrentUserId(): string | null {
    return this.auth.currentUser?.uid || null;
  }
}