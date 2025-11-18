export interface Message {
  id?: string;
  chatId: string; // ID único del chat entre dos usuarios
  senderId: string;
  receiverId: string;
  text: string;
  imageUrl?: string;
  createdAt: Date;
  read: boolean;
  senderName?: string;
  senderPhoto?: string;
}

export interface Chat {
  id?: string;
  participants: string[]; // Array con los UIDs de los participantes
  participantsData?: {
    [uid: string]: {
      displayName: string;
      photoURL?: string;
      role: string;
    }
  };
  lastMessage?: string;
  lastMessageTime?: Date;
  unreadCount?: {
    [uid: string]: number; // Contador de mensajes no leídos por usuario
  };
  createdAt: Date;
  updatedAt: Date;
}