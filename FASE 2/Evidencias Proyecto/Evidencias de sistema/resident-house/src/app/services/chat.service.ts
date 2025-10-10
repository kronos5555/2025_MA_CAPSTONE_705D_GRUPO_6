import { Injectable, inject } from '@angular/core';
import { 
  Firestore, 
  collection, 
  doc, 
  addDoc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot
} from '@angular/fire/firestore';
import { 
  Storage,
  ref,
  uploadBytes,
  getDownloadURL
} from '@angular/fire/storage';
import { Observable } from 'rxjs';
import { Message, Chat } from '../models/message.model';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private firestore: Firestore = inject(Firestore);
  private storage: Storage = inject(Storage);

  constructor() {}

  // Crear o obtener un chat entre dos usuarios
  async getOrCreateChat(userId1: string, userId2: string): Promise<string> {
    try {
      // Ordenar IDs para tener un chatId consistente
      const participants = [userId1, userId2].sort();
      const chatId = participants.join('_');

      console.log('Intentando obtener/crear chat:', chatId);

      const chatRef = doc(this.firestore, 'chats', chatId);
      const chatDoc = await getDoc(chatRef);

      if (!chatDoc.exists()) {
        // Crear nuevo chat
        const chatData: any = {
          participants,
          lastMessage: '',
          lastMessageTime: new Date(),
          unreadCount: {
            [userId1]: 0,
            [userId2]: 0
          },
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        console.log('Creando nuevo chat:', chatData);
        await setDoc(chatRef, chatData);
        console.log('Chat creado exitosamente');
      } else {
        console.log('Chat ya existe');
      }

      return chatId;
    } catch (error) {
      console.error('Error en getOrCreateChat:', error);
      throw error;
    }
  }

  // Enviar mensaje
  async sendMessage(
    chatId: string, 
    senderId: string, 
    receiverId: string, 
    text: string,
    senderName: string,
    senderPhoto?: string
  ): Promise<void> {
    try {
      if (!chatId || chatId.includes('undefined')) {
        throw new Error('ChatId inválido');
      }

      console.log('Enviando mensaje en chat:', chatId);

      const message: any = {
        chatId,
        senderId,
        receiverId,
        text,
        createdAt: new Date(),
        read: false,
        senderName,
        senderPhoto: senderPhoto || ''
      };

      // Guardar mensaje en la subcolección
      const messagesRef = collection(this.firestore, `chats/${chatId}/messages`);
      await addDoc(messagesRef, message);
      console.log('Mensaje guardado');

      // Actualizar último mensaje del chat
      const chatRef = doc(this.firestore, 'chats', chatId);
      const chatDoc = await getDoc(chatRef);
      
      if (chatDoc.exists()) {
        const currentUnread = chatDoc.data()['unreadCount'] || {};
        const updateData: any = {
          lastMessage: text,
          lastMessageTime: new Date(),
          updatedAt: new Date(),
          [`unreadCount.${receiverId}`]: (currentUnread[receiverId] || 0) + 1
        };
        
        await setDoc(chatRef, updateData, { merge: true });
        console.log('Chat actualizado');
      }
    } catch (error) {
      console.error('Error en sendMessage:', error);
      throw error;
    }
  }

  // Obtener mensajes de un chat (en tiempo real)
  getMessages(chatId: string): Observable<Message[]> {
    return new Observable(observer => {
      if (!chatId || chatId.includes('undefined')) {
        console.error('ChatId inválido en getMessages');
        observer.next([]);
        return;
      }

      try {
        const messagesRef = collection(this.firestore, `chats/${chatId}/messages`);
        const q = query(messagesRef, orderBy('createdAt', 'asc'));

        const unsubscribe = onSnapshot(q, snapshot => {
          const messages: Message[] = [];
          snapshot.forEach(doc => {
            const data = doc.data();
            messages.push({
              id: doc.id,
              chatId: data['chatId'],
              senderId: data['senderId'],
              receiverId: data['receiverId'],
              text: data['text'],
              createdAt: data['createdAt']?.toDate() || new Date(),
              read: data['read'] || false,
              senderName: data['senderName'],
              senderPhoto: data['senderPhoto']
            } as Message);
          });
          observer.next(messages);
        }, error => {
          console.error('Error en snapshot de mensajes:', error);
          observer.error(error);
        });

        return () => unsubscribe();
      } catch (error) {
        console.error('Error en getMessages:', error);
        observer.error(error);
        return () => {};
      }
    });
  }

  // Obtener todos los chats de un usuario
  async getUserChats(userId: string): Promise<Chat[]> {
    try {
      const chatsRef = collection(this.firestore, 'chats');
      const q = query(
        chatsRef,
        where('participants', 'array-contains', userId)
      );

      const snapshot = await getDocs(q);
      const chats: Chat[] = [];

      snapshot.forEach(doc => {
        const data = doc.data();
        chats.push({
          id: doc.id,
          participants: data['participants'],
          lastMessage: data['lastMessage'] || '',
          lastMessageTime: data['lastMessageTime']?.toDate() || new Date(),
          unreadCount: data['unreadCount'] || {},
          createdAt: data['createdAt']?.toDate() || new Date(),
          updatedAt: data['updatedAt']?.toDate() || new Date()
        } as Chat);
      });

      // Ordenar por último mensaje
      chats.sort((a, b) => {
        const timeA = a.lastMessageTime?.getTime() || 0;
        const timeB = b.lastMessageTime?.getTime() || 0;
        return timeB - timeA;
      });

      return chats;
    } catch (error) {
      console.error('Error en getUserChats:', error);
      return [];
    }
  }

  // Marcar mensajes como leídos
  async markMessagesAsRead(chatId: string, userId: string): Promise<void> {
    try {
      if (!chatId || chatId.includes('undefined')) {
        return;
      }

      const chatRef = doc(this.firestore, 'chats', chatId);
      await setDoc(chatRef, {
        [`unreadCount.${userId}`]: 0
      }, { merge: true });
    } catch (error) {
      console.error('Error marcando mensajes como leídos:', error);
    }
  }

  // Subir imagen en el chat
  async uploadChatImage(chatId: string, file: File): Promise<string> {
    const timestamp = Date.now();
    const storageRef = ref(this.storage, `chat-images/${chatId}/${timestamp}`);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  }
}