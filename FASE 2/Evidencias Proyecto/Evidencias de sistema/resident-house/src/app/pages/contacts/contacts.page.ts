import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { 
  IonContent, 
  IonHeader, 
  IonTitle, 
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonList,
  IonItem,
  IonLabel,
  IonAvatar,
  IonBadge,
  IonIcon,
  IonSpinner
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { peopleOutline } from 'ionicons/icons';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-contacts',
  templateUrl: './contacts.page.html',
  styleUrls: ['./contacts.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonList,
    IonItem,
    IonLabel,
    IonAvatar,
    IonBadge,
    IonIcon,
    IonSpinner
  ]
})
export class ContactsPage implements OnInit {
  contacts: User[] = [];
  loading: boolean = true;
  currentUser: User | null = null;

  constructor(
    private router: Router,
    private authService: AuthService,
    private userService: UserService
  ) {
    addIcons({ peopleOutline });
  }

  async ngOnInit() {
    await this.loadCurrentUser();
    await this.loadContacts();
  }

  ionViewWillEnter() {
    // Recargar contactos cada vez que se entre a la página
    this.loadContacts();
  }

  async loadCurrentUser() {
    this.currentUser = await this.authService.getCurrentUserData();
    console.log('=== PÁGINA DE CONTACTOS ===');
    console.log('Usuario actual:', this.currentUser?.displayName);
    console.log('UID del usuario actual:', this.currentUser?.uid);
  }

  async loadContacts() {
    this.loading = true;
    try {
      console.log('Cargando todos los usuarios...');
      
      // Obtener todos los usuarios
      const allUsers = await this.userService.getAllUsers();
      console.log('Total de usuarios en la BD:', allUsers.length);
      console.log('Lista completa:', allUsers.map(u => ({ name: u.displayName, uid: u.uid })));
      
      // Filtrar para excluir al usuario actual
      console.log('Filtrando usuario actual con UID:', this.currentUser?.uid);
      this.contacts = allUsers.filter(user => {
        const isDifferent = user.uid !== this.currentUser?.uid;
        console.log(`Usuario ${user.displayName} (${user.uid}): ${isDifferent ? 'INCLUIR' : 'EXCLUIR'}`);
        return isDifferent;
      });
      
      console.log('Contactos después del filtro:', this.contacts.length);
      console.log('Lista de contactos:', this.contacts.map(c => c.displayName));
      
      // Eliminar duplicados basándose en el UID
      const uniqueContacts = new Map<string, User>();
      this.contacts.forEach(contact => {
        if (!uniqueContacts.has(contact.uid)) {
          uniqueContacts.set(contact.uid, contact);
        }
      });
      
      this.contacts = Array.from(uniqueContacts.values());
      
      console.log('Contactos únicos finales:', this.contacts.length);
    } catch (error) {
      console.error('Error cargando contactos:', error);
    } finally {
      this.loading = false;
    }
  }

  openChat(contact: User) {
    console.log('=== ABRIENDO CHAT ===');
    console.log('Usuario actual:', this.currentUser?.displayName);
    console.log('Contacto seleccionado:', contact.displayName);
    console.log('UID del contacto:', contact.uid);
    this.router.navigate(['/chat', contact.uid]);
  }
}