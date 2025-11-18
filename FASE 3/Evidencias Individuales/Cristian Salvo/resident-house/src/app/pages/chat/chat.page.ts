import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { 
  IonContent, 
  IonHeader, 
  IonTitle, 
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonFooter,
  IonTextarea,
  IonButton,
  IonIcon,
  IonAvatar,
  IonSpinner
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { send, chatbubblesOutline } from 'ionicons/icons';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { ChatService } from '../../services/chat.service';
import { User } from '../../models/user.model';
import { Message } from '../../models/message.model';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonFooter,
    IonTextarea,
    IonButton,
    IonIcon,
    IonAvatar,
    IonSpinner
  ]
})
export class ChatPage implements OnInit {
  @ViewChild(IonContent) content!: IonContent;

  otherUserId: string = '';
  otherUser: User | null = null;
  currentUserId: string = '';
  currentUser: User | null = null;
  chatId: string = '';
  messages: Message[] = [];
  newMessage: string = '';
  loading: boolean = true;
  sending: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private userService: UserService,
    private chatService: ChatService
  ) {
    addIcons({ send, chatbubblesOutline });
  }

  async ngOnInit() {
    try {
      // Obtener ID del otro usuario desde la URL
      this.otherUserId = this.route.snapshot.paramMap.get('userId') || '';
      
      if (!this.otherUserId) {
        console.error('No se proporcionó userId');
        return;
      }

      console.log('=== INICIANDO CHAT ===');
      console.log('Other User ID desde URL:', this.otherUserId);
      
      // Obtener usuario actual
      this.currentUserId = this.authService.getCurrentUserId() || '';
      console.log('Current User ID:', this.currentUserId);
      
      if (!this.currentUserId) {
        console.error('Usuario no autenticado');
        return;
      }

      // Cargar datos del usuario actual
      this.currentUser = await this.authService.getCurrentUserData();
      console.log('Usuario actual cargado:', this.currentUser?.displayName);
      
      // Cargar datos del OTRO usuario (con quien estamos chateando)
      await this.loadOtherUser();
      console.log('Otro usuario cargado:', this.otherUser?.displayName);
      
      // Verificar que sean usuarios diferentes
      if (this.currentUserId === this.otherUserId) {
        console.error('No puedes chatear contigo mismo');
        return;
      }
      
      // Crear o obtener chat
      await this.loadChat();
      
      // Cargar mensajes en tiempo real
      this.loadMessages();
    } catch (error) {
      console.error('Error en ngOnInit:', error);
      this.loading = false;
    }
  }

  async loadOtherUser() {
    this.otherUser = await this.userService.getUserById(this.otherUserId);
    console.log('Datos del otro usuario:', this.otherUser);
  }

  async loadChat() {
    this.chatId = await this.chatService.getOrCreateChat(this.currentUserId, this.otherUserId);
    console.log('Chat ID:', this.chatId);
  }

  loadMessages() {
    this.chatService.getMessages(this.chatId).subscribe(messages => {
      this.messages = messages;
      this.loading = false;
      
      console.log('Mensajes cargados:', messages.length);
      
      // Scroll al final cuando lleguen nuevos mensajes
      setTimeout(() => {
        this.scrollToBottom();
      }, 100);

      // Marcar mensajes como leídos
      if (messages.length > 0) {
        this.chatService.markMessagesAsRead(this.chatId, this.currentUserId);
      }
    });
  }

  async sendMessage() {
    if (!this.newMessage.trim() || this.sending) return;

    this.sending = true;
    const messageText = this.newMessage.trim();
    this.newMessage = ''; // Limpiar input inmediatamente

    try {
      console.log('Enviando mensaje:', messageText);
      console.log('De:', this.currentUser?.displayName);
      console.log('Para:', this.otherUser?.displayName);
      
      await this.chatService.sendMessage(
        this.chatId,
        this.currentUserId,
        this.otherUserId,
        messageText,
        this.currentUser?.displayName || 'Usuario',
        this.currentUser?.photoURL
      );

      console.log('Mensaje enviado correctamente');

      // Scroll al final
      setTimeout(() => {
        this.scrollToBottom();
      }, 100);
    } catch (error) {
      console.error('Error enviando mensaje:', error);
      this.newMessage = messageText; // Restaurar mensaje si falla
    } finally {
      this.sending = false;
    }
  }

  scrollToBottom() {
    this.content.scrollToBottom(300);
  }
}