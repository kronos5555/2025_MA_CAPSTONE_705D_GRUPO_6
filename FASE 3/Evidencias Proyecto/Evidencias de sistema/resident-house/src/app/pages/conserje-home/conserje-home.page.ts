import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { 
  IonContent, 
  IonHeader, 
  IonTitle, 
  IonToolbar,
  IonButtons,
  IonButton,
  IonIcon,
  IonCard,
  IonCardContent,
  AlertController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  logOutOutline, 
  chevronForwardOutline, 
  chatbubbles, 
  megaphone,
  clipboard
} from 'ionicons/icons';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-conserje-home',
  templateUrl: './conserje-home.page.html',
  styleUrls: ['./conserje-home.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButtons,
    IonButton,
    IonIcon,
    IonCard,
    IonCardContent
  ]
})
export class ConserjeHomePage implements OnInit {
  user: User | null = null;

  constructor(
    private router: Router,
    private authService: AuthService,
    private alertController: AlertController
  ) {
    addIcons({ 
      logOutOutline, 
      chevronForwardOutline, 
      chatbubbles, 
      megaphone,
      clipboard
    });
  }

  async ngOnInit() {
    await this.loadUserData();
  }

  async loadUserData() {
    this.user = await this.authService.getCurrentUserData();
  }

  goToProfile() {
    this.router.navigate(['/profile']);
  }

  goToContacts() {
    this.router.navigate(['/contacts']);
  }

  goToAnuncios() {
    this.router.navigate(['/anuncios']);
  }

  goToBitacora() {
    this.router.navigate(['/bitacora']);
  }

  async logout() {
    const alert = await this.alertController.create({
      header: 'Cerrar Sesión',
      message: '¿Estás seguro que deseas salir?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Salir',
          handler: async () => {
            await this.authService.logout();
            this.router.navigate(['/welcome']);
          }
        }
      ]
    });

    await alert.present();
  }
}